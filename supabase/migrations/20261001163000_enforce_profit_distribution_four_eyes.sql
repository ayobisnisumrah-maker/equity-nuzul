-- Enforce four-eyes controls for profit distribution lifecycle and payout confirmation.
create or replace function app.transition_profit_distribution(p_distribution_id uuid,p_target public.profit_distribution_status)
returns public.profit_distributions language plpgsql security definer set search_path=''
as $$
declare v_row public.profit_distributions%rowtype;v_required text;v_now timestamptz:=now();
begin
 select * into v_row from public.profit_distributions where id=p_distribution_id for update;
 if v_row.id is null then raise exception 'Distribution not found.' using errcode='P0002';end if;
 if v_row.status='draft' and p_target='review' then v_required:='profit_distributions.update';
 elsif v_row.status='review' and p_target='approved' then v_required:='profit_distributions.approve';
 elsif v_row.status='approved' and p_target='payable' then v_required:='profit_distributions.publish';
 else raise exception 'Invalid distribution transition: % -> %',v_row.status,p_target using errcode='42501';end if;
 if not app.has_permission(v_required) then raise exception 'Missing permission: %',v_required using errcode='42501';end if;
 if p_target='approved' and v_row.created_by=auth.uid() then raise exception 'Pembuat distribusi tidak dapat menyetujui distribusi yang sama.' using errcode='42501';end if;
 if p_target='payable' and v_row.approved_by=auth.uid() then raise exception 'Penyetuju distribusi tidak dapat menerbitkan distribusi yang sama menjadi payable.' using errcode='42501';end if;
 perform app.assert_profit_distribution_allocations(v_row.id);
 if p_target='review' and v_row.investor_pool_amount>0 and not exists(select 1 from public.profit_distribution_allocations where distribution_id=v_row.id and status='pending') then raise exception 'Investor allocations must be generated before review.' using errcode='23514';end if;
 if p_target='payable' then if v_row.investor_pool_amount>0 and not exists(select 1 from public.profit_distribution_allocations where distribution_id=v_row.id and status='pending') then raise exception 'Pending investor allocations are required before publication.' using errcode='23514';end if;update public.profit_distribution_allocations set status='payable',updated_at=v_now where distribution_id=v_row.id and status='pending';end if;
 update public.profit_distributions set status=p_target,approved_at=case when p_target='approved' then v_now else approved_at end,approved_by=case when p_target='approved' then auth.uid() else approved_by end,payable_at=case when p_target='payable' then v_now else payable_at end,payable_by=case when p_target='payable' then auth.uid() else payable_by end,updated_by=auth.uid() where id=v_row.id returning * into v_row;
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'profit_distribution.'||p_target::text,'profit_distribution',v_row.id,'Status distribusi laba diperbarui.',jsonb_build_object('status',p_target));
 return v_row;
end $$;

create or replace function app.mark_profit_distribution_allocation_paid(p_allocation_id uuid,p_payment_reference text default null)
returns table(allocation_id uuid,distribution_id uuid,allocation_status text,distribution_status public.profit_distribution_status,paid_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_allocation public.profit_distribution_allocations%rowtype;v_distribution public.profit_distributions%rowtype;v_proof public.profit_distribution_payment_proofs%rowtype;v_now timestamptz:=now();v_reference text;v_input_reference text;
begin
 if not app.has_permission('profit_distribution_payments.mark_paid') then raise exception 'Missing permission: profit_distribution_payments.mark_paid' using errcode='42501';end if;
 select a.* into v_allocation from public.profit_distribution_allocations a where a.id=p_allocation_id for update;if v_allocation.id is null then raise exception 'Allocation not found.' using errcode='P0002';end if;if v_allocation.status<>'payable' then raise exception 'Only payable allocations can be marked paid.' using errcode='42501';end if;
 select d.* into v_distribution from public.profit_distributions d where d.id=v_allocation.distribution_id for update;if v_distribution.id is null or v_distribution.status<>'payable' then raise exception 'Parent distribution must be payable.' using errcode='42501';end if;perform app.assert_profit_distribution_allocations(v_distribution.id);
 select p.* into v_proof from public.profit_distribution_payment_proofs p where p.allocation_id=v_allocation.id for share;if v_proof.id is null then raise exception 'Payment proof is required before marking the allocation paid.' using errcode='23514';end if;if v_proof.uploaded_by=auth.uid() then raise exception 'Uploader bukti pembayaran tidak dapat menandai payout yang sama sebagai paid.' using errcode='42501';end if;
 v_reference:=nullif(btrim(coalesce(v_proof.payment_reference,'')),'');if v_reference is null then raise exception 'Payment proof must include a payment reference.' using errcode='23514';end if;v_input_reference:=nullif(btrim(coalesce(p_payment_reference,'')),'');if v_input_reference is not null and v_input_reference<>v_reference then raise exception 'Payment reference must match the registered proof.' using errcode='23514';end if;
 update public.profit_distribution_allocations a set status='paid',paid_at=v_now,payment_reference=v_reference,updated_at=v_now where a.id=v_allocation.id;
 if not exists(select 1 from public.profit_distribution_allocations a where a.distribution_id=v_distribution.id and a.status not in('paid','cancelled')) then update public.profit_distributions d set status='paid',paid_at=v_now,updated_by=auth.uid() where d.id=v_distribution.id;v_distribution.status:='paid';end if;
 insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'profit_distribution.payout_marked_paid','profit_distribution_allocation',v_allocation.id,'Pembayaran bagi hasil investor ditandai paid.',jsonb_build_object('distribution_id',v_distribution.id,'payment_reference',v_reference,'proof_id',v_proof.id));
 return query select v_allocation.id,v_distribution.id,'paid'::text,v_distribution.status,v_now;
end $$;