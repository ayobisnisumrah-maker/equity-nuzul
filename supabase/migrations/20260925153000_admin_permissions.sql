alter table public.portal_admins add column if not exists permissions jsonb not null default '["ringkasan"]'::jsonb;
alter table public.portal_admins add constraint portal_admins_permissions_array check(jsonb_typeof(permissions)='array');
