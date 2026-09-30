create table if not exists public.finance_invoice_reference_counters(reference_date date primary key,last_number bigint not null check(last_number>0),updated_at timestamptz not null default now());
alter table public.finance_invoice_reference_counters enable row level security;
revoke all on public.finance_invoice_reference_counters from public,anon,authenticated;
grant all on public.finance_invoice_reference_counters to service_role;

create or replace function app.next_finance_invoice_reference(p_prefix text) returns text language plpgsql security definer set search_path='' as $$
declare v_date date:=current_date;v_number bigint;v_prefix text:=upper(regexp_replace(coalesce(nullif(btrim(p_prefix),''),'INV'),'[^A-Za-z0-9_-]','','g'));
begin
 insert into public.finance_invoice_reference_counters(reference_date,last_number,updated_at) values(v_date,1,now())
 on conflict(reference_date) do update set last_number=public.finance_invoice_reference_counters.last_number+1,updated_at=now()
 returning last_number into v_number;
 return v_prefix||'-'||to_char(v_date,'YYYYMMDD')||'-'||lpad(v_number::text,6,'0');
end $$;
revoke all on function app.next_finance_invoice_reference(text) from public,anon,authenticated;
grant execute on function app.next_finance_invoice_reference(text) to service_role;
