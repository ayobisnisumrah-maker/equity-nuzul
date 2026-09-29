create or replace function app.register_profit_distribution_payment_proof(p_allocation_id uuid,p_storage_path text,p_original_file_name text,p_mime_type text,p_file_size_bytes bigint,p_payment_reference text default null) returns uuid language plpgsql security definer set search_path='' as $function$
declare v_allocation public.profit_distribution_allocations%rowtype; v_id uuid; v_expected_prefix text;
begin
 if not app.has_permission('profit_distribution_payments.upload_proof') then raise exception 'Missing permission: profit_distribution_payments.upload_proof' using errcode='42501'; end if;
 select * into v_allocation from public.profit_distribution_allocations where id=p_allocation_id for update;
 if v_allocation.id is null then raise exception 'Allocation not found.' using errcode='P0002'; end if;
 if v_allocation.status <> 'payable' then raise exception 'Payment proof can only be registered for a payable allocation.' using errcode='23514'; end if;
 v_expected_prefix:=v_allocation.investor_id::text||'/'||v_allocation.id::text||'/';
 if p_storage_path is null or position(v_expected_prefix in p_storage_path)<>1 then raise exception 'Invalid payment proof storage path.' using errcode='23514'; end if;
 if length(btrim(coalesce(p_original_file_name,'')))=0 then raise exception 'Original file name is required.' using errcode='23514'; end if;
 if p_mime_type not in ('application/pdf','image/jpeg','image/png','image/webp') then raise exception 'Unsupported payment proof file type.' using errcode='23514'; end if;
 if p_file_size_bytes is null or p_file_size_bytes<=0 or p_file_size_bytes>10485760 then raise exception 'Payment proof file size is invalid.' using errcode='23514'; end if;
 insert into public.profit_distribution_payment_proofs(allocation_id,investor_id,storage_bucket,storage_path,original_file_name,mime_type,file_size_bytes,payment_reference,uploaded_by)
 values(v_allocation.id,v_allocation.investor_id,'profit-distribution-proofs',btrim(p_storage_path),btrim(p_original_file_name),p_mime_type,p_file_size_bytes,nullif(btrim(coalesce(p_payment_reference,'')),''),auth.uid()) returning id into v_id;
 return v_id;
end;$function$;
revoke all on function app.register_profit_distribution_payment_proof(uuid,text,text,text,bigint,text) from public,anon;
grant execute on function app.register_profit_distribution_payment_proof(uuid,text,text,text,bigint,text) to authenticated;
