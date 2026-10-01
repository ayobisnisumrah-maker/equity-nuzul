-- Final table-level invariant for processed refunds, including concurrency-safe payment/invoice locking.
create or replace function app.guard_processed_finance_refund_amount()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_payment public.finance_payments%rowtype;v_invoice_paid numeric;v_processed_invoice numeric;v_processed_payment numeric;
begin
 if new.status<>'processed' or (tg_op='UPDATE' and old.status='processed') then return new;end if;
 select * into v_payment from public.finance_payments where id=new.payment_id for update;
 if not found or v_payment.invoice_id<>new.invoice_id or v_payment.status<>'confirmed' then raise exception 'Processed refund must reference a confirmed payment on the same invoice.' using errcode='23514';end if;
 perform 1 from public.finance_invoices where id=new.invoice_id for update;if not found then raise exception 'Refund invoice not found.' using errcode='P0002';end if;
 select coalesce(sum(amount),0) into v_invoice_paid from public.finance_payments where invoice_id=new.invoice_id and status='confirmed';
 select coalesce(sum(amount),0) into v_processed_invoice from public.finance_refunds where invoice_id=new.invoice_id and status='processed' and id<>new.id;
 select coalesce(sum(amount),0) into v_processed_payment from public.finance_refunds where payment_id=new.payment_id and status='processed' and id<>new.id;
 if new.amount is null or new.amount<=0 or v_processed_invoice+new.amount>v_invoice_paid or v_processed_payment+new.amount>v_payment.amount then raise exception 'Processed refund exceeds confirmed payment balance.' using errcode='23514';end if;
 return new;
end $$;
revoke all on function app.guard_processed_finance_refund_amount() from public,anon,authenticated,service_role;
drop trigger if exists finance_refunds_processed_amount_guard on public.finance_refunds;
create trigger finance_refunds_processed_amount_guard before insert or update of status,amount,payment_id,invoice_id on public.finance_refunds
for each row execute function app.guard_processed_finance_refund_amount();
