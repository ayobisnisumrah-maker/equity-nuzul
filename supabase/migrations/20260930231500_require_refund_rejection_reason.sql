-- Refund rejection must carry an auditable reason. Canonical RPC definition is managed in production migration require_refund_rejection_reason_and_audit_decision.
-- Database-level invariant for rejected rows:
alter table public.finance_refunds drop constraint if exists finance_refunds_rejection_reason_check;
alter table public.finance_refunds add constraint finance_refunds_rejection_reason_check check (status<>'rejected' or length(btrim(coalesce(notes,'')))>=5) not valid;
alter table public.finance_refunds validate constraint finance_refunds_rejection_reason_check;
