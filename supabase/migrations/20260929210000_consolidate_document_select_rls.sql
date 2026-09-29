-- Keep anonymous publication boundaries explicit while consolidating authenticated reads.
drop policy if exists documents_select_admin on public.documents;
drop policy if exists documents_select_investor on public.documents;
drop policy if exists documents_select_public on public.documents;
create policy documents_select_public on public.documents for select to anon using (status='published'::publication_status and visibility='public'::visibility);
create policy documents_select_authenticated on public.documents for select to authenticated using (app.has_permission('documents.view') or (status='published'::publication_status and visibility='public'::visibility) or (app.current_investor_id() is not null and status='published'::publication_status and (visibility='investors'::visibility or (visibility='restricted'::visibility and app.investor_granted_document(id)))));

drop policy if exists document_versions_select_admin on public.document_versions;
drop policy if exists document_versions_select_via_document on public.document_versions;
create policy document_versions_select_public on public.document_versions for select to anon using (exists(select 1 from public.documents d where d.id=document_versions.document_id and d.published_version_id=document_versions.id));
create policy document_versions_select_authenticated on public.document_versions for select to authenticated using (app.has_permission('documents.view') or exists(select 1 from public.documents d where d.id=document_versions.document_id and d.published_version_id=document_versions.id));

drop policy if exists document_access_grants_select_admin on public.document_access_grants;
drop policy if exists document_access_grants_select_self on public.document_access_grants;
create policy document_access_grants_select_authenticated on public.document_access_grants for select to authenticated using (app.has_permission('investor_documents.view') or investor_id=app.current_investor_id());
