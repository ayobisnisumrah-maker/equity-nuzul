-- Backward-compatible CMS contract for the existing production portal_content table.
-- Keeps legacy page/section/slug/status columns intact and adds the fields expected by the current dashboard.
create extension if not exists pgcrypto;

alter table public.portal_content
  add column if not exists key text,
  add column if not exists label text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists published boolean not null default false,
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists draft_content jsonb,
  add column if not exists draft_updated_at timestamptz,
  add column if not exists draft_updated_by uuid references auth.users(id),
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references auth.users(id);

update public.portal_content
set key = coalesce(nullif(key,''), nullif(section,''), nullif(slug,''))
where key is null or key='';

update public.portal_content
set label = coalesce(nullif(label,''), nullif(title,''), nullif(section,''), key)
where label is null or label='';

update public.portal_content
set published = (status = 'published')
where status is not null;

update public.portal_content
set draft_content = coalesce(draft_content,content),
    published_at = case when published then coalesce(published_at,updated_at,created_at,now()) else published_at end
where draft_content is null or (published and published_at is null);

create unique index if not exists portal_content_key_unique
on public.portal_content(key)
where key is not null;

alter table public.portal_content enable row level security;

drop policy if exists "portal_content_public_read" on public.portal_content;
drop policy if exists "public can read published portal content" on public.portal_content;
create policy "portal_content_public_read"
on public.portal_content for select
to anon, authenticated
using (published = true or status = 'published');

create or replace function public.save_portal_content_draft(p_id uuid,p_content jsonb)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
 if not public.has_admin_permission('portal') then
   raise exception 'Tidak memiliki akses Portal.';
 end if;
 update public.portal_content
 set draft_content=p_content,
     draft_updated_at=now(),
     draft_updated_by=auth.uid()
 where id=p_id;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
end $$;

create or replace function public.publish_portal_content(p_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
 if not public.has_admin_permission('portal') then
   raise exception 'Tidak memiliki akses Portal.';
 end if;
 update public.portal_content
 set content=coalesce(draft_content,content),
     published=true,
     status='published',
     published_at=now(),
     published_by=auth.uid(),
     updated_at=now(),
     updated_by=auth.uid()
 where id=p_id;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
end $$;

revoke all on function public.save_portal_content_draft(uuid,jsonb) from public;
revoke all on function public.publish_portal_content(uuid) from public;
grant execute on function public.save_portal_content_draft(uuid,jsonb) to authenticated;
grant execute on function public.publish_portal_content(uuid) to authenticated;

do $$
begin
 if not exists (
   select 1 from pg_publication_tables
   where pubname='supabase_realtime' and schemaname='public' and tablename='portal_content'
 ) then
   alter publication supabase_realtime add table public.portal_content;
 end if;
end $$;
