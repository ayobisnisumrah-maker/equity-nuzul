create or replace function app.create_monthly_financial_period(p_year integer,p_month integer)
returns public.financial_periods
language plpgsql security definer set search_path=''
as $$
declare v_actor uuid:=auth.uid(); v_start date; v_end date; v_row public.financial_periods%rowtype;
begin
 if v_actor is null or not app.has_permission('financial_periods.create') then raise exception 'Missing permission: financial_periods.create' using errcode='42501'; end if;
 if p_year<2024 or p_year>2100 or p_month<1 or p_month>12 then raise exception 'Invalid monthly financial period.' using errcode='22023'; end if;
 v_start:=make_date(p_year,p_month,1);
 v_end:=(v_start+interval '1 month-1 day')::date;
 select * into v_row from public.financial_periods where period_type='monthly' and fiscal_year=p_year and period_index=p_month;
 if found then return v_row; end if;
 insert into public.financial_periods(period_type,fiscal_year,period_index,starts_on,ends_on,currency,status)
 values('monthly',p_year,p_month,v_start,v_end,'IDR','open') returning * into v_row;
 insert into public.audit_logs(actor_id,actor_type,action,entity_type,entity_id,summary,changes)
 values(v_actor,app.current_actor_type(),'financial_period.create','financial_period',v_row.id,'Monthly financial period created',jsonb_build_object('fiscal_year',p_year,'month',p_month,'starts_on',v_start,'ends_on',v_end));
 return v_row;
end $$;
revoke all on function app.create_monthly_financial_period(integer,integer) from public,anon;
grant execute on function app.create_monthly_financial_period(integer,integer) to authenticated;
