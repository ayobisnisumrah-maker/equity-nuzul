alter table public.sales_invoices
 add column if not exists invoice_revision integer not null default 1,
 add column if not exists voided_at timestamptz,
 add column if not exists voided_by uuid references auth.users(id),
 add column if not exists void_reason text;

create table if not exists public.sales_invoice_events(
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null references public.sales_invoices(id) on delete cascade,
 event_type text not null check(event_type in('issued','payment','refund','status_change','void')),
 from_status text,
 to_status text,
 amount numeric(18,2),
 reference_no text,
 notes text,
 actor_user_id uuid references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.sales_invoice_events enable row level security;
create policy "operations read invoice events" on public.sales_invoice_events for select to authenticated
using(public.has_admin_permission('kasir') or public.has_admin_permission('keuangan') or public.has_admin_permission('laporan') or public.has_admin_permission('ringkasan'));
create policy "cash writes invoice events" on public.sales_invoice_events for insert to authenticated
with check(public.has_admin_permission('kasir'));

create or replace function public.log_sales_invoice_issued()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.sales_invoice_events(invoice_id,event_type,to_status,notes,actor_user_id)
 values(new.id,'issued',new.payment_status,'Invoice diterbitkan',new.created_by);
 return new;
end $$;
drop trigger if exists trg_log_sales_invoice_issued on public.sales_invoices;
create trigger trg_log_sales_invoice_issued after insert on public.sales_invoices
for each row execute function public.log_sales_invoice_issued();

create or replace function public.post_sales_payment(p_invoice_id uuid,p_amount numeric,p_kind text,p_method text,p_reference_no text default null,p_notes text default null)
returns uuid language plpgsql security invoker set search_path=public as $$
declare v_id uuid;v_invoice text;v_before text;v_after text;
begin
 if not public.has_admin_permission('kasir') then raise exception 'Akses ditolak';end if;
 if p_amount<=0 then raise exception 'Nominal harus lebih besar dari 0';end if;
 select invoice_no,payment_status into v_invoice,v_before from public.sales_invoices where id=p_invoice_id and voided_at is null;
 if v_invoice is null then raise exception 'Invoice tidak tersedia atau sudah dibatalkan';end if;
 insert into public.sales_payments(invoice_id,amount,kind,method,reference_no,notes,created_by)
 values(p_invoice_id,p_amount,p_kind,p_method,p_reference_no,p_notes,auth.uid()) returning id into v_id;
 perform public.recalculate_sales_invoice(p_invoice_id);
 select payment_status into v_after from public.sales_invoices where id=p_invoice_id;
 insert into public.sales_invoice_events(invoice_id,event_type,from_status,to_status,amount,reference_no,notes,actor_user_id)
 values(p_invoice_id,case when p_kind='refund' then 'refund' else 'payment' end,v_before,v_after,p_amount,p_reference_no,p_notes,auth.uid());
 insert into public.finance_entries(entry_date,type,category,description,amount,reference_no,created_by)
 values(current_date,case when p_kind='refund' then 'expense' else 'income' end,case when p_kind='refund' then 'Refund Penjualan Paket' else 'Penjualan Paket' end,case when p_kind='refund' then 'Refund invoice ' else 'Pembayaran invoice ' end||v_invoice,p_amount,coalesce(p_reference_no,v_invoice),auth.uid());
 return v_id;
end $$;
grant execute on function public.post_sales_payment(uuid,numeric,text,text,text,text) to authenticated;

create or replace function public.void_sales_invoice(p_invoice_id uuid,p_reason text)
returns void language plpgsql security invoker set search_path=public as $$
declare v_status text;v_paid numeric;
begin
 if not public.has_admin_permission('kasir') then raise exception 'Akses ditolak';end if;
 select payment_status,paid_amount into v_status,v_paid from public.sales_invoices where id=p_invoice_id and voided_at is null;
 if v_status is null then raise exception 'Invoice tidak ditemukan';end if;
 if v_paid>0 then raise exception 'Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan langsung. Gunakan proses refund.';end if;
 update public.sales_invoices set transaction_status='cancelled',payment_status='cancelled',voided_at=now(),voided_by=auth.uid(),void_reason=p_reason,updated_at=now() where id=p_invoice_id;
 insert into public.sales_invoice_events(invoice_id,event_type,from_status,to_status,notes,actor_user_id)
 values(p_invoice_id,'void',v_status,'cancelled',p_reason,auth.uid());
end $$;
grant execute on function public.void_sales_invoice(uuid,text) to authenticated;
