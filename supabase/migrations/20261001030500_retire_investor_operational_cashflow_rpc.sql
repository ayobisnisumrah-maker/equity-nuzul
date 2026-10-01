-- Retire the legacy investor cashflow RPC.
-- It exposed company-wide operational payment/refund/expense aggregates from a
-- SECURITY DEFINER function after only checking that the caller was an investor.
-- Investor reporting must use published financial reports and distribution snapshots.
create or replace function app.investor_monthly_cashflow_summary(p_months integer default 6)
returns table(month_start date,cash_in numeric,cash_out numeric,net_cashflow numeric,pax numeric)
language plpgsql security definer set search_path='' as $$
begin
 raise exception 'Direct operational cashflow summary is not available to investor sessions. Use published financial reports and profit-distribution snapshots.'
   using errcode='42501';
end $$;

revoke execute on function app.investor_monthly_cashflow_summary(integer) from public,anon,authenticated;
