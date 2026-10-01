-- One holding may only contribute once to a distribution, and allocation membership freezes after review.
create unique index profit_distribution_allocations_distribution_holding_unique
on public.profit_distribution_allocations(distribution_id,holding_id);

create or replace function app.guard_profit_distribution_allocation_membership()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_distribution_id uuid;v_parent_status public.profit_distribution_status;
begin
 v_distribution_id:=case when tg_op='DELETE' then old.distribution_id else new.distribution_id end;
 select status into v_parent_status from public.profit_distributions where id=v_distribution_id;
 if v_parent_status not in('draft','review') then
   raise exception 'Allocation membership is immutable after distribution review.' using errcode='23514';
 end if;
 return case when tg_op='DELETE' then old else new end;
end $$;

drop trigger if exists profit_distribution_allocation_membership_guard on public.profit_distribution_allocations;
create trigger profit_distribution_allocation_membership_guard
before insert or delete on public.profit_distribution_allocations
for each row execute function app.guard_profit_distribution_allocation_membership();

revoke all on function app.guard_profit_distribution_allocation_membership() from public,anon,authenticated,service_role;
