create table if not exists public.investor_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 investor_code text unique,
 full_name text,
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.investor_profiles enable row level security;
create policy "investor can read own approved profile" on public.investor_profiles for select to authenticated using(user_id=auth.uid() and status='approved');
create policy "admins can read investor profiles" on public.investor_profiles for select to authenticated using(exists(select 1 from public.portal_admins a where a.user_id=auth.uid()));
create policy "admins can manage investor profiles" on public.investor_profiles for all to authenticated using(exists(select 1 from public.portal_admins a where a.user_id=auth.uid())) with check(exists(select 1 from public.portal_admins a where a.user_id=auth.uid()));
