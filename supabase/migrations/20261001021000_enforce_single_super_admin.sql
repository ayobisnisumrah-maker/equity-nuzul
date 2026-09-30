-- Preserve the business invariant that Nuzultrip Equity has exactly one
-- Super Admin account at most. The existing lifecycle guards protect the
-- last Super Admin from demotion/deactivation; this index prevents a second
-- Super Admin from being created through any write path, including service
-- provisioning.

do $$
declare
  v_super_admin_role_id uuid;
  v_count integer;
begin
  select id into v_super_admin_role_id
  from public.roles
  where key = 'super_admin';

  if v_super_admin_role_id is null then
    raise exception 'super_admin role is missing' using errcode = '23514';
  end if;

  select count(*) into v_count
  from public.admins
  where role_id = v_super_admin_role_id;

  if v_count > 1 then
    raise exception 'Cannot enforce single Super Admin: % accounts already use the role.', v_count
      using errcode = '23514';
  end if;

  execute format(
    'create unique index if not exists admins_single_super_admin_idx on public.admins ((1)) where role_id = %L::uuid',
    v_super_admin_role_id
  );
end
$$;
