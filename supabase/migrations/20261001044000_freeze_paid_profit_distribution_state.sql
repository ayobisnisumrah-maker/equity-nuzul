-- Paid payout records are terminal. Protect them even from privileged non-RPC write paths.
create or replace function app.guard_paid_profit_distribution_allocation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='paid' and (
   new.status is distinct from old.status or new.paid_at is distinct from old.paid_at or
   new.paid_by is distinct from old.paid_by or new.payment_reference is distinct from old.payment_reference or
   new.distribution_id is distinct from old.distribution_id or new.holding_id is distinct from old.holding_id or
   new.investor_id is distinct from old.investor_id or new.ownership_bps is distinct from old.ownership_bps or
   new.investor_pool_share_bps is distinct from old.investor_pool_share_bps or new.allocation_amount is distinct from old.allocation_amount
 ) then raise exception 'Paid profit distribution allocation is immutable.' using errcode='23514'; end if;
 return new;
end $$;
drop trigger if exists paid_profit_distribution_allocation_guard on public.profit_distribution_allocations;
create trigger paid_profit_distribution_allocation_guard before update on public.profit_distribution_allocations for each row execute function app.guard_paid_profit_distribution_allocation();

create or replace function app.guard_paid_profit_distribution()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='paid' and new is distinct from old then raise exception 'Paid profit distribution is immutable.' using errcode='23514'; end if;
 return new;
end $$;
drop trigger if exists paid_profit_distribution_guard on public.profit_distributions;
create trigger paid_profit_distribution_guard before update on public.profit_distributions for each row execute function app.guard_paid_profit_distribution();

create or replace function app.guard_paid_profit_distribution_proof()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_status text;
begin
 select status into v_status from public.profit_distribution_allocations where id=case when tg_op='DELETE' then old.allocation_id else new.allocation_id end;
 if v_status='paid' then raise exception 'Payment proof is immutable after payout is paid.' using errcode='23514';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists paid_profit_distribution_proof_guard on public.profit_distribution_payment_proofs;
create trigger paid_profit_distribution_proof_guard before update or delete on public.profit_distribution_payment_proofs for each row execute function app.guard_paid_profit_distribution_proof();

revoke all on function app.guard_paid_profit_distribution_allocation() from public,anon,authenticated,service_role;
revoke all on function app.guard_paid_profit_distribution() from public,anon,authenticated,service_role;
revoke all on function app.guard_paid_profit_distribution_proof() from public,anon,authenticated,service_role;
