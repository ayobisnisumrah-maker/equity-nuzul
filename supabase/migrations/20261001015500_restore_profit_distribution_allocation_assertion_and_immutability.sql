-- Restore the canonical allocation assertion used by distribution transitions and
-- prevent allocation identity/economics from changing after review.

create or replace function app.assert_profit_distribution_allocations(p_distribution_id uuid)
returns void language plpgsql security definer set search_path=''
as $function$
declare
 v_distribution public.profit_distributions%rowtype;
 v_sum numeric(20,2);
 v_bad integer;
begin
 select * into v_distribution from public.profit_distributions where id=p_distribution_id;
 if v_distribution.id is null then raise exception 'Distribution not found.' using errcode='P0002'; end if;

 select count(*) into v_bad
 from public.profit_distribution_allocations a
 join public.ownership_holdings h on h.id=a.holding_id
 where a.distribution_id=p_distribution_id
 and (a.investor_id is distinct from h.investor_id
      or h.offering_id is distinct from v_distribution.offering_id
      or a.ownership_bps<=0
      or a.allocation_amount<0);
 if v_bad>0 then raise exception 'Profit distribution allocations are inconsistent with ownership holdings.' using errcode='23514'; end if;

 select coalesce(sum(a.allocation_amount),0) into v_sum
 from public.profit_distribution_allocations a
 where a.distribution_id=p_distribution_id and a.status<>'cancelled';
 if v_sum is distinct from v_distribution.investor_pool_amount then
  raise exception 'Allocation total (%) does not match investor pool (%).',v_sum,v_distribution.investor_pool_amount using errcode='23514';
 end if;
end;$function$;

revoke all on function app.assert_profit_distribution_allocations(uuid) from public,anon,authenticated;
grant execute on function app.assert_profit_distribution_allocations(uuid) to service_role;

create or replace function app.guard_profit_distribution_allocation_immutability()
returns trigger language plpgsql set search_path=''
as $function$
declare v_parent_status public.profit_distribution_status;
begin
 if tg_op='UPDATE' then
  select status into v_parent_status from public.profit_distributions where id=old.distribution_id;
  if new.distribution_id is distinct from old.distribution_id
     or new.holding_id is distinct from old.holding_id
     or new.investor_id is distinct from old.investor_id
     or new.ownership_bps is distinct from old.ownership_bps
     or new.investor_pool_share_bps is distinct from old.investor_pool_share_bps
     or new.allocation_amount is distinct from old.allocation_amount then
    if v_parent_status not in ('draft','review') then
      raise exception 'Allocation identity and economics are immutable after review.' using errcode='23514';
    end if;
  end if;
 end if;
 return new;
end;$function$;

drop trigger if exists profit_distribution_allocation_immutability_guard on public.profit_distribution_allocations;
create trigger profit_distribution_allocation_immutability_guard
before update on public.profit_distribution_allocations
for each row execute function app.guard_profit_distribution_allocation_immutability();

revoke all on function app.guard_profit_distribution_allocation_immutability() from public,anon,authenticated;
