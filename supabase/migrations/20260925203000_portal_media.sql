create table if not exists public.portal_media(
 id uuid primary key default gen_random_uuid(),
 section_key text not null,
 field_key text not null,
 file_name text not null,
 file_url text not null,
 storage_path text not null,
 mime_type text not null,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.portal_media enable row level security;
create policy "admins read portal media" on public.portal_media for select to authenticated using(public.has_admin_permission('portal'));
create policy "admins insert portal media" on public.portal_media for insert to authenticated with check(public.has_admin_permission('portal'));
create policy "admins delete portal media" on public.portal_media for delete to authenticated using(public.has_admin_permission('portal'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portal-media','portal-media',true,10485760,array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

create policy "public reads portal media storage" on storage.objects for select using(bucket_id='portal-media');
create policy "portal admins upload media" on storage.objects for insert to authenticated with check(bucket_id='portal-media' and public.has_admin_permission('portal'));
create policy "portal admins delete media" on storage.objects for delete to authenticated using(bucket_id='portal-media' and public.has_admin_permission('portal'));
