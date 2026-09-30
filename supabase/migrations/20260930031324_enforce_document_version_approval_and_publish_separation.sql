create or replace function app.guard_document_version_update() returns trigger language plpgsql set search_path='' as $$
declare v_super boolean:=exists(select 1 from public.admins a join public.roles r on r.id=a.role_id join public.user_accounts u on u.id=a.id where a.id=auth.uid() and a.is_active and u.status='active' and r.key='super_admin');
begin
 if old.status='published' then if app.published_change_is_referential(to_jsonb(old),to_jsonb(new)) then return new;end if;raise exception 'Version % of document % is published and cannot be modified. Create a new version instead.',old.version_number,old.document_id using errcode='42501';end if;
 if new.status is distinct from old.status then
  if not app.publication_transition_allowed(old.status,new.status) then raise exception 'Publication status cannot move from % to %.',old.status,new.status using errcode='23514';end if;
  if not app.document_workflow_permission_allowed(new.status) then raise exception 'Missing permission for document version transition to %.',new.status using errcode='42501';end if;
  if new.status='approved' then
   if not v_super and old.created_by=auth.uid() then raise exception 'Document version creator cannot approve the same version.' using errcode='42501';end if;
   new.approved_by:=auth.uid();new.approved_at:=now();
  end if;
  if new.status='published' then
   if new.approved_by is null then raise exception 'Approved actor is required before publication.' using errcode='23514';end if;
   if not v_super and new.approved_by=auth.uid() then raise exception 'Document version approver cannot publish the same version.' using errcode='42501';end if;
   new.published_at:=coalesce(new.published_at,now());
  end if;
 elsif to_jsonb(new) is distinct from to_jsonb(old) and not app.has_permission('documents.update') then raise exception 'Missing documents.update permission.' using errcode='42501';end if;
 return new;
end $$;
