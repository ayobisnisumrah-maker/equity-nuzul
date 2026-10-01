-- Retain workflow history once a version leaves draft.
-- This trigger function is shared by document_versions and financial_report_versions.
create or replace function app.forbid_published_version_delete()
returns trigger language plpgsql set search_path='' as $$
begin
 if old.status <> 'draft' then
   raise exception 'Only draft versions may be deleted. Review, approved, published, and archived versions are retained for audit history.'
     using errcode='42501';
 end if;
 return old;
end $$;
revoke all on function app.forbid_published_version_delete() from public,anon,authenticated;
