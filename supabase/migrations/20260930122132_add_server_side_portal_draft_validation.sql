create or replace function app.validate_portal_content_draft(p_key text,p_draft jsonb) returns void language plpgsql security definer set search_path='' as $$
declare v_item jsonb;v_seen int[]:=array[]::int[];v_units int;v_url text;
begin
 if p_draft is null or jsonb_typeof(p_draft)<>'object' then raise exception 'Portal draft must be a JSON object.' using errcode='23514';end if;
 if p_key='equity' and p_draft ? 'calculatorOptionsJson' then
  if jsonb_typeof(p_draft->'calculatorOptionsJson')<>'array' or jsonb_array_length(p_draft->'calculatorOptionsJson')=0 then raise exception 'Invalid equity calculator options.' using errcode='23514';end if;
  for v_item in select value from jsonb_array_elements(p_draft->'calculatorOptionsJson') loop
   v_units:=nullif(v_item->>'units','')::int;
   if v_units<1 or v_units>50 or v_units=any(v_seen) or coalesce((v_item->>'price')::numeric,0)<=0 or coalesce((v_item->>'monthlyShare')::numeric,-1)<0 then raise exception 'Invalid equity calculator option.' using errcode='23514';end if;
   v_seen:=array_append(v_seen,v_units);
  end loop;
 end if;
 if p_key='company' and p_draft ? 'imagesJson' then
  if jsonb_typeof(p_draft->'imagesJson')<>'array' or jsonb_array_length(p_draft->'imagesJson')<>5 then raise exception 'Company gallery must contain exactly five images.' using errcode='23514';end if;
  for v_item in select value from jsonb_array_elements(p_draft->'imagesJson') loop if jsonb_typeof(v_item)<>'string' or trim(both '"' from v_item::text)!~'^https://' then raise exception 'Company gallery images must use HTTPS.' using errcode='23514';end if;end loop;
 end if;
 foreach v_url in array array[p_draft->>'logoUrl',p_draft->>'heroImageUrl',p_draft->>'imageUrl'] loop if coalesce(v_url,'')<>'' and v_url!~'^https://' then raise exception 'Portal media URLs must use HTTPS.' using errcode='23514';end if;end loop;
end $$;
revoke all on function app.validate_portal_content_draft(text,jsonb) from public,anon,authenticated;
grant execute on function app.validate_portal_content_draft(text,jsonb) to service_role;
