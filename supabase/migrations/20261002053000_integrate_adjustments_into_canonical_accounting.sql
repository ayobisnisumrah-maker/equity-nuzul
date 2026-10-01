-- Integrate post-close adjustments into canonical accounting.
alter table public.finance_adjustments add column if not exists account_side text;
alter table public.finance_adjustments add constraint finance_adjustments_account_side_check check(account_side in('revenue','expense'));
alter table public.finance_adjustments alter column account_side set not null;
alter table public.finance_adjustments add constraint finance_adjustments_expense_class_required check(account_side<>'expense' or cost_class is not null);
alter table public.finance_adjustments add constraint finance_adjustments_revenue_class_empty check(account_side<>'revenue' or cost_class is null);
-- Production canonical functions updated in the same change: post_finance_adjustment now requires account_side;
-- financial_period_accounting_totals centralizes payments, refunds, expenses and signed adjustments;
-- financial_report_profit_loss_breakdown, financial_report_cash_reconciliation,
-- financial_period_close_readiness and close_financial_period consume those canonical totals.
-- See production function definitions as source of truth for this synchronization migration.
