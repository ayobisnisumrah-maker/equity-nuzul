drop policy if exists company_documents_admin_update on storage.objects;
drop policy if exists company_documents_admin_delete on storage.objects;
create policy company_documents_admin_delete_unregistered_only on storage.objects for delete to authenticated using(bucket_id='company-documents' and name not like 'finance/%' and app.has_permission('documents.update') and not exists(select 1 from public.media_assets m where m.bucket=bucket_id and m.path=name));
