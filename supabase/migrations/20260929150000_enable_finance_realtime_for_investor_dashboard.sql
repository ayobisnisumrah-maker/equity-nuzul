-- Keep canonical finance changes visible to authenticated realtime subscribers.
-- RLS remains authoritative for row delivery.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='finance_invoices') then
    alter publication supabase_realtime add table public.finance_invoices;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='finance_payments') then
    alter publication supabase_realtime add table public.finance_payments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='finance_refunds') then
    alter publication supabase_realtime add table public.finance_refunds;
  end if;
end $$;
