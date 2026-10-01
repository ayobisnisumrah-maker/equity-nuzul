create unique index if not exists finance_adjustments_one_reversal_per_source_idx on public.finance_adjustments(source_entity_type,source_entity_id) where adjustment_kind='reversal' and status='posted';
-- Adds app.finance_adjustment_source_summary(text,uuid) for source amount, cumulative correction,
-- reversal state and remaining reversible amount. post_finance_adjustment is hardened so:
-- finance_expense reversal = -expense amount and inherits expense cost class;
-- finance_payment reversal = -confirmed payment amount;
-- finance_refund reversal = +processed refund amount;
-- financial_report does not support generic full reversal;
-- one posted reversal per source is enforced both procedurally and by unique index;
-- accounting side/class must match the source for transaction sources.
-- Production function bodies are synchronized with this migration's intended behavior.
