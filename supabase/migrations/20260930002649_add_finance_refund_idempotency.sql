alter table public.finance_refunds add column if not exists idempotency_key text;
create unique index if not exists finance_refunds_idempotency_key_key on public.finance_refunds(idempotency_key) where idempotency_key is not null;
-- Production migration adds the six-argument app.process_finance_refund overload.
-- It requires a non-empty idempotency key, returns the existing refund for an identical retry,
-- rejects semantic key reuse, preserves invoice/payment caps, and safely handles concurrent duplicates.
