create or replace function app.financial_report_operational_reconciliation(p_report_id uuid)
returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare r public.financial_reports%rowtype;fp public.financial_periods%rowtype;v_id uuid;v_pax numeric(20,3);v_reported numeric;
begin
 if not (app.has_permission('financial_reports.view') or app.has_permission('financial_reports.update')) then raise exception 'Missing financial report permission.' using errcode='42501';end if;
 select * into r from public.financial_reports where id=p_report_id;if r.id is null or r.current_version_id is null then raise exception 'Financial report not found.' using errcode='P0002';end if;
 select * into fp from public.financial_periods where id=r.financial_period_id;perform app.assert_canonical_financial_period(fp.id);v_id:=r.current_version_id;
 with first_confirmed as(select invoice_id,min(received_at) first_received from public.finance_payments where status='confirmed' and received_at is not null group by invoice_id)
 select coalesce(sum(ii.quantity),0) into v_pax from first_confirmed fc join public.finance_invoices fi on fi.id=fc.invoice_id join public.finance_invoice_items ii on ii.invoice_id=fi.id and lower(ii.unit_label)='pax'
 where app.accounting_date(fc.first_received) between fp.starts_on and fp.ends_on and fi.status not in('draft','void') and greatest(fi.paid_total-fi.refunded_total,0)>0;
 select coalesce(max(value) filter(where kpi_key='pax_total'),0) into v_reported from public.financial_kpis where financial_report_version_id=v_id;
 return jsonb_build_object('period_start',fp.starts_on,'period_end',fp.ends_on,'accounting_timezone',app.accounting_timezone(),'canonical_pax',v_pax,'reported_pax',v_reported,'pax_matches',v_pax=v_reported);
end $$;