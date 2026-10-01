-- Only canonical accounting periods may freeze cash dates; legacy malformed periods remain audit history.
create or replace function app.assert_financial_cash_date_open(p_cash_date date)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_cash_date is null then raise exception 'Cash transaction date is required.' using errcode='23514';end if;
 if exists(
  select 1 from public.financial_periods fp
  where p_cash_date between fp.starts_on and fp.ends_on
    and app.is_canonical_financial_period(fp.id)
    and (
      fp.status in('closed','locked')
      or exists(select 1 from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status in('review','approved','published'))
    )
 ) then raise exception 'Canonical financial period for cash transaction date is frozen.' using errcode='42501';end if;
end $$;
revoke all on function app.assert_financial_cash_date_open(date) from public,anon,authenticated;
grant execute on function app.assert_financial_cash_date_open(date) to service_role;
