-- Ownership snapshots use the same business-day boundary as accounting.
create or replace function app.accounting_period_cutoff(p_period_end date)
returns timestamptz language sql stable security definer set search_path='' as $$
 select ((p_period_end+1)::timestamp at time zone app.accounting_timezone())
$$;
revoke all on function app.accounting_period_cutoff(date) from public,anon,authenticated;
grant execute on function app.accounting_period_cutoff(date) to service_role;

-- create_profit_distribution and guard_profit_distribution_snapshot_transition now call
-- app.accounting_period_cutoff(period_end) instead of interpreting the next midnight as UTC.
-- regenerate_profit_distribution_allocations uses the same helper so allocation membership
-- and pool reconciliation share exactly the same ownership cutoff.
-- Full canonical function definitions are installed in production by this migration.
