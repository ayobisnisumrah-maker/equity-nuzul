-- Protect the physical Storage object behind every published financial report PDF.
-- This is defense-in-depth for privileged/service-role paths, which bypass Storage RLS.
create or replace function app.guard_published_financial_report_storage_object()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.bucket_id='financial-documents' and exists(
  select 1
  from public.media_assets a
  join public.financial_report_versions v on v.document_asset_id=a.id
  join public.financial_reports r on r.published_version_id=v.id
  where a.bucket=old.bucket_id and a.path=old.name
    and v.status='published' and r.status in('published','archived')
 ) then
  raise exception 'Storage object used by a published financial report is immutable.' using errcode='42501';
 end if;
 return case when tg_op='DELETE' then old else new end;
end $$;

drop trigger if exists published_financial_report_storage_object_guard on storage.objects;
create trigger published_financial_report_storage_object_guard
before update or delete on storage.objects
for each row when (old.bucket_id='financial-documents')
execute function app.guard_published_financial_report_storage_object();

revoke all on function app.guard_published_financial_report_storage_object() from public,anon,authenticated,service_role;
