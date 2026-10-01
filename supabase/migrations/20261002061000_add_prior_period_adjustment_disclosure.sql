-- Prior-period adjustment disclosure for financial reporting.
-- Production definition: app.financial_period_adjustment_disclosure(uuid)
-- Returns adjustment count, revenue/expense adjustment totals, net-profit impact,
-- and immutable source-period references for every posted finance_adjustment in the posting period.
-- Access is restricted to financial_reports.view or finance_expenses.record inside the SECURITY DEFINER function.
revoke all on function app.financial_period_adjustment_disclosure(uuid) from public,anon;
grant execute on function app.financial_period_adjustment_disclosure(uuid) to authenticated,service_role;
