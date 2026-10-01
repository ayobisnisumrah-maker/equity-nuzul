-- Preserve invoice audit history after any processed refund: new sales require a new invoice.
CREATE OR REPLACE FUNCTION app.record_finance_payment(p_invoice_id uuid, p_amount numeric, p_method text, p_received_at timestamp with time zone, p_external_reference text, p_notes text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id uuid;v_invoice public.finance_invoices%rowtype;v_prefix text;v_existing public.finance_payments%rowtype;v_key text;v_pending numeric:=0;v_available numeric:=0;
begin
 if not app.has_permission('finance_payments.create') then raise exception 'Anda tidak memiliki izin untuk mencatat pembayaran.' using errcode='42501';end if;
 v_key:=nullif(btrim(coalesce(p_idempotency_key,'')),'');if v_key is null then raise exception 'Idempotency key pembayaran wajib tersedia.' using errcode='22023';end if;
 select * into v_existing from public.finance_payments where idempotency_key=v_key;
 if v_existing.id is not null then if v_existing.invoice_id<>p_invoice_id or v_existing.amount<>p_amount or v_existing.method<>btrim(p_method) or coalesce(v_existing.external_reference,'')<>coalesce(nullif(btrim(coalesce(p_external_reference,'')),''),'') then raise exception 'Idempotency key sudah digunakan untuk pembayaran yang berbeda.' using errcode='23505';end if;return v_existing.id;end if;
 select * into v_invoice from public.finance_invoices where id=p_invoice_id for update;if v_invoice.id is null then raise exception 'Invoice tidak ditemukan.' using errcode='P0002';end if;
 if v_invoice.status not in('issued','partially_paid') then raise exception 'Pembayaran hanya dapat dicatat untuk invoice yang sudah diterbitkan dan belum lunas.' using errcode='23514';end if;
 if exists(select 1 from public.finance_refunds where invoice_id=p_invoice_id and status='processed') then raise exception 'Invoice yang sudah memiliki refund processed tidak dapat menerima pembayaran baru. Buat invoice baru untuk transaksi baru.' using errcode='23514';end if;
 select coalesce(sum(amount),0) into v_pending from public.finance_payments where invoice_id=p_invoice_id and status='pending';
 v_available:=greatest(v_invoice.grand_total-greatest(v_invoice.paid_total-v_invoice.refunded_total,0)-v_pending,0);
 if p_amount is null or p_amount<=0 or p_amount>v_available then raise exception 'Nominal pembayaran melebihi sisa tagihan yang belum dicadangkan. Sisa tersedia: %',v_available using errcode='23514';end if;
 if length(btrim(coalesce(p_method,'')))<2 then raise exception 'Metode pembayaran wajib diisi.' using errcode='22023';end if;
 select receipt_prefix into v_prefix from public.finance_settings where singleton=true;
 begin
 insert into public.finance_payments(invoice_id,reference,status,amount,currency,method,external_reference,idempotency_key,received_at,notes,recorded_by) values(p_invoice_id,app.finance_reference(v_prefix),'pending',p_amount,v_invoice.currency,btrim(p_method),nullif(btrim(coalesce(p_external_reference,'')),''),v_key,p_received_at,nullif(btrim(coalesce(p_notes,'')),''),auth.uid()) returning id into v_id;
 exception when unique_violation then select * into v_existing from public.finance_payments where idempotency_key=v_key;if v_existing.id is null or v_existing.invoice_id<>p_invoice_id or v_existing.amount<>p_amount or v_existing.method<>btrim(p_method) or coalesce(v_existing.external_reference,'')<>coalesce(nullif(btrim(coalesce(p_external_reference,'')),''),'') then raise;end if;v_id:=v_existing.id;end;
 return v_id;
end $function$

