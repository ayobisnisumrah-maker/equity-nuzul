-- Require reconciled cash, an approved report, and canonical RPC-only period transitions.
create or replace function app.guard_financial_period_update()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_authoritative boolean;
begin
 select exists(select 1 from public.financial_reports fr where fr.financial_period_id=old.id and fr.status='published')
     or exists(select 1 from public.profit_distributions pd join public.financial_report_versions fv on fv.id=pd.financial_report_version_id join public.financial_reports fr on fr.id=fv.financial_report_id where fr.financial_period_id=old.id) into v_authoritative;
 if v_authoritative and new.status='open' then raise exception 'Authoritative financial period cannot be open.' using errcode='42501';end if;
 if new.status is distinct from old.status then
  if current_setting('app.financial_period_transition',true) is distinct from 'allowed' then raise exception 'Financial period status must be changed through the canonical close/lock workflow.' using errcode='42501';end if;
  if not app.has_permission('financial_periods.close') then raise exception 'Changing financial period status requires financial_periods.close.' using errcode='42501';end if;
  if new.status in('closed','locked') and old.ends_on>=app.accounting_date(now()) then raise exception 'Financial period cannot be closed or locked before its end date (%).',old.ends_on using errcode='23514';end if;
  if old.status='open' and new.status='closed' then return new;end if;
  if old.status='closed' and new.status='locked' then return new;end if;
  raise exception 'Financial period status cannot move from % to %.',old.status,new.status using errcode='23514';
 end if;
 if old.status='locked' then raise exception 'Locked financial periods cannot be modified.' using errcode='42501';end if;
 if old.status='closed' and v_authoritative then raise exception 'Closed financial period is already authoritative and cannot be modified; lock it instead.' using errcode='42501';end if;
 if v_authoritative then raise exception 'Authoritative financial period metadata cannot be modified.' using errcode='42501';end if;
 if not app.has_permission('financial_periods.update') then raise exception 'Updating financial period metadata requires financial_periods.update.' using errcode='42501';end if;
 return new;
end $$;

create or replace function app.close_financial_period(p_period_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare fp public.financial_periods%rowtype;v_report public.financial_reports%rowtype;v_pay numeric(20,2);v_ref numeric(20,2);v_exp numeric(20,2);v_rep_rev numeric(20,2);v_rep_exp numeric(20,2);
begin
 if not app.has_permission('financial_periods.close') then raise exception 'Missing permission: financial_periods.close' using errcode='42501';end if;
 select * into fp from public.financial_periods where id=p_period_id for update;if fp.id is null then raise exception 'Financial period not found.' using errcode='P0002';end if;
 perform app.assert_canonical_financial_period(fp.id);
 if fp.status<>'open' then raise exception 'Only open financial periods can be closed.' using errcode='23514';end if;
 if fp.ends_on>=app.accounting_date(now()) then raise exception 'Financial period can only be closed after its end date (%).',fp.ends_on using errcode='23514';end if;
 if exists(select 1 from public.finance_payments p where p.status='pending' and p.received_at is not null and app.accounting_date(p.received_at) between fp.starts_on and fp.ends_on) then raise exception 'Financial period has pending payments.' using errcode='23514';end if;
 if exists(select 1 from public.finance_refunds r join public.finance_payments p on p.id=r.payment_id where r.status in('requested','approved') and p.received_at is not null and app.accounting_date(p.received_at) between fp.starts_on and fp.ends_on) then raise exception 'Financial period has unresolved refund requests.' using errcode='23514';end if;
 if exists(select 1 from public.finance_payments p left join public.finance_bank_reconciliations br on br.payment_id=p.id and br.status='matched' where p.status='confirmed' and p.received_at is not null and app.accounting_date(p.received_at) between fp.starts_on and fp.ends_on and (br.id is null or br.invoice_id is distinct from p.invoice_id or br.bank_amount is distinct from p.amount)) then raise exception 'Every confirmed payment in the period must have a matching bank reconciliation for the same invoice and amount.' using errcode='23514';end if;
 if exists(select 1 from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status in('draft','review')) then raise exception 'Financial period has an unfinished financial report workflow.' using errcode='23514';end if;
 select * into v_report from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status='approved' order by fr.updated_at desc limit 1 for update;
 if v_report.id is null or v_report.current_version_id is null then raise exception 'Financial period requires an approved financial report before close.' using errcode='23514';end if;
 select coalesce(sum(amount),0) into v_pay from public.finance_payments where status='confirmed' and received_at is not null and app.accounting_date(received_at) between fp.starts_on and fp.ends_on;
 select coalesce(sum(amount),0) into v_ref from public.finance_refunds where status='processed' and processed_at is not null and app.accounting_date(processed_at) between fp.starts_on and fp.ends_on;
 select coalesce(sum(total_amount),0) into v_exp from public.finance_expenses where status='recorded' and expense_on between fp.starts_on and fp.ends_on;
 select coalesce(max(amount) filter(where line_key='revenue_total'),0),coalesce(max(amount) filter(where line_key='expense_total'),0) into v_rep_rev,v_rep_exp from public.financial_line_items where financial_report_version_id=v_report.current_version_id;
 if v_rep_rev is distinct from greatest(v_pay-v_ref,0) or v_rep_exp is distinct from v_exp then raise exception 'Approved financial report no longer reconciles with canonical receipts/refunds/expenses.' using errcode='23514';end if;
 perform set_config('app.financial_period_transition','allowed',true);update public.financial_periods set status='closed',updated_at=now() where id=fp.id;perform set_config('app.financial_period_transition','',true);
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'financial_period.closed','financial_period',fp.id,'Financial period closed after bank and report reconciliation.',jsonb_build_object('starts_on',fp.starts_on,'ends_on',fp.ends_on,'accounting_timezone',app.accounting_timezone(),'confirmed_payments',v_pay,'processed_refunds',v_ref,'recorded_expenses',v_exp,'report_id',v_report.id));
end $$;

create or replace function app.lock_financial_period(p_period_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare fp public.financial_periods%rowtype;
begin
 if not app.has_permission('financial_periods.close') then raise exception 'Missing permission: financial_periods.close' using errcode='42501';end if;
 select * into fp from public.financial_periods where id=p_period_id for update;if fp.id is null then raise exception 'Financial period not found.' using errcode='P0002';end if;
 perform app.assert_canonical_financial_period(fp.id);
 if fp.status<>'closed' then raise exception 'Only closed financial periods can be locked.' using errcode='23514';end if;
 if not exists(select 1 from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status in('approved','published')) then raise exception 'Financial period requires an approved or published financial report before lock.' using errcode='23514';end if;
 perform set_config('app.financial_period_transition','allowed',true);update public.financial_periods set status='locked',updated_at=now() where id=fp.id;perform set_config('app.financial_period_transition','',true);
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'financial_period.locked','financial_period',fp.id,'Financial period locked.',jsonb_build_object('starts_on',fp.starts_on,'ends_on',fp.ends_on,'accounting_timezone',app.accounting_timezone()));
end $$;
revoke all on function app.lock_financial_period(uuid) from public,anon;
grant execute on function app.lock_financial_period(uuid) to authenticated,service_role;
