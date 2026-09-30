create or replace function public.publish_portal_content(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid();v_row public.portal_content%rowtype;v_is_super boolean;v_no integer;
begin
 if v_actor is null or not app.has_permission('portal.publish') then raise exception 'Tidak memiliki akses publish Portal.' using errcode='42501';end if;
 select exists(select 1 from public.admins a join public.roles r on r.id=a.role_id join public.user_accounts ua on ua.id=a.id where a.id=v_actor and a.is_active and ua.status='active' and r.key='super_admin') into v_is_super;
 select * into v_row from public.portal_content where id=p_id for update;if not found then raise exception 'Section portal tidak ditemukan.' using errcode='P0002';end if;
 if v_row.draft_content is null then raise exception 'Tidak ada draft untuk dipublish.' using errcode='23514';end if;
 perform app.validate_portal_content_draft(v_row.key,v_row.draft_content);
 if not v_is_super and v_row.draft_updated_by is not null and v_row.draft_updated_by=v_actor then raise exception 'Editor draft tidak dapat mempublish perubahan yang sama.' using errcode='42501';end if;
 select coalesce(max(version_no),0)+1 into v_no from public.portal_content_versions where portal_content_id=p_id;
 update public.portal_content set content=v_row.draft_content,published=true,status='published',published_at=now(),published_by=v_actor,updated_at=now(),updated_by=v_actor where id=p_id;
 insert into public.portal_content_versions(portal_content_id,section_key,version_no,content,action,created_by) values(p_id,v_row.key,v_no,v_row.draft_content,'publish',v_actor);
end $$;
