create extension if not exists pgcrypto;

create table if not exists public.portal_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.portal_content enable row level security;

create policy "public can read published portal content"
on public.portal_content for select
to anon, authenticated
using (published = true);

create table if not exists public.portal_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portal_admins enable row level security;

create policy "admins can read own admin membership"
on public.portal_admins for select
to authenticated
using (user_id = auth.uid());

create policy "portal admins can update portal content"
on public.portal_content for update
to authenticated
using (exists(select 1 from public.portal_admins a where a.user_id = auth.uid()))
with check (exists(select 1 from public.portal_admins a where a.user_id = auth.uid()));

create or replace function public.set_portal_content_audit()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;

drop trigger if exists trg_portal_content_audit on public.portal_content;
create trigger trg_portal_content_audit
before update on public.portal_content
for each row execute function public.set_portal_content_audit();
