-- Use the reconciled canonical report totals as the only accounting basis for profit distributions.
-- This prevents detail rows plus summary rows from being double-counted.
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
 v_actual_bps:=app.eligible_ownership_bps_at_cutoff(p_offering_id,((v_period_end+1)::timestamp at time zone 'UTC'));
 if v_actual_bps>p_investor_pool_bps then raise exception 'Eligible investor ownership (%) exceeds distribution investor cap (%).',v_actual_bps,p_investor_pool_bps using errcode='23514';end if;
 if exists(select 1 from public.profit_distributions where offering_id=p_offering_id and status<>'cancelled' and daterange(period_start,period_end,'[]')&&daterange(v_period_start,v_period_end,'[]')) then raise exception 'Distribution period overlaps an existing distribution for this offering.' using errcode='23505';end if;
 insert into public.profit_distributions(offering_id,financial_report_version_id,period_start,period_end,revenue_amount,operating_expense_amount,opex_rate_bps,opex_amount,profit_amount,company_share_bps,investor_pool_bps,investor_pool_amount,status,notes,created_by,updated_by)
 values(p_offering_id,p_financial_report_version_id,v_period_start,v_period_end,v_revenue,v_expenses,1000,v_opex,v_profit,p_company_share_bps,p_investor_pool_bps,round(v_profit*v_actual_bps/10000.0,2),'draft',nullif(btrim(coalesce(p_notes,'')),''),auth.uid(),auth.uid()) returning * into v_row;
 return v_row;
end $function$

