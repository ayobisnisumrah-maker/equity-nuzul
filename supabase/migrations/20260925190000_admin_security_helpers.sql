create or replace function public.has_admin_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.portal_admins
    where user_id=auth.uid()
      and (
        lower(role)='super admin'
        or permissions ? required_permission
      )
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.portal_admins
    where user_id=auth.uid() and lower(role)='super admin'
  );
$$;

grant execute on function public.has_admin_permission(text) to authenticated;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "super admin manages admins" on public.portal_admins;
create policy "super admin manages admins"
on public.portal_admins for all to authenticated
using(public.is_super_admin())
with check(public.is_super_admin());
