drop policy if exists finance_expenses_update on public.finance_expenses;
drop policy if exists finance_expenses_delete on public.finance_expenses;
revoke update, delete on public.finance_expenses from authenticated;
