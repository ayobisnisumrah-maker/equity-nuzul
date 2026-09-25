alter table public.portal_content
 add column if not exists draft_content jsonb,
 add column if not exists draft_updated_at timestamptz,
 add column if not exists draft_updated_by uuid references auth.users(id),
 add column if not exists published_at timestamptz,
 add column if not exists published_by uuid references auth.users(id);

update public.portal_content
set draft_content=coalesce(draft_content,content),
    published_at=coalesce(published_at,updated_at)
where draft_content is null or published_at is null;

create or replace function public.save_portal_content_draft(p_id uuid,p_content jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.has_admin_permission('portal') then raise exception 'Tidak memiliki akses Portal.'; end if;
 update public.portal_content set draft_content=p_content,draft_updated_at=now(),draft_updated_by=auth.uid() where id=p_id;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
end $$;

create or replace function public.publish_portal_content(p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.has_admin_permission('portal') then raise exception 'Tidak memiliki akses Portal.'; end if;
 update public.portal_content set content=coalesce(draft_content,content),published=true,published_at=now(),published_by=auth.uid(),updated_at=now(),updated_by=auth.uid() where id=p_id;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
end $$;

revoke all on function public.save_portal_content_draft(uuid,jsonb) from public;
revoke all on function public.publish_portal_content(uuid) from public;
grant execute on function public.save_portal_content_draft(uuid,jsonb) to authenticated;
grant execute on function public.publish_portal_content(uuid) to authenticated;
