-- Verify financial-report Storage metadata and prevent document/report versions
-- from referencing unfinalized or cross-workflow assets.
create or replace function app.register_financial_report_asset(p_path text,p_original_filename text,p_mime_type text,p_byte_size bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_uid uuid:=auth.uid();v_obj storage.objects%rowtype;v_size bigint;v_mime text;
begin
 if v_uid is null or not app.has_permission('financial_reports.update') then raise exception 'Missing permission: financial_reports.update' using errcode='42501';end if;
 if length(btrim(coalesce(p_path,'')))=0 or length(btrim(coalesce(p_original_filename,'')))=0 then raise exception 'Asset path and filename are required.' using errcode='23514';end if;
 if lower(coalesce(p_mime_type,''))<>'application/pdf' or p_byte_size<=0 or p_byte_size>20971520 then raise exception 'Financial report attachment must be a PDF up to 20 MB.' using errcode='23514';end if;
 select * into v_obj from storage.objects where bucket_id='financial-documents' and name=p_path and owner_id=v_uid::text;
 if not found then raise exception 'Uploaded financial document object was not found.' using errcode='P0002';end if;
 v_size:=nullif(v_obj.metadata->>'size','')::bigint;v_mime:=lower(coalesce(v_obj.metadata->>'mimetype',''));
 if v_size is not null and v_size<>p_byte_size then raise exception 'Uploaded object size does not match registration.' using errcode='23514';end if;
 if v_mime<>'' and v_mime<>'application/pdf' then raise exception 'Uploaded object MIME type is not PDF.' using errcode='23514';end if;
 insert into public.media_assets(bucket,path,original_filename,mime_type,byte_size,visibility,uploaded_by,finalized_at)
 values('financial-documents',p_path,btrim(p_original_filename),'application/pdf',coalesce(v_size,p_byte_size),'restricted',v_uid,now()) returning id into v_id;return v_id;
end $$;

create or replace function app.guard_version_asset_integrity()
returns trigger language plpgsql set search_path='' as $$
declare v public.media_assets%rowtype;v_asset uuid;
begin
 v_asset:=case when tg_table_name='document_versions' then new.file_asset_id else new.document_asset_id end;
 if v_asset is null then return new;end if;
 select * into v from public.media_assets where id=v_asset;
 if not found or v.finalized_at is null then raise exception 'Version asset must reference a finalized media asset.' using errcode='23514';end if;
 if tg_table_name='document_versions' and (v.bucket<>'company-documents' or v.mime_type<>'application/pdf') then raise exception 'Document version asset must be a finalized company-documents PDF.' using errcode='23514';end if;
 if tg_table_name='financial_report_versions' and (v.bucket<>'financial-documents' or v.mime_type<>'application/pdf') then raise exception 'Financial report version asset must be a finalized financial-documents PDF.' using errcode='23514';end if;
 return new;
end $$;
revoke all on function app.guard_version_asset_integrity() from public,anon,authenticated;

drop trigger if exists document_versions_asset_integrity on public.document_versions;
create trigger document_versions_asset_integrity before insert or update of file_asset_id on public.document_versions for each row execute function app.guard_version_asset_integrity();
drop trigger if exists financial_report_versions_asset_integrity on public.financial_report_versions;
create trigger financial_report_versions_asset_integrity before insert or update of document_asset_id on public.financial_report_versions for each row execute function app.guard_version_asset_integrity();
