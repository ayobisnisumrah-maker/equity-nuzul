create or replace function app.validate_financial_report_economic_inputs() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.amount<0 and new.line_key not in('gross_profit','net_profit') then raise exception 'Financial economic input cannot be negative; only calculated profit/loss subtotals may be negative.' using errcode='23514';end if;
 if new.line_key in('gross_profit','net_profit') and not(new.statement='income' and new.category='revenue') then raise exception 'Profit/loss subtotal classification is invalid.' using errcode='23514';end if;
 if new.line_key in('revenue_total','expense_total') then
  if new.currency<>'IDR' then raise exception 'Canonical revenue/expense totals must use IDR.' using errcode='23514';end if;
  if new.line_key='revenue_total' and not(new.statement='income' and new.category='revenue') then raise exception 'revenue_total classification is invalid.' using errcode='23514';end if;
  if new.line_key='expense_total' and not(new.statement='income' and new.category='expense') then raise exception 'expense_total classification is invalid.' using errcode='23514';end if;
 end if;return new;
end$$;