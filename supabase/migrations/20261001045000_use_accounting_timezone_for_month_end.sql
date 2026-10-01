-- Cash accounting dates use the company's explicit timezone, not the PostgreSQL session timezone (UTC).
alter table public.finance_settings add column if not exists accounting_timezone text not null default 'Asia/Makassar';
update public.finance_settings set accounting_timezone='Asia/Makassar' where singleton=true;

create or replace function app.accounting_timezone()
returns text language plpgsql stable security definer set search_path='' as $$
declare v text;
begin
 select accounting_timezone into v from public.finance_settings where singleton=true limit 1;
 v:=coalesce(nullif(btrim(v),''),'Asia/Makassar');
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=v) then raise exception 'Invalid accounting timezone: %',v using errcode='22023';end if;
 return v;
end $$;
create or replace function app.accounting_date(p_at timestamptz)
returns date language sql stable security definer set search_path='' as $$
 select (p_at at time zone app.accounting_timezone())::date
$$;
revoke all on function app.accounting_timezone() from public,anon,authenticated;
revoke all on function app.accounting_date(timestamptz) from public,anon,authenticated;
grant execute on function app.accounting_timezone() to service_role;
grant execute on function app.accounting_date(timestamptz) to service_role;

create or replace function app.guard_finance_payment_cash_period()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='confirmed' and (old.status is distinct from 'confirmed' or old.received_at is distinct from new.received_at) then
  if new.received_at is null or new.received_at>now()+interval '5 minutes' then raise exception 'Payment received_at is invalid.' using errcode='23514';end if;
  perform app.assert_financial_cash_date_open(app.accounting_date(new.received_at));
 end if; return new;
end $$;
create or replace function app.guard_finance_refund_cash_period()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='processed' then perform app.assert_financial_cash_date_open(app.accounting_date(coalesce(new.processed_at,now())));end if; return new;
end $$;

create or replace function app.financial_report_cash_reconciliation(p_report_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.financial_reports%rowtype;fp public.financial_periods%rowtype;v_id uuid;v_pay numeric(20,2);v_ref numeric(20,2);v_net numeric(20,2);v_exp numeric(20,2);v_rep_rev numeric(20,2);v_rep_exp numeric(20,2);
begin
 if not (app.has_permission('financial_reports.view') or app.has_permission('financial_reports.update')) then raise exception 'Missing financial report permission.' using errcode='42501';end if;
 select * into r from public.financial_reports where id=p_report_id;if r.id is null or r.current_version_id is null then raise exception 'Financial report not found.' using errcode='P0002';end if;
 select * into fp from public.financial_periods where id=r.financial_period_id;perform app.assert_canonical_financial_period(fp.id);v_id:=r.current_version_id;
 select coalesce(sum(amount),0) into v_pay from public.finance_payments where status='confirmed' and received_at is not null and app.accounting_date(received_at) between fp.starts_on and fp.ends_on;
 select coalesce(sum(amount),0) into v_ref from public.finance_refunds where status='processed' and processed_at is not null and app.accounting_date(processed_at) between fp.starts_on and fp.ends_on;
 select coalesce(sum(total_amount),0) into v_exp from public.finance_expenses where status='recorded' and expense_on between fp.starts_on and fp.ends_on;v_net:=greatest(v_pay-v_ref,0);
 select coalesce(max(amount) filter(where line_key='revenue_total'),0),coalesce(max(amount) filter(where line_key='expense_total'),0) into v_rep_rev,v_rep_exp from public.financial_line_items where financial_report_version_id=v_id;
 return jsonb_build_object('period_start',fp.starts_on,'period_end',fp.ends_on,'accounting_timezone',app.accounting_timezone(),'confirmed_payments',v_pay,'processed_refunds',v_ref,'net_receipts',v_net,'recorded_expenses',v_exp,'reported_revenue',v_rep_rev,'reported_expenses',v_rep_exp,'revenue_matches',v_rep_rev=v_net,'expenses_match',v_rep_exp=v_exp,'reconciled',v_rep_rev=v_net and v_rep_exp=v_exp);
end $$;

create or replace function app.close_financial_period(p_period_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare fp public.financial_periods%rowtype;
begin
 if not app.has_permission('financial_periods.close') then raise exception 'Missing permission: financial_periods.close' using errcode='42501';end if;
 select * into fp from public.financial_periods where id=p_period_id for update;if fp.id is null then raise exception 'Financial period not found.' using errcode='P0002';end if;
 perform app.assert_canonical_financial_period(fp.id);
 if fp.status<>'open' then raise exception 'Only open financial periods can be closed.' using errcode='23514';end if;
 if fp.ends_on>=app.accounting_date(now()) then raise exception 'Financial period can only be closed after its end date (%).',fp.ends_on using errcode='23514';end if;
 if exists(select 1 from public.finance_payments p where p.status='pending' and p.received_at is not null and app.accounting_date(p.received_at) between fp.starts_on and fp.ends_on) then raise exception 'Financial period has pending payments.' using errcode='23514';end if;
 if exists(select 1 from public.finance_refunds r join public.finance_payments p on p.id=r.payment_id where r.status in('requested','approved') and p.received_at is not null and app.accounting_date(p.received_at) between fp.starts_on and fp.ends_on) then raise exception 'Financial period has unresolved refund requests for payments received in this period.' using errcode='23514';end if;
 if exists(select 1 from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status in('draft','review')) then raise exception 'Financial period has an unfinished financial report workflow.' using errcode='23514';end if;
 update public.financial_periods set status='closed',updated_at=now() where id=fp.id;
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'financial_period.closed','financial_period',fp.id,'Financial period closed.',jsonb_build_object('starts_on',fp.starts_on,'ends_on',fp.ends_on,'accounting_timezone',app.accounting_timezone()));
end $$;
