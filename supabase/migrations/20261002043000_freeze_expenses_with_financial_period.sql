create or replace function app.guard_finance_expense_frozen_period() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' and new.status='recorded' then
  perform app.assert_financial_cash_date_open(new.expense_on);
 elsif tg_op='UPDATE' and old.status='recorded' and new.status='void' then
  perform app.assert_financial_cash_date_open(old.expense_on);
 end if;
 return new;
end$$;

revoke all on function app.guard_finance_expense_frozen_period() from public, anon, authenticated;

drop trigger if exists trg_finance_expense_frozen_period on public.finance_expenses;
create trigger trg_finance_expense_frozen_period
before insert or update on public.finance_expenses
for each row execute function app.guard_finance_expense_frozen_period();
