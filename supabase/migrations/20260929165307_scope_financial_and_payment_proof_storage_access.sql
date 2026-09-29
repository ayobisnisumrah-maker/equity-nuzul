drop policy if exists company_documents_admin_insert on storage.objects;
create policy company_documents_admin_insert on storage.objects for insert to authenticated with check (bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.update'));
drop policy if exists company_documents_admin_select on storage.objects;
create policy company_documents_admin_select on storage.objects for select to authenticated using (bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.view'));
drop policy if exists company_documents_admin_update on storage.objects;
create policy company_documents_admin_update on storage.objects for update to authenticated using (bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.update')) with check (bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.update'));
drop policy if exists company_documents_admin_delete on storage.objects;
create policy company_documents_admin_delete on storage.objects for delete to authenticated using (bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.update'));

create policy finance_payment_proofs_admin_insert on storage.objects for insert to authenticated with check (bucket_id='company-documents' and name like 'finance/%' and app.has_permission('finance_payments.reconcile'));
create policy finance_payment_proofs_admin_select on storage.objects for select to authenticated using (bucket_id='company-documents' and name like 'finance/%' and app.has_permission('finance_payments.reconcile'));
create policy finance_payment_proofs_admin_delete on storage.objects for delete to authenticated using (bucket_id='company-documents' and name like 'finance/%' and app.has_permission('finance_payments.reconcile'));

create policy financial_documents_admin_insert on storage.objects for insert to authenticated with check (bucket_id='financial-documents' and (storage.foldername(name))[1]=auth.uid()::text and app.has_permission('financial_reports.update'));
create policy financial_documents_admin_select on storage.objects for select to authenticated using (bucket_id='financial-documents' and app.has_permission('financial_reports.view'));
create policy financial_documents_admin_delete_unfinalized on storage.objects for delete to authenticated using (bucket_id='financial-documents' and (storage.foldername(name))[1]=auth.uid()::text and app.has_permission('financial_reports.update') and not exists (select 1 from public.media_assets a where a.bucket='financial-documents' and a.path=name and a.finalized_at is not null));
