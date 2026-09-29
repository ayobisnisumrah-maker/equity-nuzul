-- Harden canonical cashier payments against retries and scope refunds to their selected payment.
create or replace function app.record_finance_payment(
 p_invoice_id uuid,p_amount numeric,p_method text,p_received_at timestamptz,
 p_external_reference text,p_notes text,p_idempotency_key text default null)
returns uuid language plpgsql security definer set search_path to '' as $$
declare
 v_id uuid; v_invoice public.finance_invoices%rowtype; v_prefix text; v_existing public.finance_payments%rowtype; v_key text;
begin
 if not app.has_permission('financial_reports.update') then raise exception 'Anda tidak memiliki izin untuk mencatat pembayaran.' using errcode='42501'; end if;
 v_key:=nullif(btrim(coalesce(p_idempotency_key,'')),'');
 if v_key is null then raise exception 'Idempotency key pembayaran wajib tersedia.' using errcode='22023'; end if;
 select * into v_existing from public.finance_payments where idempotency_key=v_key;
 if v_existing.id is not null then
   if v_existing.invoice_id<>p_invoice_id or v_existing.amount<>p_amount or v_existing.method<>btrim(p_method)
      or coalesce(v_existing.external_reference,'')<>coalesce(nullif(btrim(coalesce(p_external_reference,'')),''),'') then
     raise exception 'Idempotency key sudah digunakan untuk pembayaran yang berbeda.' using errcode='23505';
   end if;
   return v_existing.id;
 end if;
 select * into v_invoice from public.finance_invoices where id=p_invoice_id for update;
 if v_invoice.id is null then raise exception 'Invoice tidak ditemukan.' using errcode='P0002'; end if;
 if v_invoice.status not in ('issued','partially_paid') then raise exception 'Pembayaran hanya dapat dicatat untuk invoice yang sudah diterbitkan dan belum lunas.' using errcode='23514'; end if;
 if p_amount is null or p_amount<=0 or p_amount>v_invoice.grand_total-v_invoice.paid_total+v_invoice.refunded_total then raise exception 'Nominal pembayaran melebihi sisa tagihan invoice.' using errcode='23514'; end if;
 if length(btrim(coalesce(p_method,'')))<2 then raise exception 'Metode pembayaran wajib diisi.' using errcode='22023'; end if;
 select receipt_prefix into v_prefix from public.finance_settings where singleton=true;
 begin
   insert into public.finance_payments(invoice_id,reference,status,amount,currency,method,external_reference,idempotency_key,received_at,notes,recorded_by)
   values(p_invoice_id,app.finance_reference(v_prefix),'pending',p_amount,v_invoice.currency,btrim(p_method),nullif(btrim(coalesce(p_external_reference,'')),''),v_key,p_received_at,nullif(btrim(coalesce(p_notes,'')),''),auth.uid())
   returning id into v_id;
 exception when unique_violation then
   select * into v_existing from public.finance_payments where idempotency_key=v_key;
   if v_existing.id is null or v_existing.invoice_id<>p_invoice_id or v_existing.amount<>p_amount or v_existing.method<>btrim(p_method)
      or coalesce(v_existing.external_reference,'')<>coalesce(nullif(btrim(coalesce(p_external_reference,'')),''),'') then raise; end if;
   v_id:=v_existing.id;
 end;
 return v_id;
end $$;

create or replace function app.process_finance_refund(p_invoice_id uuid,p_payment_id uuid,p_amount numeric,p_reason text,p_notes text)
returns uuid language plpgsql security definer set search_path to '' as $$
declare v_id uuid; v_paid numeric; v_refunded numeric; v_prefix text; v_payment_amount numeric; v_payment_refunded numeric;
begin
 if not app.has_permission('financial_reports.update') then raise exception 'Missing permission' using errcode='42501'; end if;
 perform 1 from public.finance_invoices where id=p_invoice_id and status in ('partially_paid','paid') for update;
 if not found then raise exception 'Refunds require a paid invoice' using errcode='23514'; end if;
 if p_payment_id is null then raise exception 'Refund memerlukan pembayaran terkonfirmasi.' using errcode='23514'; end if;
 select amount into v_payment_amount from public.finance_payments where id=p_payment_id and invoice_id=p_invoice_id and status='confirmed' for update;
 if v_payment_amount is null then raise exception 'Payment does not belong to this invoice' using errcode='23514'; end if;
 select coalesce(sum(amount),0) into v_paid from public.finance_payments where invoice_id=p_invoice_id and status='confirmed';
 select coalesce(sum(amount),0) into v_refunded from public.finance_refunds where invoice_id=p_invoice_id and status='processed';
 select coalesce(sum(amount),0) into v_payment_refunded from public.finance_refunds where invoice_id=p_invoice_id and payment_id=p_payment_id and status='processed';
 if p_amount<=0 or p_amount>v_paid-v_refunded then raise exception 'Refund exceeds refundable amount' using errcode='23514'; end if;
 if p_amount>v_payment_amount-v_payment_refunded then raise exception 'Refund exceeds refundable amount for selected payment' using errcode='23514'; end if;
 select refund_prefix into v_prefix from public.finance_settings where singleton=true;
 insert into public.finance_refunds(invoice_id,payment_id,reference,status,amount,reason,requested_by,approved_by,processed_by,approved_at,processed_at,notes)
 values(p_invoice_id,p_payment_id,app.finance_reference(v_prefix),'processed',p_amount,btrim(p_reason),auth.uid(),auth.uid(),auth.uid(),now(),now(),nullif(btrim(p_notes),''))
 returning id into v_id;
 return v_id;
end $$;
