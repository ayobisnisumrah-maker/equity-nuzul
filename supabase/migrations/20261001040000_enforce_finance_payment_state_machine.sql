-- Enforce a single accounting model: payment records stay confirmed; refunds live in finance_refunds.
create or replace function app.guard_finance_payment_state_machine()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.status<>'pending' then raise exception 'New finance payment must start as pending.' using errcode='23514';end if;
  return new;
 end if;
 if new.status is distinct from old.status then
  if old.status='pending' and new.status in('confirmed','failed') then return new;end if;
  raise exception 'Invalid finance payment status transition: % -> %. Refunds must be recorded in finance_refunds.',old.status,new.status using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function app.guard_finance_payment_state_machine() from public,anon,authenticated,service_role;
drop trigger if exists finance_payment_state_machine_guard on public.finance_payments;
create trigger finance_payment_state_machine_guard before insert or update of status on public.finance_payments
for each row execute function app.guard_finance_payment_state_machine();
