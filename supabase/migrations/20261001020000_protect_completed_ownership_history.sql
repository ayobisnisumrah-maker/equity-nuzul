-- Preserve completed ownership history because profit-distribution cutoff
-- reconstruction depends on immutable completion actors, timestamps and economics.

create or replace function app.guard_completed_ownership_history_immutability()
returns trigger language plpgsql set search_path=''
as $function$
begin
 if tg_table_name='ownership_transfers' and old.status='completed' then
  if new.holding_id is distinct from old.holding_id
     or new.from_investor_id is distinct from old.from_investor_id
     or new.to_investor_id is distinct from old.to_investor_id
     or new.units is distinct from old.units
     or new.transfer_kind is distinct from old.transfer_kind
     or new.completed_at is distinct from old.completed_at
     or new.completed_by is distinct from old.completed_by
     or new.agreed_unit_price is distinct from old.agreed_unit_price
     or new.status is distinct from old.status then
   raise exception 'Completed ownership transfer history is immutable.' using errcode='23514';
  end if;
 elsif tg_table_name='ownership_inheritance' and old.status='completed' then
  if new.holding_id is distinct from old.holding_id
     or new.current_investor_id is distinct from old.current_investor_id
     or new.beneficiary_investor_id is distinct from old.beneficiary_investor_id
     or new.beneficiary_holding_id is distinct from old.beneficiary_holding_id
     or new.units is distinct from old.units
     or new.inherited_ownership_bps is distinct from old.inherited_ownership_bps
     or new.completed_at is distinct from old.completed_at
     or new.completed_by is distinct from old.completed_by
     or new.status is distinct from old.status then
   raise exception 'Completed ownership inheritance history is immutable.' using errcode='23514';
  end if;
 end if;
 return new;
end;$function$;

drop trigger if exists ownership_transfers_completed_immutability_guard on public.ownership_transfers;
create trigger ownership_transfers_completed_immutability_guard
before update on public.ownership_transfers
for each row execute function app.guard_completed_ownership_history_immutability();

drop trigger if exists ownership_inheritance_completed_immutability_guard on public.ownership_inheritance;
create trigger ownership_inheritance_completed_immutability_guard
before update on public.ownership_inheritance
for each row execute function app.guard_completed_ownership_history_immutability();

revoke all on function app.guard_completed_ownership_history_immutability() from public,anon,authenticated;
