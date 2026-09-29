-- Harden investor ownership write paths to the canonical active investor identity.
-- Functions retain existing holding ownership checks, row locks, status validation,
-- and reservation accounting; only identity authorization is tightened.

create or replace function app.cancel_ownership_inheritance_request(p_request_id uuid)
returns void language plpgsql security definer set search_path=''
as $function$
declare v_investor_id uuid := app.current_investor_id(); v_request public.ownership_inheritance;
begin
 if v_investor_id is null then raise exception 'Anda harus masuk sebagai investor aktif.' using errcode='42501'; end if;
 select oi.* into v_request from public.ownership_inheritance oi where oi.id=p_request_id for update;
 if not found then raise exception 'Pengajuan pewarisan tidak ditemukan.' using errcode='P0002'; end if;
 if v_request.current_investor_id <> v_investor_id then raise exception 'Anda tidak berhak membatalkan pengajuan ini.' using errcode='42501'; end if;
 if v_request.status <> 'pending' then raise exception 'Hanya pengajuan yang masih menunggu persetujuan yang dapat dibatalkan.' using errcode='22023'; end if;
 update public.ownership_inheritance set status='cancelled',updated_at=now() where id=p_request_id;
end;$function$;

create or replace function app.create_ownership_inheritance_request(p_holding_id uuid,p_beneficiary_name text,p_beneficiary_email text default null,p_beneficiary_phone text default null,p_units integer default null,p_notes text default null)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_investor_id uuid:=app.current_investor_id(); v_holding public.ownership_holdings; v_units integer; v_reserved_inheritance integer; v_reserved_transfer integer; v_request_id uuid;
begin
 if v_investor_id is null then raise exception 'Investor tidak memiliki akses.' using errcode='42501'; end if;
 if length(btrim(coalesce(p_beneficiary_name,'')))<2 then raise exception 'Nama pewaris wajib diisi minimal 2 karakter.' using errcode='22023'; end if;
 select h.* into v_holding from public.ownership_holdings h where h.id=p_holding_id for update;
 if not found then raise exception 'Kepemilikan tidak ditemukan.' using errcode='P0002'; end if;
 if v_holding.investor_id<>v_investor_id then raise exception 'Kepemilikan tersebut bukan milik Anda.' using errcode='42501'; end if;
 if v_holding.status<>'active' then raise exception 'Hanya kepemilikan aktif yang dapat diajukan untuk pewarisan.' using errcode='22023'; end if;
 v_units:=coalesce(p_units,v_holding.units); if v_units<=0 then raise exception 'Jumlah unit pewarisan harus lebih besar dari 0.' using errcode='22023'; end if;
 select coalesce(sum(oi.units),0)::integer into v_reserved_inheritance from public.ownership_inheritance oi where oi.holding_id=p_holding_id and oi.status in ('pending','approved');
 select coalesce(sum(t.units),0)::integer into v_reserved_transfer from public.ownership_transfers t where t.holding_id=p_holding_id and t.status in ('pending','approved','processing');
 if v_units>(v_holding.units-v_reserved_inheritance-v_reserved_transfer) then raise exception 'Jumlah unit pewarisan melebihi unit yang tersedia karena ada proses transfer, penjualan, atau pewarisan aktif.' using errcode='22023'; end if;
 insert into public.ownership_inheritance(holding_id,current_investor_id,beneficiary_name,beneficiary_email,beneficiary_phone,units,status,notes)
 values(p_holding_id,v_investor_id,btrim(p_beneficiary_name),nullif(btrim(coalesce(p_beneficiary_email,'')),''),nullif(btrim(coalesce(p_beneficiary_phone,'')),''),v_units,'pending',nullif(btrim(coalesce(p_notes,'')),'')) returning id into v_request_id;
 return v_request_id;
end;$function$;

create or replace function app.create_ownership_sale_request(p_holding_id uuid,p_units integer,p_requested_unit_price numeric,p_notes text default null)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_investor_id uuid:=app.current_investor_id(); v_holding public.ownership_holdings; v_reserved_sale_units integer; v_reserved_inheritance_units integer; v_available_units integer; v_transfer_id uuid;
begin
 if v_investor_id is null then raise exception 'Investor tidak memiliki akses untuk mengajukan penjualan saham.' using errcode='42501'; end if;
 if p_units is null or p_units<=0 then raise exception 'Jumlah unit yang dijual harus lebih besar dari 0.' using errcode='22023'; end if;
 if p_requested_unit_price is null or p_requested_unit_price<=0 then raise exception 'Harga penawaran per unit harus lebih besar dari 0.' using errcode='22023'; end if;
 select h.* into v_holding from public.ownership_holdings h where h.id=p_holding_id for update;
 if not found then raise exception 'Kepemilikan tidak ditemukan.' using errcode='P0002'; end if;
 if v_holding.investor_id<>v_investor_id then raise exception 'Anda tidak berhak menjual kepemilikan ini.' using errcode='42501'; end if;
 if v_holding.status<>'active' then raise exception 'Hanya kepemilikan aktif yang dapat dijual.' using errcode='22023'; end if;
 if v_holding.transfer_eligible_at>now() then raise exception 'Kepemilikan ini belum memenuhi tanggal minimum transfer.' using errcode='22023'; end if;
 select coalesce(sum(t.units),0)::integer into v_reserved_sale_units from public.ownership_transfers t where t.holding_id=p_holding_id and t.transfer_kind='sale' and t.status in ('pending','approved','processing');
 select coalesce(sum(oi.units),0)::integer into v_reserved_inheritance_units from public.ownership_inheritance oi where oi.holding_id=p_holding_id and oi.status in ('pending','approved');
 v_available_units:=v_holding.units-v_reserved_sale_units-v_reserved_inheritance_units;
 if v_available_units<=0 then raise exception 'Seluruh unit pada kepemilikan ini sedang berada dalam proses penjualan, transfer, atau pewarisan.' using errcode='22023'; end if;
 if p_units>v_available_units then raise exception 'Jumlah unit melebihi unit yang tersedia. Tersedia: % unit.',v_available_units using errcode='22023'; end if;
 insert into public.ownership_transfers(holding_id,from_investor_id,to_investor_id,units,requested_at,eligible_at,status,notes,transfer_kind,requested_unit_price)
 values(v_holding.id,v_investor_id,null,p_units,now(),v_holding.transfer_eligible_at,'pending',nullif(btrim(coalesce(p_notes,'')),''),'sale',p_requested_unit_price) returning id into v_transfer_id;
 return v_transfer_id;
end;$function$;
