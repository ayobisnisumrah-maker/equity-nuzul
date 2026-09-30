create table if not exists public.storage_orphan_reviews(
 id uuid primary key default gen_random_uuid(),bucket text not null,path text not null,media_asset_id uuid references public.media_assets(id),detected_at timestamptz not null default now(),status text not null default 'detected' check(status in('detected','keep','delete_approved','deleted')),reviewed_by uuid references public.admins(id),reviewed_at timestamptz,reason text,unique(bucket,path)
);
alter table public.storage_orphan_reviews enable row level security;
revoke all on public.storage_orphan_reviews from public,anon,authenticated;
grant all on public.storage_orphan_reviews to service_role;
create or replace function app.inventory_investor_document_orphans() returns table(bucket text,path text,media_asset_id uuid,orphan_kind text) language sql security definer set search_path='' as $$
 select o.bucket_id,o.name,m.id,case when m.id is null then 'storage_without_metadata' else 'unreferenced_media_asset' end
 from storage.objects o left join public.media_assets m on m.bucket=o.bucket_id and m.path=o.name
 where o.bucket_id='investor-documents' and (
 m.id is null or (
 not exists(select 1 from public.document_versions x where x.file_asset_id=m.id)
 and not exists(select 1 from public.finance_bank_reconciliations x where x.proof_asset_id=m.id)
 and not exists(select 1 from public.finance_expenses x where x.receipt_asset_id=m.id)
 and not exists(select 1 from public.finance_invoices x where x.terms_letterhead_asset_id=m.id)
 and not exists(select 1 from public.finance_payments x where x.proof_asset_id=m.id)
 and not exists(select 1 from public.financial_report_versions x where x.document_asset_id=m.id)
 and not exists(select 1 from public.message_attachments x where x.media_asset_id=m.id)
 and not exists(select 1 from public.portal_theme x where x.logo_asset_id=m.id or x.logo_dark_asset_id=m.id or x.favicon_asset_id=m.id or x.og_image_asset_id=m.id)
 )) $$;
revoke all on function app.inventory_investor_document_orphans() from public,anon,authenticated;
grant execute on function app.inventory_investor_document_orphans() to service_role;
insert into public.storage_orphan_reviews(bucket,path,media_asset_id)
select bucket,path,media_asset_id from app.inventory_investor_document_orphans() on conflict(bucket,path) do nothing;
