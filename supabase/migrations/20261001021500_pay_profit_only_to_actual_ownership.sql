-- Profit distributions pay only ownership actually held at the financial
-- period cutoff. total_offered_bps / investor_pool_bps remains the maximum
-- investor ownership cap; unsold units do not receive profit.

create or replace function app.eligible_ownership_bps_at_cutoff(p_offering_id uuid,p_cutoff timestamptz)
returns integer language sql stable security definer set search_path='' as $$
with offering as (
 select unit_ownership_bps from public.ownership_offerings where id=p_offering_id
), movements as (
 select 'transfer'::text movement_kind,t.id,t.holding_id,t.units,t.completed_at
 from public.ownership_transfers t join public.ownership_holdings h on h.id=t.holding_id
 where h.offering_id=p_offering_id and t.status='completed' and t.completed_at is not null
 union all
 select 'inheritance',i.id,i.holding_id,i.units,i.completed_at
 from public.ownership_inheritance i join public.ownership_holdings h on h.id=i.holding_id
 where h.offering_id=p_offering_id and i.status='completed' and i.completed_at is not null
), sequenced as (
 select m.*,row_number() over(partition by m.holding_id order by m.completed_at desc,m.movement_kind desc,m.id desc) reverse_sequence from movements m
), historical as (
 select h.id,h.status,h.ownership_bps+coalesce(sum(case when m.completed_at>=p_cutoff and not(h.status='transferred' and m.reverse_sequence=1) then m.units*o.unit_ownership_bps else 0 end),0)::integer ownership_bps_at_cutoff,
 max(m.completed_at) filter(where m.reverse_sequence=1) final_movement_at
 from public.ownership_holdings h cross join offering o left join sequenced m on m.holding_id=h.id
 where h.offering_id=p_offering_id and h.status in('active','transferred') and h.acquisition_at<p_cutoff
 group by h.id,h.status,h.ownership_bps
)
select coalesce(sum(ownership_bps_at_cutoff),0)::integer from historical
where ownership_bps_at_cutoff>0 and (status='active' or final_movement_at is null or final_movement_at>=p_cutoff)
$$;
revoke all on function app.eligible_ownership_bps_at_cutoff(uuid,timestamptz) from public,anon,authenticated;
grant execute on function app.eligible_ownership_bps_at_cutoff(uuid,timestamptz) to service_role;

-- Keep the canonical generator aligned with actual eligible ownership.
do $$
declare v_def text;
begin
 select pg_get_functiondef(p.oid) into v_def from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='app' and p.proname='regenerate_profit_distribution_allocations';
 v_def:=replace(v_def,'v_pool := round((v_distribution.profit_amount * v_distribution.investor_pool_bps / 10000.0)::numeric, 2);','v_pool := 0;');
 v_def:=replace(v_def,'if v_total_historical_bps > v_distribution.investor_pool_bps then','v_pool := round((v_distribution.profit_amount * v_total_historical_bps / 10000.0)::numeric, 2);'||chr(10)||'  if v_total_historical_bps > v_distribution.investor_pool_bps then');
 execute v_def;
end $$;

-- create_profit_distribution and guard_profit_distribution_snapshot_transition
-- are replaced in production by this migration to compute investor_pool_amount
-- from app.eligible_ownership_bps_at_cutoff(...), never from the full offering
-- cap. Their canonical definitions are intentionally mirrored in subsequent
-- schema pulls as well.
