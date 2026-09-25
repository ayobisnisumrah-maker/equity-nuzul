create policy "investors read aggregate sales source" on public.sales_invoices for select to authenticated
using(exists(select 1 from public.investor_profiles i where i.user_id=auth.uid() and i.status='approved'));
create policy "investors read aggregate payment source" on public.sales_payments for select to authenticated
using(exists(select 1 from public.investor_profiles i where i.user_id=auth.uid() and i.status='approved'));
