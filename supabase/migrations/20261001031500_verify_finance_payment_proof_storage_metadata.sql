-- Verify the uploaded Storage object instead of trusting payment-proof metadata from the client.
create or replace function app.register_finance_payment_proof_asset(p_path text,p_original_filename text,p_mime_type text,p_byte_size bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_uid uuid:=auth.uid();v_obj storage.objects%rowtype;v_size bigint;v_mime text;
begin
 if v_uid is null or not app.has_permission('finance_payments.reconcile') then raise exception 'Missing permission: finance_payments.reconcile' using errcode='42501';end if;
 if length(btrim(coalesce(p_path,'')))=0 or length(btrim(coalesce(p_original_filename,'')))=0 then raise exception 'Asset path and filename are required.' using errcode='23514';end if;
 if p_path not like 'finance/%' or p_path like 'finance/refunds/%' or p_path like 'finance/expenses/%' then raise exception 'Invalid finance payment proof path.' using errcode='23514';end if;
 select * into v_obj from storage.objects where bucket_id='company-documents' and name=p_path and owner_id=v_uid::text;
 if not found then raise exception 'Uploaded payment proof object was not found.' using errcode='P0002';end if;
 v_size:=coalesce((v_obj.metadata->>'size')::bigint,0);
 v_mime:=lower(coalesce(v_obj.metadata->>'mimetype',''));
 if v_size<=0 or v_size>10485760 then raise exception 'Bukti pembayaran harus berukuran 1 byte sampai 10 MB.' using errcode='23514';end if;
 if v_mime not in('application/pdf','image/jpeg','image/png','image/webp') then raise exception 'Format bukti pembayaran harus PDF, JPEG, PNG, atau WEBP.' using errcode='23514';end if;
 if p_byte_size is distinct from v_size then raise exception 'Payment proof size does not match uploaded object.' using errcode='23514';end if;
 if lower(btrim(coalesce(p_mime_type,''))) is distinct from v_mime then raise exception 'Payment proof MIME type does not match uploaded object.' using errcode='23514';end if;
 insert into public.media_assets(bucket,path,original_filename,mime_type,byte_size,visibility,uploaded_by,finalized_at)
 values('company-documents',p_path,btrim(p_original_filename),v_mime,v_size,'private',v_uid,now()) returning id into v_id;
 return v_id;
end $$;
