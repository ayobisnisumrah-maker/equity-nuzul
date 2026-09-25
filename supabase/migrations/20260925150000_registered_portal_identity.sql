alter table public.portal_admins add column if not exists full_name text;
alter table public.portal_admins add column if not exists role text not null default 'Admin';
create index if not exists idx_investor_profiles_user_status on public.investor_profiles(user_id,status);
