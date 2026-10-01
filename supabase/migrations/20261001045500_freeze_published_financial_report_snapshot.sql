-- Published financial report snapshots and their registered PDF assets are terminal.
create or replace function app.guard_published_financial_report_version()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='DELETE' and old.status='published' then raise exception 'Published financial report version cannot be deleted.' using errcode='42501';end if;
 if tg_op='UPDATE' and old.status='published' and new is distinct from old then raise exception 'Published financial report version is immutable.' using errcode='42501';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists published_financial_report_version_guard on public.financial_report_versions;
create trigger published_financial_report_version_guard before update or delete on public.financial_report_versions for each row execute function app.guard_published_financial_report_version();

create or replace function app.guard_published_financial_report_asset()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.financial_report_versions v join public.financial_reports r on r.published_version_id=v.id where v.document_asset_id=old.id and v.status='published' and r.status in('published','archived'))
 then raise exception 'Asset used by a published financial report is immutable.' using errcode='42501';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists published_financial_report_asset_guard on public.media_assets;
create trigger published_financial_report_asset_guard before update or delete on public.media_assets for each row when (old.bucket='financial-documents') execute function app.guard_published_financial_report_asset();

revoke all on function app.guard_published_financial_report_version() from public,anon,authenticated,service_role;
revoke all on function app.guard_published_financial_report_asset() from public,anon,authenticated,service_role;
