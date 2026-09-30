-- Emit payout allocation realtime events when the payment actor changes too.
create or replace function app.emit_profit_distribution_allocation_events()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_actor text:=app.current_actor_type();
begin
 if tg_op='INSERT'
 or new.status is distinct from old.status
 or new.allocation_amount is distinct from old.allocation_amount
 or new.paid_at is distinct from old.paid_at
 or new.paid_by is distinct from old.paid_by
 or new.payment_reference is distinct from old.payment_reference then
  perform app.emit_event(app.topic_investor(new.investor_id),'profit_distribution.changed','profit_distribution_allocation',new.id,v_actor);
  perform app.emit_event(app.topic_admin(),'profit_distribution.changed','profit_distribution_allocation',new.id,v_actor);
 end if;
 return null;
end $$;
revoke all on function app.emit_profit_distribution_allocation_events() from public,anon,authenticated;
