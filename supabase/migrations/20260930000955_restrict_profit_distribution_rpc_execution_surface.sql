revoke all on function app.create_profit_distribution(uuid,uuid,integer,integer,text) from public,anon;
grant execute on function app.create_profit_distribution(uuid,uuid,integer,integer,text) to authenticated,service_role;
revoke all on function app.transition_profit_distribution(uuid,public.profit_distribution_status) from public,anon;
grant execute on function app.transition_profit_distribution(uuid,public.profit_distribution_status) to authenticated,service_role;
revoke all on function app.mark_profit_distribution_allocation_paid(uuid,text) from public,anon;
grant execute on function app.mark_profit_distribution_allocation_paid(uuid,text) to authenticated,service_role;
revoke all on function app.assert_profit_distribution_allocations(uuid) from public,anon,authenticated;
grant execute on function app.assert_profit_distribution_allocations(uuid) to service_role;
