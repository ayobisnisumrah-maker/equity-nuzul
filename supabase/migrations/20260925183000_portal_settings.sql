create table if not exists public.portal_settings(
 key text primary key,
 value text not null default '',
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.portal_settings enable row level security;
create policy "admins read portal settings" on public.portal_settings for select to authenticated using(public.is_portal_admin());
create policy "super admin manages portal settings" on public.portal_settings for all to authenticated
using(exists(select 1 from public.portal_admins a where a.user_id=auth.uid() and lower(a.role)='super admin'))
with check(exists(select 1 from public.portal_admins a where a.user_id=auth.uid() and lower(a.role)='super admin'));
insert into public.portal_settings(key,value) values
 ('company_name','PT Swarna Dipa Wisata'),
 ('portal_name','Nuzultrip Equity'),
 ('support_email',''),
 ('support_phone','')
on conflict(key) do nothing;
