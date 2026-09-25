alter table public.sales_invoices
 add column if not exists terms_version text,
 add column if not exists terms_snapshot jsonb,
 add column if not exists issued_at timestamptz;

create or replace function public.sales_terms_snapshot()
returns jsonb language sql immutable as $$
 select jsonb_build_object(
  'version','2026-09-25',
  'company','PT Swarna Dipa Wisata',
  'brand','Nuzultrip',
  'scope',jsonb_build_array('Umrah','Umrah Plus','Halal Tour','Land Arrangement'),
  'refund_sla_days',90,
  'refund_policy',jsonb_build_array(
   jsonb_build_object('range','>=61','max_percent',90),
   jsonb_build_object('range','31-60','max_percent',75),
   jsonb_build_object('range','15-30','max_percent',50),
   jsonb_build_object('range','8-14','max_percent',25),
   jsonb_build_object('range','0-7','max_percent',0)
  ),
  'article_count',36
 )
$$;

create or replace function public.freeze_sales_invoice_terms()
returns trigger language plpgsql set search_path=public as $$
begin
 if new.terms_snapshot is null then
  new.terms_snapshot:=public.sales_terms_snapshot();
  new.terms_version:=coalesce(new.terms_version,new.terms_snapshot->>'version');
 end if;
 new.issued_at:=coalesce(new.issued_at,now());
 return new;
end $$;

drop trigger if exists trg_freeze_sales_invoice_terms on public.sales_invoices;
create trigger trg_freeze_sales_invoice_terms
before insert on public.sales_invoices
for each row execute function public.freeze_sales_invoice_terms();

update public.sales_invoices
set terms_snapshot=public.sales_terms_snapshot(),
    terms_version='2026-09-25',
    issued_at=coalesce(issued_at,created_at)
where terms_snapshot is null;
