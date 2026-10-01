CREATE OR REPLACE FUNCTION app.create_finance_invoice(p_customer_name text, p_customer_email text, p_customer_phone text, p_customer_address text, p_due_on date, p_notes text, p_items jsonb, p_idempotency_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id uuid;v_settings public.finance_settings%rowtype;v_key text:=nullif(btrim(coalesce(p_idempotency_key,'')),'');v_existing public.finance_invoices%rowtype;
begin
 if not app.has_permission('finance_invoices.create') then raise exception 'Anda tidak memiliki izin membuat invoice.' using errcode='42501';end if;
 if v_key is null or length(v_key)<8 then raise exception 'Idempotency key invoice wajib diisi.' using errcode='22023';end if;
 select * into v_existing from public.finance_invoices where created_by=auth.uid() and idempotency_key=v_key;if found then return v_existing.id;end if;
 if length(btrim(coalesce(p_customer_name,'')))<2 then raise exception 'Nama pelanggan wajib diisi.' using errcode='22023';end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>100 then raise exception 'Invoice requires 1-100 items' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(p_items) j where coalesce((j->>'estimated_unit_cost')::numeric,0)<0) then raise exception 'HPP estimasi tidak boleh negatif.' using errcode='22023';end if;
 select * into v_settings from public.finance_settings where singleton=true;
 begin insert into public.finance_invoices(reference,customer_name,customer_email,customer_phone,customer_address,due_on,currency,notes,terms_snapshot,company_snapshot,created_by,idempotency_key) values(app.next_finance_invoice_reference(v_settings.invoice_prefix),btrim(p_customer_name),nullif(btrim(coalesce(p_customer_email,'')),''),nullif(btrim(coalesce(p_customer_phone,'')),''),nullif(btrim(coalesce(p_customer_address,'')),''),p_due_on,v_settings.default_currency,nullif(btrim(coalesce(p_notes,'')),''),v_settings.invoice_terms,jsonb_build_object('legalName',v_settings.company_legal_name,'address',v_settings.company_address,'taxId',v_settings.company_tax_id,'bankDetails',v_settings.bank_details,'paymentInstructions',v_settings.payment_instructions,'footer',v_settings.invoice_footer,'logoAssetId',v_settings.logo_asset_id,'stampAssetId',v_settings.stamp_asset_id,'signatureAssetId',v_settings.signature_asset_id),auth.uid(),v_key) returning id into v_id;exception when unique_violation then select id into v_id from public.finance_invoices where created_by=auth.uid() and idempotency_key=v_key;if v_id is null then raise;end if;return v_id;end;
 insert into public.finance_invoice_items(invoice_id,product_id,product_code_snapshot,name,description,quantity,unit_label,unit_price,discount_amount,tax_rate,position,estimated_unit_cost,estimated_cost_total)
 select v_id,x.product_id,nullif(btrim(x.product_code),''),btrim(x.name),nullif(btrim(x.description),''),x.quantity,coalesce(nullif(btrim(x.unit_label),''),'pax'),x.unit_price,coalesce(x.discount_amount,0),coalesce(x.tax_rate,0),x.position,coalesce(x.estimated_unit_cost,0),round(coalesce(x.estimated_unit_cost,0)*x.quantity,2)
 from jsonb_to_recordset(p_items) x(product_id uuid,product_code text,name text,description text,quantity numeric,unit_label text,unit_price numeric,discount_amount numeric,tax_rate numeric,position integer,estimated_unit_cost numeric);
 perform app.recalculate_finance_invoice(v_id);return v_id;
end$function$
;

CREATE OR REPLACE FUNCTION app.update_finance_invoice_draft(p_invoice_id uuid, p_customer_name text, p_customer_email text, p_customer_phone text, p_customer_address text, p_due_on date, p_notes text, p_departure_on date, p_items jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.finance_invoices%rowtype;it jsonb;v_qty numeric;v_hpp numeric;
begin
 if not app.has_permission('finance_invoices.update_draft') then raise exception 'Tidak memiliki izin mengubah draft invoice.' using errcode='42501';end if;
 if length(btrim(coalesce(p_customer_name,'')))<2 then raise exception 'Nama pelanggan wajib diisi.' using errcode='22023';end if;if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Invoice wajib memiliki item.' using errcode='22023';end if;
 select * into v from public.finance_invoices where id=p_invoice_id for update;if not found then raise exception 'Invoice tidak ditemukan.' using errcode='P0002';end if;if v.status<>'draft' then raise exception 'Hanya draft invoice yang dapat diubah.' using errcode='23514';end if;
 update public.finance_invoices set customer_name=btrim(p_customer_name),customer_email=nullif(btrim(coalesce(p_customer_email,'')),''),customer_phone=nullif(btrim(coalesce(p_customer_phone,'')),''),customer_address=nullif(btrim(coalesce(p_customer_address,'')),''),due_on=p_due_on,notes=nullif(btrim(coalesce(p_notes,'')),''),departure_on=p_departure_on,updated_at=now() where id=p_invoice_id;
 delete from public.finance_invoice_items where invoice_id=p_invoice_id;
 for it in select value from jsonb_array_elements(p_items) loop v_qty:=coalesce((it->>'quantity')::numeric,0);v_hpp:=coalesce((it->>'estimated_unit_cost')::numeric,0);if v_qty<=0 or coalesce((it->>'unit_price')::numeric,0)<0 or v_hpp<0 then raise exception 'Quantity/harga/HPP item tidak valid.' using errcode='22023';end if;insert into public.finance_invoice_items(invoice_id,name,product_code_snapshot,description,quantity,unit_label,unit_price,discount_amount,tax_rate,estimated_unit_cost,estimated_cost_total) values(p_invoice_id,btrim(coalesce(it->>'name','Item')),nullif(btrim(coalesce(it->>'product_code','')),''),nullif(btrim(coalesce(it->>'description','')),''),v_qty,coalesce(nullif(btrim(coalesce(it->>'unit_label','')),''),'unit'),(it->>'unit_price')::numeric,coalesce((it->>'discount_amount')::numeric,0),coalesce((it->>'tax_rate')::numeric,0),v_hpp,round(v_hpp*v_qty,2));end loop;
 perform app.recalculate_finance_invoice(p_invoice_id);insert into public.audit_logs(actor_user_id,actor_type,action,entity_type,entity_id,summary,changes) values(auth.uid(),app.current_actor_type(),'finance.invoice_draft_updated','finance_invoice',p_invoice_id,'Draft invoice diperbarui.','{}'::jsonb);return p_invoice_id;
end$function$
;

revoke all on function app.create_finance_invoice(text,text,text,text,date,text,jsonb,text) from public,anon;
grant execute on function app.create_finance_invoice(text,text,text,text,date,text,jsonb,text) to authenticated;
revoke all on function app.update_finance_invoice_draft(uuid,text,text,text,text,date,text,date,jsonb) from public,anon;
grant execute on function app.update_finance_invoice_draft(uuid,text,text,text,text,date,text,date,jsonb) to authenticated;
