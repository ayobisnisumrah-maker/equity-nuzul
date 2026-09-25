create table if not exists public.portal_content_versions(
 id uuid primary key default gen_random_uuid(),
 portal_content_id uuid not null references public.portal_content(id) on delete cascade,
 section_key text not null,
 version_no integer not null,
 content jsonb not null,
 action text not null check(action in ('publish','rollback')),
 source_version_id uuid references public.portal_content_versions(id),
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 unique(portal_content_id,version_no)
);
alter table public.portal_content_versions enable row level security;
create policy "portal admins read content versions" on public.portal_content_versions for select to authenticated using(public.has_admin_permission('portal'));

create or replace function public.publish_portal_content(p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_key text;v_content jsonb;v_version integer;
begin
 if not public.has_admin_permission('portal') then raise exception 'Tidak memiliki akses Portal.'; end if;
 select key,coalesce(draft_content,content) into v_key,v_content from public.portal_content where id=p_id for update;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
 select coalesce(max(version_no),0)+1 into v_version from public.portal_content_versions where portal_content_id=p_id;
 update public.portal_content set content=v_content,draft_content=v_content,published=true,published_at=now(),published_by=auth.uid(),updated_at=now(),updated_by=auth.uid() where id=p_id;
 insert into public.portal_content_versions(portal_content_id,section_key,version_no,content,action,created_by) values(p_id,v_key,v_version,v_content,'publish',auth.uid());
end $$;

create or replace function public.rollback_portal_content(p_id uuid,p_version_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_key text;v_content jsonb;v_version integer;
begin
 if not public.has_admin_permission('portal') then raise exception 'Tidak memiliki akses Portal.'; end if;
 select v.content into v_content from public.portal_content_versions v where v.id=p_version_id and v.portal_content_id=p_id;
 if not found then raise exception 'Versi portal tidak ditemukan.'; end if;
 select key into v_key from public.portal_content where id=p_id for update;
 if not found then raise exception 'Section portal tidak ditemukan.'; end if;
 select coalesce(max(version_no),0)+1 into v_version from public.portal_content_versions where portal_content_id=p_id;
 update public.portal_content set content=v_content,draft_content=v_content,published=true,published_at=now(),published_by=auth.uid(),draft_updated_at=now(),draft_updated_by=auth.uid(),updated_at=now(),updated_by=auth.uid() where id=p_id;
 insert into public.portal_content_versions(portal_content_id,section_key,version_no,content,action,source_version_id,created_by) values(p_id,v_key,v_version,v_content,'rollback',p_version_id,auth.uid());
end $$;

revoke all on function public.rollback_portal_content(uuid,uuid) from public;
grant execute on function public.rollback_portal_content(uuid,uuid) to authenticated;
