create or replace function public.get_investor_sales_summary()
returns table(invoice_count bigint,total_sales numeric,payments_received numeric,refunds numeric,outstanding numeric,net_cash numeric,paid_count bigint,dp_count bigint,refunded_count bigint,cancelled_count bigint,pax numeric)
language plpgsql security definer set search_path=''
as $$
declare v_investor_id uuid:=app.current_investor_id();
begin
 if v_investor_id is null then raise exception 'Investor access required' using errcode='42501'; end if;
 return query
 with inv as (
   select count(*) filter(where f.status not in('draft','void'))::bigint as invoice_count,
          coalesce(sum(case when f.status not in('draft','void') then f.grand_total else 0 end),0)::numeric as total_sales,
          coalesce(sum(case when f.status not in('draft','void') then f.paid_total else 0 end),0)::numeric as payments_received,
          coalesce(sum(case when f.status not in('draft','void') then f.refunded_total else 0 end),0)::numeric as refunds,
          coalesce(sum(case when f.status not in('draft','void') then greatest(f.grand_total-greatest(f.paid_total-f.refunded_total,0),0) else 0 end),0)::numeric as outstanding,
          count(*) filter(where f.status='paid')::bigint as paid_count,
          count(*) filter(where f.status='partially_paid')::bigint as dp_count,
          count(*) filter(where f.status not in('draft','void') and f.refunded_total>0)::bigint as refunded_count,
          count(*) filter(where f.status='void')::bigint as cancelled_count
   from public.finance_invoices f
 ),px as (
   select coalesce(sum(i.quantity),0)::numeric as pax
   from public.finance_invoice_items i join public.finance_invoices f on f.id=i.invoice_id
   where f.status not in('draft','void') and lower(coalesce(i.unit_label,''))='pax'
 )
 select inv.invoice_count,inv.total_sales,inv.payments_received,inv.refunds,inv.outstanding,
        (inv.payments_received-inv.refunds)::numeric,inv.paid_count,inv.dp_count,inv.refunded_count,inv.cancelled_count,px.pax
 from inv cross join px;
end $$;
revoke all on function public.get_investor_sales_summary() from public,anon;
grant execute on function public.get_investor_sales_summary() to authenticated,service_role;
