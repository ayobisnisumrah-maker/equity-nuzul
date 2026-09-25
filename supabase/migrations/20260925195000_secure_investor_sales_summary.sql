drop policy if exists "investors read aggregate sales source" on public.sales_invoices;
drop policy if exists "investors read aggregate payment source" on public.sales_payments;

create or replace function public.get_investor_sales_summary()
returns table(
 invoice_count bigint,
 total_sales numeric,
 payments_received numeric,
 refunds numeric,
 outstanding numeric,
 paid_count bigint,
 dp_count bigint,
 refunded_count bigint,
 pax bigint
)
language plpgsql
security definer
set search_path=public
as $$
begin
 if not exists(select 1 from public.investor_profiles i where i.user_id=auth.uid() and i.status='approved') then
   raise exception 'Akses investor ditolak';
 end if;
 return query
 select
   count(*)::bigint,
   coalesce(sum(si.total_amount),0)::numeric,
   coalesce((select sum(sp.amount) from public.sales_payments sp where sp.kind='payment'),0)::numeric,
   coalesce((select sum(sp.amount) from public.sales_payments sp where sp.kind='refund'),0)::numeric,
   coalesce(sum(greatest(si.total_amount-si.paid_amount,0)),0)::numeric,
   count(*) filter(where si.payment_status='paid')::bigint,
   count(*) filter(where si.payment_status in('dp','partial'))::bigint,
   count(*) filter(where si.payment_status in('refunded','partially_refunded'))::bigint,
   coalesce(sum(si.pax),0)::bigint
 from public.sales_invoices si;
end $$;
revoke all on function public.get_investor_sales_summary() from public;
grant execute on function public.get_investor_sales_summary() to authenticated;
