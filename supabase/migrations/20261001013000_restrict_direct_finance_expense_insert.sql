-- Finance expenses are created only through app.record_finance_expense(),
-- which performs the canonical permission, validation, idempotency and audit checks.
revoke insert on table public.finance_expenses from authenticated;
