create table if not exists public.sales_invoices(
 id uuid primary key default gen_random_uuid(),
 invoice_no text not null unique,
 customer_name text not null,
 customer_email text,
 customer_phone text,
 product_type text not null check(product_type in('umrah','umrah_plus','halal_tour','land_arrangement','other')),
 product_name text not null,
 product_code text,
 pax integer not null default 1 check(pax>0),
 departure_date date,
 due_date date,
 subtotal numeric(18,2) not null check(subtotal>=0),
 total_amount numeric(18,2) not null check(total_amount>=0),
 paid_amount numeric(18,2) not null default 0 check(paid_amount>=0),
 refunded_amount numeric(18,2) not null default 0 check(refunded_amount>=0),
 payment_status text not null default 'unpaid' check(payment_status in('unpaid','dp','partial','paid','refunded','partially_refunded','cancelled')),
 transaction_status text not null default 'active' check(transaction_status in('active','success','cancelled','refund_process','refunded')),
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.sales_payments(
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null references public.sales_invoices(id) on delete cascade,
 payment_date date not null default current_date,
 amount numeric(18,2) not null check(amount>0),
 kind text not null check(kind in('payment','refund')),
 method text not null default 'Transfer',
 reference_no text,
 notes text,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.sales_invoices enable row level security;
alter table public.sales_payments enable row level security;
create policy "cash reads sales invoices" on public.sales_invoices for select to authenticated using(public.has_admin_permission('kasir') or public.has_admin_permission('keuangan') or public.has_admin_permission('laporan') or public.has_admin_permission('ringkasan'));
create policy "cash writes sales invoices" on public.sales_invoices for all to authenticated using(public.has_admin_permission('kasir')) with check(public.has_admin_permission('kasir'));
create policy "reports read sales payments" on public.sales_payments for select to authenticated using(public.has_admin_permission('kasir') or public.has_admin_permission('keuangan') or public.has_admin_permission('laporan') or public.has_admin_permission('ringkasan'));
create policy "cash writes sales payments" on public.sales_payments for all to authenticated using(public.has_admin_permission('kasir')) with check(public.has_admin_permission('kasir'));

create or replace function public.recalculate_sales_invoice(p_invoice_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_paid numeric;v_refund numeric;v_total numeric;v_status text;
begin
 select coalesce(sum(case when kind='payment' then amount else 0 end),0),coalesce(sum(case when kind='refund' then amount else 0 end),0) into v_paid,v_refund from public.sales_payments where invoice_id=p_invoice_id;
 select total_amount into v_total from public.sales_invoices where id=p_invoice_id;
 v_status:=case when v_refund>0 and v_refund>=v_paid then 'refunded' when v_refund>0 then 'partially_refunded' when v_paid>=v_total then 'paid' when v_paid>0 then 'dp' else 'unpaid' end;
 update public.sales_invoices set paid_amount=v_paid,refunded_amount=v_refund,payment_status=v_status,transaction_status=case when v_status='refunded' then 'refunded' when v_status='paid' then 'success' else transaction_status end,updated_at=now() where id=p_invoice_id;
end $$;

create or replace function public.post_sales_payment(p_invoice_id uuid,p_amount numeric,p_kind text,p_method text,p_reference_no text default null,p_notes text default null) returns uuid language plpgsql security invoker set search_path=public as $$
declare v_id uuid;v_invoice text;
begin
 if not public.has_admin_permission('kasir') then raise exception 'Akses ditolak';end if;
 insert into public.sales_payments(invoice_id,amount,kind,method,reference_no,notes,created_by) values(p_invoice_id,p_amount,p_kind,p_method,p_reference_no,p_notes,auth.uid()) returning id into v_id;
 perform public.recalculate_sales_invoice(p_invoice_id);
 select invoice_no into v_invoice from public.sales_invoices where id=p_invoice_id;
 insert into public.finance_entries(entry_date,type,category,description,amount,reference_no,created_by)
 values(current_date,case when p_kind='refund' then 'expense' else 'income' end,case when p_kind='refund' then 'Refund Penjualan Paket' else 'Penjualan Paket' end,case when p_kind='refund' then 'Refund invoice ' else 'Pembayaran invoice ' end||v_invoice,p_amount,coalesce(p_reference_no,v_invoice),auth.uid());
 return v_id;
end $$;
grant execute on function public.post_sales_payment(uuid,numeric,text,text,text,text) to authenticated;
