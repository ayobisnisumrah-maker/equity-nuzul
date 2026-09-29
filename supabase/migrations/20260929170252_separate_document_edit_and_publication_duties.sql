drop policy if exists documents_update_admin on public.documents;
create policy documents_update_admin on public.documents for update to authenticated using (app.has_permission('documents.update')) with check (app.has_permission('documents.update'));
drop policy if exists document_versions_update_admin on public.document_versions;
create policy document_versions_update_admin on public.document_versions for update to authenticated using (app.has_permission('documents.update')) with check (app.has_permission('documents.update'));
