-- Reconcile unavoidable 2-decimal rounding residuals across investor
-- allocations. The residual is assigned deterministically to the allocation
-- with the smallest holding_id, then the canonical allocation assertion runs.

create or replace function app.reconcile_profit_distribution_rounding(p_distribution_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_pool numeric(20,2);v_sum numeric(20,2);v_delta numeric(20,2);v_target uuid;
begin
 select investor_pool_amount into v_pool from public.profit_distributions where id=p_distribution_id for update;
 if v_pool is null then raise exception 'Distribution not found.' using errcode='P0002';end if;
 select coalesce(sum(allocation_amount),0) into v_sum from public.profit_distribution_allocations where distribution_id=p_distribution_id and status<>'cancelled';
 v_delta:=round(v_pool-v_sum,2);
 if v_delta=0 then return;end if;
 select id into v_target from public.profit_distribution_allocations where distribution_id=p_distribution_id and status<>'cancelled' order by holding_id,id limit 1 for update;
 if v_target is null then raise exception 'Cannot reconcile a non-zero investor pool without allocations.' using errcode='23514';end if;
 update public.profit_distribution_allocations set allocation_amount=allocation_amount+v_delta where id=v_target;
 if (select allocation_amount from public.profit_distribution_allocations where id=v_target)<0 then raise exception 'Rounding reconciliation would create a negative allocation.' using errcode='23514';end if;
end $$;
revoke all on function app.reconcile_profit_distribution_rounding(uuid) from public,anon,authenticated;
grant execute on function app.reconcile_profit_distribution_rounding(uuid) to service_role;

do $$
declare v_def text;
begin
 select pg_get_functiondef(p.oid) into v_def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app' and p.proname='regenerate_profit_distribution_allocations';
 if position('app.reconcile_profit_distribution_rounding(p_distribution_id)' in v_def)=0 then
  v_def:=replace(v_def,'return query select * from public.profit_distribution_allocations where distribution_id=p_distribution_id order by created_at,id;','perform app.reconcile_profit_distribution_rounding(p_distribution_id);'||chr(10)||'  perform app.assert_profit_distribution_allocations(p_distribution_id);'||chr(10)||'  return query select * from public.profit_distribution_allocations where distribution_id=p_distribution_id order by created_at,id;');
  execute v_def;
 end if;
end $$;
