alter table public.investor_profiles
  add column if not exists units numeric(12,4) not null default 0,
  add column if not exists ownership_percent numeric(8,4) not null default 0,
  add column if not exists invested_amount numeric(18,2) not null default 0;

create table if not exists public.investor_distributions (
  id uuid primary key default gen_random_uuid(),
  investor_user_id uuid not null references public.investor_profiles(user_id) on delete cascade,
  period text not null,
  amount numeric(18,2) not null,
  status text not null default 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.investor_distributions enable row level security;

create policy "admin distribution access"
on public.investor_distributions for all to authenticated
using (public.is_portal_admin())
with check (public.is_portal_admin());

create policy "own distribution access"
on public.investor_distributions for select to authenticated
using (investor_user_id = auth.uid());

create policy "own cash access"
on public.cash_transactions for select to authenticated
using (investor_user_id = auth.uid());
