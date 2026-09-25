-- Public requests are separate from authenticated investor accounts.
create table public.equity_inquiries (
  id uuid primary key,
  name text not null check (length(trim(name)) between 1 and 200),
  email text not null check (length(email) between 3 and 254),
  phone text not null check (length(phone) between 8 and 40),
  investor_type text not null check (investor_type in ('Individu','Badan Usaha','Komunitas')),
  units integer not null check (units between 1 and 50),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
alter table public.equity_inquiries enable row level security;
grant insert (id,name,email,phone,investor_type,units) on public.equity_inquiries to anon, authenticated;
grant select on public.equity_inquiries to authenticated;
grant update (status) on public.equity_inquiries to authenticated;
create policy "public submits equity interest" on public.equity_inquiries for insert to anon,authenticated with check (status='new');
create policy "investor admins read interest" on public.equity_inquiries for select to authenticated using (public.has_admin_permission('investor'));
create policy "investor admins follow up interest" on public.equity_inquiries for update to authenticated using (public.has_admin_permission('investor')) with check (public.has_admin_permission('investor'));
create index equity_inquiries_created_at_idx on public.equity_inquiries(created_at desc);
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='equity_inquiries') then alter publication supabase_realtime add table public.equity_inquiries; end if;
 end if;
end $$;
