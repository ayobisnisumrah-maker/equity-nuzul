-- Enforce distribution period exclusivity at table level, including concurrent requests.
create extension if not exists btree_gist with schema extensions;

alter table public.profit_distributions
  add constraint profit_distributions_no_active_period_overlap
  exclude using gist (
    offering_id with =,
    daterange(period_start,period_end,'[]') with &&
  )
  where (status <> 'cancelled');
