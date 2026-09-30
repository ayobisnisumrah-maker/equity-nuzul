-- Reconcile profit-distribution payable actor controls with production and
-- include approval/payable audit-field changes in realtime events.

create or replace function app.guard_profit_distribution_publish_separation_of_duties()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare
 v_super boolean:=exists(
  select 1 from public.admins a
  join public.roles r on r.id=a.role_id
  join public.user_accounts u on u.id=a.id
  where a.id=auth.uid() and a.is_active and u.status='active' and r.key='super_admin'
 );
begin
 if old.status is distinct from 'payable' and new.status='payable' then
  new.payable_by:=auth.uid();
  new.payable_at:=coalesce(new.payable_at,now());
  if not v_super and new.approved_by is not null and new.approved_by=new.payable_by then
   raise exception 'Distribution approver cannot release the same distribution for payment.' using errcode='42501';
  end if;
 end if;
 if old.status in('payable','paid') and
    (new.payable_by is distinct from old.payable_by or new.payable_at is distinct from old.payable_at) then
  raise exception 'Distribution payable audit fields are immutable.' using errcode='42501';
 end if;
 return new;
end;$function$;

drop trigger if exists profit_distribution_publish_separation_guard on public.profit_distributions;
create trigger profit_distribution_publish_separation_guard
before update on public.profit_distributions
for each row execute function app.guard_profit_distribution_publish_separation_of_duties();

revoke all on function app.guard_profit_distribution_publish_separation_of_duties() from public,anon,authenticated;

create or replace function app.emit_profit_distribution_events()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_actor text:=app.current_actor_type(); v_changed boolean:=false;
begin
 if tg_op='INSERT' then v_changed:=true;
 else
  v_changed:=
   new.offering_id is distinct from old.offering_id or
   new.period_start is distinct from old.period_start or
   new.period_end is distinct from old.period_end or
   new.revenue_amount is distinct from old.revenue_amount or
   new.opex_amount is distinct from old.opex_amount or
   new.profit_amount is distinct from old.profit_amount or
   new.company_share_bps is distinct from old.company_share_bps or
   new.investor_pool_bps is distinct from old.investor_pool_bps or
   new.investor_pool_amount is distinct from old.investor_pool_amount or
   new.status is distinct from old.status or
   new.approved_at is distinct from old.approved_at or
   new.approved_by is distinct from old.approved_by or
   new.payable_at is distinct from old.payable_at or
   new.payable_by is distinct from old.payable_by or
   new.paid_at is distinct from old.paid_at or
   new.notes is distinct from old.notes;
 end if;
 if v_changed then
  perform app.emit_event(app.topic_admin(),'profit_distribution.changed','profit_distribution',new.id,v_actor);
  perform app.emit_event(app.topic_investor(a.investor_id),'profit_distribution.changed','profit_distribution',new.id,v_actor)
  from (select distinct investor_id from public.profit_distribution_allocations where distribution_id=new.id) a;
 end if;
 return null;
end;$function$;

revoke all on function app.emit_profit_distribution_events() from public,anon,authenticated;
