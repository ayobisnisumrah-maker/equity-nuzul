create policy "super admin manages admins" on public.portal_admins for all to authenticated
using(exists(select 1 from public.portal_admins self where self.user_id=auth.uid() and lower(self.role)='super admin'))
with check(exists(select 1 from public.portal_admins self where self.user_id=auth.uid() and lower(self.role)='super admin'));
