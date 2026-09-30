-- Financial period dates define report and ownership cutoffs.
-- Keep the calendar identity immutable and prohibit reopening/backdating.

create or replace function app.guard_financial_period_temporal_integrity()
returns trigger language plpgsql set search_path=''
as $function$
begin
 if new.period_type is distinct from old.period_type
    or new.fiscal_year is distinct from old.fiscal_year
    or new.period_index is distinct from old.period_index
    or new.starts_on is distinct from old.starts_on
    or new.ends_on is distinct from old.ends_on
    or new.currency is distinct from old.currency then
   raise exception 'Financial period calendar identity is immutable.' using errcode='23514';
 end if;

 if new.status is distinct from old.status then
   if not (
     (old.status='open' and new.status='closed')
     or (old.status='closed' and new.status='locked')
   ) then
     raise exception 'Invalid financial period transition: % -> %',old.status,new.status using errcode='23514';
   end if;
   if new.status in ('closed','locked') and old.ends_on>current_date then
     raise exception 'Financial period cannot be closed or locked before its end date (%).',old.ends_on using errcode='23514';
   end if;
 end if;
 return new;
end;$function$;

drop trigger if exists financial_periods_temporal_integrity_guard on public.financial_periods;
create trigger financial_periods_temporal_integrity_guard
before update on public.financial_periods
for each row execute function app.guard_financial_period_temporal_integrity();

revoke all on function app.guard_financial_period_temporal_integrity() from public,anon,authenticated;
