-- Keep a profit distribution bound to the offering and canonical totals it was created from.
create or replace function app.guard_profit_distribution_snapshot_transition()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_period_start date;v_period_end date;v_period_status public.period_status;v_report_status public.publication_status;v_version_status public.publication_status;v_revenue numeric(20,2);v_expenses numeric(20,2);v_operating_profit numeric(20,2);v_opex numeric(20,2);v_profit numeric(20,2);v_pool numeric(20,2);v_actual_bps integer;v_snapshot_changed boolean;v_economics_changed boolean;
begin
 if tg_op='INSERT' then
  if new.financial_report_version_id is null then raise exception 'Profit distribution requires an authoritative financial report snapshot.' using errcode='23514';end if;
  if new.status<>'draft' then raise exception 'New profit distributions must start in draft status.' using errcode='23514';end if;
 else
  v_snapshot_changed:=new.financial_report_version_id is distinct from old.financial_report_version_id;
  v_economics_changed:=new.period_start is distinct from old.period_start or new.period_end is distinct from old.period_end or new.revenue_amount is distinct from old.revenue_amount or new.operating_expense_amount is distinct from old.operating_expense_amount or new.opex_rate_bps is distinct from old.opex_rate_bps or new.opex_amount is distinct from old.opex_amount or new.profit_amount is distinct from old.profit_amount or new.company_share_bps is distinct from old.company_share_bps or new.investor_pool_bps is distinct from old.investor_pool_bps or new.investor_pool_amount is distinct from old.investor_pool_amount;
  if new.offering_id is distinct from old.offering_id then raise exception 'Profit distribution offering is immutable once assigned.' using errcode='23514';end if;
  if old.financial_report_version_id is not null and v_snapshot_changed then raise exception 'Financial report snapshot reference is immutable once assigned.' using errcode='23514';end if;
  if old.status not in('draft','review') and v_economics_changed then raise exception 'Profit distribution economics are immutable after review.' using errcode='23514';end if;
 end if;
 if new.opex_rate_bps<>1000 then raise exception 'Equity program OPEX rate must be 10 percent (1000 bps).' using errcode='23514';end if;
 select fp.starts_on,fp.ends_on,fp.status,fr.status,fv.status into v_period_start,v_period_end,v_period_status,v_report_status,v_version_status from public.financial_report_versions fv join public.financial_reports fr on fr.id=fv.financial_report_id join public.financial_periods fp on fp.id=fr.financial_period_id where fv.id=new.financial_report_version_id and fr.status='published' and fr.published_version_id=fv.id;
 if v_period_start is null or v_report_status<>'published' or v_version_status<>'published' then raise exception 'Financial report version must be the currently published snapshot.' using errcode='23514';end if;
 if v_period_status not in('closed','locked') then raise exception 'Financial period must be closed before profit distribution reconciliation.' using errcode='23514';end if;
 if new.period_start is distinct from v_period_start or new.period_end is distinct from v_period_end then raise exception 'Profit distribution period must exactly match its financial report snapshot period.' using errcode='23514';end if;
 select max(amount) filter(where line_key='revenue_total'),max(amount) filter(where line_key='expense_total') into v_revenue,v_expenses from public.financial_line_items where financial_report_version_id=new.financial_report_version_id;
 if v_revenue is null or v_expenses is null then raise exception 'Published financial report must contain canonical revenue_total and expense_total line items.' using errcode='23514';end if;
 v_operating_profit:=greatest(v_revenue-v_expenses,0);v_opex:=round(v_operating_profit*new.opex_rate_bps/10000.0,2);v_profit:=greatest(v_operating_profit-v_opex,0);
 v_actual_bps:=app.eligible_ownership_bps_at_cutoff(new.offering_id,((new.period_end+1)::timestamp at time zone 'UTC'));
 if v_actual_bps>new.investor_pool_bps then raise exception 'Eligible investor ownership (%) exceeds distribution investor cap (%).',v_actual_bps,new.investor_pool_bps using errcode='23514';end if;
 v_pool:=round(v_profit*v_actual_bps/10000.0,2);
 if new.revenue_amount<>v_revenue or new.operating_expense_amount<>v_expenses or new.opex_amount<>v_opex or new.profit_amount<>v_profit or new.investor_pool_amount<>v_pool then raise exception 'Profit distribution no longer reconciles with its financial report snapshot.' using errcode='23514';end if;
 return new;
end $$;
