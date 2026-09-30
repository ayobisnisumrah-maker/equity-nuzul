create or replace function app.revoke_document_access_grant(p_grant_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid();
begin
 if not app.has_permission('investor_documents.revoke') then raise exception 'Permission denied.' using errcode='42501';end if;
 perform set_config('app.document_grant_revoke','1',true);
 update public.document_access_grants set revoked_at=now(),revoked_by=v_actor where id=p_grant_id and revoked_at is null;
 if not found then raise exception 'Active document grant not found.' using errcode='P0002';end if;
end $$;
grant execute on function app.revoke_document_access_grant(uuid) to authenticated;
revoke execute on function app.revoke_document_access_grant(uuid) from public,anon;
drop policy if exists document_access_grants_update_admin on public.document_access_grants;
-- Final lifecycle trigger additionally rejects every direct UPDATE unless the transaction-local canonical revoke flag is set.
