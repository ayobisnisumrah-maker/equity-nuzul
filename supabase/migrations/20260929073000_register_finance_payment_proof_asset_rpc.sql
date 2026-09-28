create or replace function app.register_finance_payment_proof_asset(p_path text,p_original_filename text,p_mime_type text,p_byte_size bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_uid uuid:=auth.uid();
begin
 if v_uid is null or not app.has_permission('finance_payments.reconcile') then raise exception 'Missing permission: finance_payments.reconcile' using errcode='42501'; end if;
 if length(btrim(coalesce(p_path,'')))=0 or length(btrim(coalesce(p_original_filename,'')))=0 then raise exception 'Asset path and filename are required.' using errcode='23514'; end if;
 if p_byte_size<=0 then raise exception 'Payment proof must not be empty.' using errcode='23514'; end if;
 if p_path not like 'finance/%' then raise exception 'Invalid finance proof path.' using errcode='23514'; end if;
 if not exists(select 1 from storage.objects where bucket_id='company-documents' and name=p_path and owner_id=v_uid::text) then raise exception 'Uploaded payment proof object was not found.' using errcode='P0002'; end if;
 insert into public.media_assets(bucket,path,original_filename,mime_type,byte_size,visibility,uploaded_by,finalized_at)
 values('company-documents',p_path,btrim(p_original_filename),coalesce(nullif(btrim(p_mime_type),''),'application/octet-stream'),p_byte_size,'private',v_uid,now()) returning id into v_id;
 return v_id;
end $$;
revoke all on function app.register_finance_payment_proof_asset(text,text,text,bigint) from public,anon;
grant execute on function app.register_finance_payment_proof_asset(text,text,text,bigint) to authenticated;