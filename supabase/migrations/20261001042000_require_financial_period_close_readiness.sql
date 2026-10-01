-- Do not close a canonical period while its operational workflow is still unsettled.
create or replace function app.close_financial_period(p_period_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare fp public.financial_periods%rowtype;
begin
 if not app.has_permission('financial_periods.close') then raise exception 'Missing permission: financial_periods.close' using errcode='42501';end if;
 select * into fp from public.financial_periods where id=p_period_id for update;if fp.id is null then raise exception 'Financial period not found.' using errcode='P0002';end if;
 perform app.assert_canonical_financial_period(fp.id);
 if fp.status<>'open' then raise exception 'Only open financial periods can be closed.' using errcode='23514';end if;
 if fp.ends_on>=current_date then raise exception 'Financial period can only be closed after its end date (%).',fp.ends_on using errcode='23514';end if;
 if exists(select 1 from public.finance_payments p where p.status='pending' and p.received_at::date between fp.starts_on and fp.ends_on) then raise exception 'Financial period has pending payments.' using errcode='23514';end if;
 if exists(select 1 from public.finance_refunds r join public.finance_payments p on p.id=r.payment_id where r.status in('requested','approved') and p.received_at::date between fp.starts_on and fp.ends_on) then raise exception 'Financial period has unresolved refund requests for payments received in this period.' using errcode='23514';end if;
 if exists(select 1 from public.financial_reports fr where fr.financial_period_id=fp.id and fr.status in('draft','review','approved')) then raise exception 'Financial period has an unfinished financial report workflow.' using errcode='23514';end if;
 update public.financial_periods set status='closed',updated_at=now() where id=fp.id;
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'financial_period.closed','financial_period',fp.id,'Financial period closed.',jsonb_build_object('starts_on',fp.starts_on,'ends_on',fp.ends_on));
end $$;
