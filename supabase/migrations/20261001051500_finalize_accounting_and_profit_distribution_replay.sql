-- Canonical replay finalizer. These definitions intentionally mirror production after all 2026-10-01 hardening migrations.
alter table public.finance_settings add column if not exists accounting_timezone text not null default 'Asia/Makassar';

create or replace function app.accounting_timezone()
returns text language plpgsql stable security definer set search_path='' as $$
declare v text;
begin
 select accounting_timezone into v from public.finance_settings where singleton=true limit 1;
 v:=coalesce(nullif(btrim(v),''),'Asia/Makassar');
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=v) then raise exception 'Invalid accounting timezone: %',v using errcode='22023';end if;
 return v;
end $$;
create or replace function app.accounting_date(p_at timestamptz) returns date language sql stable security definer set search_path='' as $$select (p_at at time zone app.accounting_timezone())::date$$;
create or replace function app.accounting_period_cutoff(p_period_end date) returns timestamptz language sql stable security definer set search_path='' as $$select ((p_period_end+1)::timestamp at time zone app.accounting_timezone())$$;
revoke all on function app.accounting_timezone() from public,anon,authenticated;
revoke all on function app.accounting_date(timestamptz) from public,anon,authenticated;
revoke all on function app.accounting_period_cutoff(date) from public,anon,authenticated;
grant execute on function app.accounting_timezone() to service_role;
grant execute on function app.accounting_date(timestamptz) to service_role;
grant execute on function app.accounting_period_cutoff(date) to service_role;

CREATE OR REPLACE FUNCTION app.close_financial_period(p_period_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$


CREATE OR REPLACE FUNCTION app.create_profit_distribution(p_offering_id uuid, p_financial_report_version_id uuid, p_company_share_bps integer DEFAULT 6000, p_investor_pool_bps integer DEFAULT 4000, p_notes text DEFAULT NULL::text)
 RETURNS profit_distributions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_row public.profit_distributions%rowtype;v_period_id uuid;v_period_start date;v_period_end date;v_period_status public.period_status;v_report_status public.publication_status;v_version_status public.publication_status;v_revenue numeric(20,2);v_expenses numeric(20,2);v_operating_profit numeric(20,2);v_opex numeric(20,2);v_profit numeric(20,2);v_actual_bps integer;
begin
 if not app.has_permission('profit_distributions.create') then raise exception 'Missing permission: profit_distributions.create' using errcode='42501';end if;
 if p_company_share_bps<0 or p_investor_pool_bps<0 or p_company_share_bps+p_investor_pool_bps<>10000 then raise exception 'Company and investor pool shares must total 10000 bps.' using errcode='23514';end if;
 perform 1 from public.ownership_offerings where id=p_offering_id and status<>'archived' for share;if not found then raise exception 'Ownership offering not found or archived.' using errcode='P0002';end if;
 select fp.id,fp.starts_on,fp.ends_on,fp.status,fr.status,fv.status into v_period_id,v_period_start,v_period_end,v_period_status,v_report_status,v_version_status from public.financial_report_versions fv join public.financial_reports fr on fr.id=fv.financial_report_id join public.financial_periods fp on fp.id=fr.financial_period_id where fv.id=p_financial_report_version_id and fr.status='published' and fr.published_version_id=fv.id for share of fv,fr,fp;
 if v_period_id is null or v_report_status<>'published' or v_version_status<>'published' then raise exception 'Financial report version must be the published snapshot.' using errcode='23514';end if;
 if v_period_status not in('closed','locked') then raise exception 'Financial period must be closed before profit distribution.' using errcode='23514';end if;
 select max(amount) filter(where line_key='revenue_total'),max(amount) filter(where line_key='expense_total') into v_revenue,v_expenses from public.financial_line_items where financial_report_version_id=p_financial_report_version_id;
 if v_revenue is null or v_expenses is null then raise exception 'Published financial report must contain canonical revenue_total and expense_total line items.' using errcode='23514';end if;
 v_operating_profit:=greatest(v_revenue-v_expenses,0);v_opex:=round(v_operating_profit*1000/10000.0,2);v_profit:=greatest(v_operating_profit-v_opex,0);
 v_actual_bps:=app.eligible_ownership_bps_at_cutoff(p_offering_id,app.accounting_period_cutoff(v_period_end));
 if v_actual_bps>p_investor_pool_bps then raise exception 'Eligible investor ownership (%) exceeds distribution investor cap (%).',v_actual_bps,p_investor_pool_bps using errcode='23514';end if;
 if exists(select 1 from public.profit_distributions where offering_id=p_offering_id and status<>'cancelled' and daterange(period_start,period_end,'[]')&&daterange(v_period_start,v_period_end,'[]')) then raise exception 'Distribution period overlaps an existing distribution for this offering.' using errcode='23505';end if;
 insert into public.profit_distributions(offering_id,financial_report_version_id,period_start,period_end,revenue_amount,operating_expense_amount,opex_rate_bps,opex_amount,profit_amount,company_share_bps,investor_pool_bps,investor_pool_amount,status,notes,created_by,updated_by) values(p_offering_id,p_financial_report_version_id,v_period_start,v_period_end,v_revenue,v_expenses,1000,v_opex,v_profit,p_company_share_bps,p_investor_pool_bps,round(v_profit*v_actual_bps/10000.0,2),'draft',nullif(btrim(coalesce(p_notes,'')),''),auth.uid(),auth.uid()) returning * into v_row;return v_row;
end $function$


CREATE OR REPLACE FUNCTION app.guard_profit_distribution_snapshot_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_period_start date;v_period_end date;v_period_status public.period_status;v_report_status public.publication_status;v_version_status public.publication_status;v_revenue numeric(20,2);v_expenses numeric(20,2);v_operating_profit numeric(20,2);v_opex numeric(20,2);v_profit numeric(20,2);v_pool numeric(20,2);v_actual_bps integer;v_snapshot_changed boolean;v_economics_changed boolean;
begin
 if tg_op='INSERT' then if new.financial_report_version_id is null then raise exception 'Profit distribution requires an authoritative financial report snapshot.' using errcode='23514';end if;if new.status<>'draft' then raise exception 'New profit distributions must start in draft status.' using errcode='23514';end if;
 else v_snapshot_changed:=new.financial_report_version_id is distinct from old.financial_report_version_id;v_economics_changed:=new.period_start is distinct from old.period_start or new.period_end is distinct from old.period_end or new.revenue_amount is distinct from old.revenue_amount or new.operating_expense_amount is distinct from old.operating_expense_amount or new.opex_rate_bps is distinct from old.opex_rate_bps or new.opex_amount is distinct from old.opex_amount or new.profit_amount is distinct from old.profit_amount or new.company_share_bps is distinct from old.company_share_bps or new.investor_pool_bps is distinct from old.investor_pool_bps or new.investor_pool_amount is distinct from old.investor_pool_amount;
  if new.offering_id is distinct from old.offering_id then raise exception 'Profit distribution offering is immutable once assigned.' using errcode='23514';end if;if old.financial_report_version_id is not null and v_snapshot_changed then raise exception 'Financial report snapshot reference is immutable once assigned.' using errcode='23514';end if;if old.status not in('draft','review') and v_economics_changed then raise exception 'Profit distribution economics are immutable after review.' using errcode='23514';end if;end if;
 if new.opex_rate_bps<>1000 then raise exception 'Equity program OPEX rate must be 10 percent (1000 bps).' using errcode='23514';end if;
 select fp.starts_on,fp.ends_on,fp.status,fr.status,fv.status into v_period_start,v_period_end,v_period_status,v_report_status,v_version_status from public.financial_report_versions fv join public.financial_reports fr on fr.id=fv.financial_report_id join public.financial_periods fp on fp.id=fr.financial_period_id where fv.id=new.financial_report_version_id and fr.status='published' and fr.published_version_id=fv.id;
 if v_period_start is null or v_report_status<>'published' or v_version_status<>'published' then raise exception 'Financial report version must be the currently published snapshot.' using errcode='23514';end if;if v_period_status not in('closed','locked') then raise exception 'Financial period must be closed before profit distribution reconciliation.' using errcode='23514';end if;if new.period_start is distinct from v_period_start or new.period_end is distinct from v_period_end then raise exception 'Profit distribution period must exactly match its financial report snapshot period.' using errcode='23514';end if;
 select max(amount) filter(where line_key='revenue_total'),max(amount) filter(where line_key='expense_total') into v_revenue,v_expenses from public.financial_line_items where financial_report_version_id=new.financial_report_version_id;if v_revenue is null or v_expenses is null then raise exception 'Published financial report must contain canonical revenue_total and expense_total line items.' using errcode='23514';end if;
 v_operating_profit:=greatest(v_revenue-v_expenses,0);v_opex:=round(v_operating_profit*new.opex_rate_bps/10000.0,2);v_profit:=greatest(v_operating_profit-v_opex,0);v_actual_bps:=app.eligible_ownership_bps_at_cutoff(new.offering_id,app.accounting_period_cutoff(new.period_end));if v_actual_bps>new.investor_pool_bps then raise exception 'Eligible investor ownership (%) exceeds distribution investor cap (%).',v_actual_bps,new.investor_pool_bps using errcode='23514';end if;v_pool:=round(v_profit*v_actual_bps/10000.0,2);
 if new.revenue_amount<>v_revenue or new.operating_expense_amount<>v_expenses or new.opex_amount<>v_opex or new.profit_amount<>v_profit or new.investor_pool_amount<>v_pool then raise exception 'Profit distribution no longer reconciles with its financial report snapshot.' using errcode='23514';end if;return new;
end $function$


CREATE OR REPLACE FUNCTION app.regenerate_profit_distribution_allocations(p_distribution_id uuid)
 RETURNS SETOF profit_distribution_allocations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_distribution public.profit_distributions%rowtype;v_offering public.ownership_offerings%rowtype;v_pool numeric(20,2);v_cutoff timestamptz;v_total_historical_bps integer;
begin
 if not app.has_permission('profit_distributions.update') then raise exception 'Anda tidak memiliki izin untuk memperbarui distribusi laba.' using errcode='42501';end if;
 select * into v_distribution from public.profit_distributions where id=p_distribution_id for update;if v_distribution.id is null then raise exception 'Distribusi laba tidak ditemukan.' using errcode='P0002';end if;
 if v_distribution.status not in('draft','review') then raise exception 'Alokasi hanya dapat dibuat ulang saat distribusi berstatus Draf atau Ditinjau.' using errcode='42501';end if;
 if exists(select 1 from public.profit_distribution_allocations where distribution_id=p_distribution_id and status in('payable','paid')) then raise exception 'Alokasi yang sudah menjadi kewajiban pembayaran tidak dapat dibuat ulang.' using errcode='42501';end if;
 select * into v_offering from public.ownership_offerings where id=v_distribution.offering_id for share;if v_offering.id is null then raise exception 'Penawaran kepemilikan tidak ditemukan.' using errcode='P0002';end if;if v_offering.unit_ownership_bps<=0 then raise exception 'Basis kepemilikan per unit pada penawaran tidak valid.' using errcode='23514';end if;
 v_cutoff:=app.accounting_period_cutoff(v_distribution.period_end);v_pool:=0;
 if exists(select 1 from public.ownership_holdings h where h.offering_id=v_distribution.offering_id and h.status='transferred' and h.acquisition_at<v_cutoff and not exists(select 1 from public.ownership_transfers t where t.holding_id=h.id and t.status='completed' and t.completed_at is not null) and not exists(select 1 from public.ownership_inheritance i where i.holding_id=h.id and i.status='completed' and i.completed_at is not null)) then raise exception 'Riwayat kepemilikan tidak dapat direkonstruksi karena holding yang dialihkan tidak memiliki transaksi penyelesaian.' using errcode='23514';end if;
 perform 1 from public.ownership_holdings h where h.offering_id=v_distribution.offering_id for share;perform 1 from public.ownership_transfers t join public.ownership_holdings h on h.id=t.holding_id where h.offering_id=v_distribution.offering_id and t.status='completed' for share of t;perform 1 from public.ownership_inheritance i join public.ownership_holdings h on h.id=i.holding_id where h.offering_id=v_distribution.offering_id and i.status='completed' for share of i;
 with movements as(select 'transfer'::text movement_kind,t.id,t.holding_id,t.units,t.completed_at from public.ownership_transfers t join public.ownership_holdings h on h.id=t.holding_id where h.offering_id=v_distribution.offering_id and t.status='completed' and t.completed_at is not null union all select 'inheritance'::text,i.id,i.holding_id,i.units,i.completed_at from public.ownership_inheritance i join public.ownership_holdings h on h.id=i.holding_id where h.offering_id=v_distribution.offering_id and i.status='completed' and i.completed_at is not null),sequenced as(select m.*,row_number() over(partition by m.holding_id order by m.completed_at desc,m.movement_kind desc,m.id desc) reverse_sequence from movements m),historical as(select h.id holding_id,h.investor_id,h.status holding_status,h.ownership_bps+coalesce(sum(case when m.completed_at>=v_cutoff and not(h.status='transferred' and m.reverse_sequence=1) then m.units*v_offering.unit_ownership_bps else 0 end),0)::integer ownership_bps_at_cutoff,max(m.completed_at) filter(where m.reverse_sequence=1) final_movement_at from public.ownership_holdings h left join sequenced m on m.holding_id=h.id where h.offering_id=v_distribution.offering_id and h.status in('active','transferred') and h.acquisition_at<v_cutoff group by h.id,h.investor_id,h.ownership_bps,h.status),eligible as(select * from historical where ownership_bps_at_cutoff>0 and(holding_status='active' or final_movement_at is null or final_movement_at>=v_cutoff)) select coalesce(sum(ownership_bps_at_cutoff),0)::integer into v_total_historical_bps from eligible;
 v_pool:=round((v_distribution.profit_amount*v_total_historical_bps/10000.0)::numeric,2);if v_total_historical_bps>v_distribution.investor_pool_bps then raise exception 'Kepemilikan historis (% bps) melebihi porsi investor pada distribusi (% bps).',v_total_historical_bps,v_distribution.investor_pool_bps using errcode='23514';end if;
 delete from public.profit_distribution_allocations where distribution_id=p_distribution_id;update public.profit_distributions set investor_pool_amount=v_pool,updated_by=auth.uid() where id=p_distribution_id;
 if v_pool>0 then insert into public.profit_distribution_allocations(distribution_id,holding_id,investor_id,ownership_bps,investor_pool_share_bps,allocation_amount,status)
 with movements as(select 'transfer'::text movement_kind,t.id,t.holding_id,t.units,t.completed_at from public.ownership_transfers t join public.ownership_holdings h on h.id=t.holding_id where h.offering_id=v_distribution.offering_id and t.status='completed' and t.completed_at is not null union all select 'inheritance'::text,i.id,i.holding_id,i.units,i.completed_at from public.ownership_inheritance i join public.ownership_holdings h on h.id=i.holding_id where h.offering_id=v_distribution.offering_id and i.status='completed' and i.completed_at is not null),sequenced as(select m.*,row_number() over(partition by m.holding_id order by m.completed_at desc,m.movement_kind desc,m.id desc) reverse_sequence from movements m),historical as(select h.id holding_id,h.investor_id,h.status holding_status,h.ownership_bps+coalesce(sum(case when m.completed_at>=v_cutoff and not(h.status='transferred' and m.reverse_sequence=1) then m.units*v_offering.unit_ownership_bps else 0 end),0)::integer ownership_bps_at_cutoff,max(m.completed_at) filter(where m.reverse_sequence=1) final_movement_at from public.ownership_holdings h left join sequenced m on m.holding_id=h.id where h.offering_id=v_distribution.offering_id and h.status in('active','transferred') and h.acquisition_at<v_cutoff group by h.id,h.investor_id,h.ownership_bps,h.status)
 select p_distribution_id,h.holding_id,h.investor_id,h.ownership_bps_at_cutoff,round(h.ownership_bps_at_cutoff::numeric*10000/v_distribution.investor_pool_bps)::integer,round(v_distribution.profit_amount*h.ownership_bps_at_cutoff/10000.0,2),'pending' from historical h where h.ownership_bps_at_cutoff>0 and(h.holding_status='active' or h.final_movement_at is null or h.final_movement_at>=v_cutoff) order by h.holding_id;end if;
 perform app.reconcile_profit_distribution_rounding(p_distribution_id);perform app.assert_profit_distribution_allocations(p_distribution_id);return query select * from public.profit_distribution_allocations where distribution_id=p_distribution_id order by created_at,id;
end;$function$
;
