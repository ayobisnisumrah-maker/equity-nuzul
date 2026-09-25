drop policy if exists "admins manage cash" on public.cash_transactions;
create policy "cash permission manages cash" on public.cash_transactions for all to authenticated
using(public.has_admin_permission('kasir'))
with check(public.has_admin_permission('kasir'));

drop policy if exists "admins manage finance" on public.finance_entries;
create policy "finance permission manages finance" on public.finance_entries for all to authenticated
using(public.has_admin_permission('keuangan'))
with check(public.has_admin_permission('keuangan'));

drop policy if exists "admins manage documents" on public.portal_documents;
create policy "document permission manages documents" on public.portal_documents for all to authenticated
using(public.has_admin_permission('dokumen'))
with check(public.has_admin_permission('dokumen'));

drop policy if exists "admins upload portal documents" on storage.objects;
create policy "document permission uploads portal documents" on storage.objects for insert to authenticated
with check(bucket_id='portal-documents' and public.has_admin_permission('dokumen'));

drop policy if exists "admins update portal documents" on storage.objects;
create policy "document permission updates portal documents" on storage.objects for update to authenticated
using(bucket_id='portal-documents' and public.has_admin_permission('dokumen'))
with check(bucket_id='portal-documents' and public.has_admin_permission('dokumen'));

drop policy if exists "admins delete portal documents" on storage.objects;
create policy "document permission deletes portal documents" on storage.objects for delete to authenticated
using(bucket_id='portal-documents' and public.has_admin_permission('dokumen'));
