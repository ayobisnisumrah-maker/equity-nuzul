-- Enforce four-eyes control for finance payment reconciliation.
-- Non-super-admin users may not reconcile a payment they originally recorded.
create or replace function app.reconcile_finance_payment(
 p_payment_id uuid,
 p_proof_asset_id uuid,
 p_bank_reference text,
 p_bank_amount numeric,
 p_bank_received_at timestamptz,
 p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
 v_payment public.finance_payments%rowtype;
 v_reconciliation_id uuid;
 v_ref text:=btrim(coalesce(p_bank_reference,''));
begin
 if not app.has_permission('finance_payments.reconcile') then
  raise exception 'Anda tidak memiliki izin untuk melakukan rekonsiliasi pembayaran.' using errcode='42501';
 end if;

 select * into v_payment from public.finance_payments where id=p_payment_id for update;
 if v_payment.id is null then raise exception 'Pembayaran tidak ditemukan.' using errcode='P0002'; end if;
 if v_payment.status<>'pending' then raise exception 'Hanya pembayaran berstatus Menunggu Rekonsiliasi yang dapat dikonfirmasi.' using errcode='23514'; end if;

 if not app.is_active_super_admin() and v_payment.recorded_by=auth.uid() then
  raise exception 'Pencatat pembayaran tidak dapat merekonsiliasi pembayaran yang sama.' using errcode='42501';
 end if;

 if not exists(
  select 1 from public.media_assets a
  where a.id=p_proof_asset_id and a.bucket='company-documents'
    and a.path like 'finance/%' and a.path not like 'finance/refunds/%'
    and a.path not like 'finance/expenses/%' and a.visibility='private'
    and a.finalized_at is not null and a.uploaded_by=auth.uid()
 ) then
  raise exception 'Bukti pembayaran finance tidak valid atau bukan milik reconciler aktif.' using errcode='P0002';
 end if;
 if exists(select 1 from public.finance_bank_reconciliations b where b.proof_asset_id=p_proof_asset_id) then raise exception 'Bukti pembayaran sudah digunakan untuk rekonsiliasi lain.' using errcode='23505'; end if;
 if length(v_ref)<2 then raise exception 'Referensi transaksi bank wajib diisi.' using errcode='22023'; end if;
 if exists(select 1 from public.finance_bank_reconciliations b where lower(btrim(b.bank_reference))=lower(v_ref)) then raise exception 'Referensi transaksi bank sudah digunakan.' using errcode='23505'; end if;
 if p_bank_amount is null or p_bank_amount<>v_payment.amount then raise exception 'Nominal transaksi bank harus sama dengan nominal pembayaran yang dicatat.' using errcode='23514'; end if;
 if p_bank_received_at is null or p_bank_received_at>now()+interval '5 minutes' then raise exception 'Waktu penerimaan dana bank tidak valid.' using errcode='22023'; end if;

 insert into public.finance_bank_reconciliations(payment_id,invoice_id,status,bank_reference,bank_amount,bank_received_at,proof_asset_id,notes,reconciled_by)
 values(v_payment.id,v_payment.invoice_id,'matched',v_ref,p_bank_amount,p_bank_received_at,p_proof_asset_id,nullif(btrim(coalesce(p_notes,'')),''),auth.uid())
 returning id into v_reconciliation_id;

 perform set_config('app.finance_reconciliation_rpc','1',true);
 update public.finance_payments
 set status='confirmed',proof_asset_id=p_proof_asset_id,external_reference=v_ref,received_at=p_bank_received_at,updated_at=now()
 where id=v_payment.id;

 return v_reconciliation_id;
end
$function$;

revoke all on function app.reconcile_finance_payment(uuid,uuid,text,numeric,timestamptz,text) from public,anon;
grant execute on function app.reconcile_finance_payment(uuid,uuid,text,numeric,timestamptz,text) to authenticated,service_role;
