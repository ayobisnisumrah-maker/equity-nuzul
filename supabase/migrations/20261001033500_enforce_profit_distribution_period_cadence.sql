create or replace function app.assert_profit_distribution_period_cadence(p_offering_id uuid,p_period_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_cadence smallint;v_type public.period_type;
begin
 perform app.assert_canonical_financial_period(p_period_id);
 select distribution_cadence_months into v_cadence from public.ownership_offerings where id=p_offering_id;
 if v_cadence is null then raise exception 'Ownership offering not found.' using errcode='P0002';end if;
 select period_type into v_type from public.financial_periods where id=p_period_id;
 if v_cadence=1 and v_type<>'monthly' then raise exception 'Monthly ownership distribution cadence requires a monthly financial period.' using errcode='23514';end if;
 if v_cadence=3 and v_type<>'quarterly' then raise exception 'Quarterly ownership distribution cadence requires a quarterly financial period.' using errcode='23514';end if;
 if v_cadence=12 and v_type<>'yearly' then raise exception 'Yearly ownership distribution cadence requires a yearly financial period.' using errcode='23514';end if;
 if v_cadence not in(1,3,12) then raise exception 'Unsupported ownership distribution cadence: % months.',v_cadence using errcode='23514';end if;
end $$;
revoke all on function app.assert_profit_distribution_period_cadence(uuid,uuid) from public,anon,authenticated;
grant execute on function app.assert_profit_distribution_period_cadence(uuid,uuid) to service_role;

create or replace function app.guard_profit_distribution_period_cadence()
returns trigger language plpgsql set search_path='' as $$
declare v_period_id uuid;
begin
 select fr.financial_period_id into v_period_id
 from public.financial_report_versions fv join public.financial_reports fr on fr.id=fv.financial_report_id
 where fv.id=new.financial_report_version_id;
 if v_period_id is null then raise exception 'Financial report period not found.' using errcode='P0002';end if;
 perform app.assert_profit_distribution_period_cadence(new.offering_id,v_period_id);
 return new;
end $$;
revoke all on function app.guard_profit_distribution_period_cadence() from public,anon,authenticated;

drop trigger if exists profit_distributions_guard_period_cadence on public.profit_distributions;
create trigger profit_distributions_guard_period_cadence before insert or update of offering_id,financial_report_version_id
on public.profit_distributions for each row execute function app.guard_profit_distribution_period_cadence();
