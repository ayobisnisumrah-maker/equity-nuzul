drop policy if exists finance_payments_insert on public.finance_payments;
drop policy if exists finance_payments_update on public.finance_payments;
drop policy if exists finance_payments_delete on public.finance_payments;
drop policy if exists finance_refunds_insert on public.finance_refunds;
drop policy if exists finance_refunds_update on public.finance_refunds;
drop policy if exists finance_refunds_delete on public.finance_refunds;

revoke insert, update, delete on public.finance_payments from authenticated;
revoke insert, update, delete on public.finance_refunds from authenticated;
