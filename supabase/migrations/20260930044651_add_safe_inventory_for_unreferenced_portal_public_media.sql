create or replace function app.inventory_unreferenced_portal_public_media(p_min_age interval default interval '24 hours') returns table(bucket text,path text,media_asset_id uuid) language sql security definer set search_path='' as $$
 select m.bucket,m.path,m.id from public.media_assets m where m.bucket='public-media' and m.created_at < now()-p_min_age
 and not exists(select 1 from public.portal_theme t where m.id in(t.logo_asset_id,t.logo_dark_asset_id,t.favicon_asset_id,t.og_image_asset_id))
 and not exists(select 1 from public.portal_content pc where coalesce(pc.content,'{}'::jsonb)::text like '%'||m.path||'%' or coalesce(pc.draft_content,'{}'::jsonb)::text like '%'||m.path||'%')
 and not exists(select 1 from public.portal_section_versions pv where pv.content::text like '%'||m.path||'%') $$;
revoke all on function app.inventory_unreferenced_portal_public_media(interval) from public,anon,authenticated;
grant execute on function app.inventory_unreferenced_portal_public_media(interval) to service_role;
