-- Allow cleanup only for upload objects that failed registration.
-- Registered/finalized evidence remains protected by the existing policies.
create policy payment_proofs_admin_delete_unregistered_own
on storage.objects for delete to authenticated
using (
 bucket_id='profit-distribution-proofs'
 and owner_id=(select auth.uid())::text
 and app.has_permission('profit_distribution_payments.upload_proof')
 and not exists(
  select 1 from public.profit_distribution_payment_proofs pp
  where pp.storage_bucket=objects.bucket_id and pp.storage_path=objects.name
 )
);

create policy finance_expense_receipts_admin_delete_unregistered_own
on storage.objects for delete to authenticated
using (
 bucket_id='company-documents'
 and name like 'finance/expenses/%'
 and owner_id=(select auth.uid())::text
 and app.has_permission('finance_expenses.record')
 and not exists(
  select 1 from public.media_assets m
  where m.bucket=objects.bucket_id and m.path=objects.name
 )
);
