revoke all on function app.create_monthly_financial_period(integer,integer) from public,anon,authenticated;
grant execute on function app.create_monthly_financial_period(integer,integer) to service_role;
