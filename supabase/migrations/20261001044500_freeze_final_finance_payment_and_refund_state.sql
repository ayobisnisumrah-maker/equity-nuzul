-- Confirmed payments and processed refunds are accounting final states.
create or replace function app.guard_confirmed_finance_payment_immutable()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='confirmed' and (
  new.status is distinct from old.status or new.invoice_id is distinct from old.invoice_id or new.reference is distinct from old.reference or
  new.amount is distinct from old.amount or new.currency is distinct from old.currency or new.method is distinct from old.method or
  new.external_reference is distinct from old.external_reference or new.received_at is distinct from old.received_at or
  new.proof_asset_id is distinct from old.proof_asset_id or new.recorded_by is distinct from old.recorded_by or new.idempotency_key is distinct from old.idempotency_key
 ) then raise exception 'Confirmed finance payment is immutable.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists confirmed_finance_payment_immutable_guard on public.finance_payments;
create trigger confirmed_finance_payment_immutable_guard before update on public.finance_payments for each row execute function app.guard_confirmed_finance_payment_immutable();

create or replace function app.guard_processed_finance_refund_immutable()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='processed' and (
  new.status is distinct from old.status or new.invoice_id is distinct from old.invoice_id or new.payment_id is distinct from old.payment_id or
  new.reference is distinct from old.reference or new.amount is distinct from old.amount or new.reason is distinct from old.reason or
  new.requested_by is distinct from old.requested_by or new.requested_at is distinct from old.requested_at or
  new.approved_by is distinct from old.approved_by or new.approved_at is distinct from old.approved_at or
  new.processed_by is distinct from old.processed_by or new.processed_at is distinct from old.processed_at or
  new.proof_asset_id is distinct from old.proof_asset_id or new.bank_reference is distinct from old.bank_reference or new.idempotency_key is distinct from old.idempotency_key
 ) then raise exception 'Processed finance refund is immutable.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists processed_finance_refund_immutable_guard on public.finance_refunds;
create trigger processed_finance_refund_immutable_guard before update on public.finance_refunds for each row execute function app.guard_processed_finance_refund_immutable();

revoke all on function app.guard_confirmed_finance_payment_immutable() from public,anon,authenticated,service_role;
revoke all on function app.guard_processed_finance_refund_immutable() from public,anon,authenticated,service_role;
