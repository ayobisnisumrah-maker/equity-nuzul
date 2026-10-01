-- Final finance transactions and their proof files are permanent audit records.
create or replace function app.guard_final_finance_payment_delete()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='confirmed' then raise exception 'Confirmed finance payments are immutable and cannot be deleted.' using errcode='42501';end if;
 return old;
end $$;
create or replace function app.guard_final_finance_refund_delete()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='processed' then raise exception 'Processed finance refunds are immutable and cannot be deleted.' using errcode='42501';end if;
 return old;
end $$;
create or replace function app.guard_final_finance_proof_media_asset()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.finance_payments p where p.proof_asset_id=old.id and p.status='confirmed')
 or exists(select 1 from public.finance_refunds r where r.proof_asset_id=old.id and r.status='processed') then raise exception 'Media asset used by a final finance transaction is immutable.' using errcode='42501';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
create or replace function app.guard_final_finance_proof_storage_object()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.bucket_id='company-documents' and exists(select 1 from public.media_assets a where a.bucket=old.bucket_id and a.path=old.name and (exists(select 1 from public.finance_payments p where p.proof_asset_id=a.id and p.status='confirmed') or exists(select 1 from public.finance_refunds r where r.proof_asset_id=a.id and r.status='processed'))) then raise exception 'Storage object used by a final finance transaction is immutable.' using errcode='42501';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists final_finance_payment_delete_guard on public.finance_payments;
create trigger final_finance_payment_delete_guard before delete on public.finance_payments for each row execute function app.guard_final_finance_payment_delete();
drop trigger if exists final_finance_refund_delete_guard on public.finance_refunds;
create trigger final_finance_refund_delete_guard before delete on public.finance_refunds for each row execute function app.guard_final_finance_refund_delete();
drop trigger if exists final_finance_proof_media_asset_guard on public.media_assets;
create trigger final_finance_proof_media_asset_guard before update or delete on public.media_assets for each row execute function app.guard_final_finance_proof_media_asset();
drop trigger if exists final_finance_proof_storage_object_guard on storage.objects;
create trigger final_finance_proof_storage_object_guard before update or delete on storage.objects for each row when(old.bucket_id='company-documents') execute function app.guard_final_finance_proof_storage_object();
alter table public.finance_payments drop constraint if exists finance_payments_proof_asset_id_fkey;
alter table public.finance_payments add constraint finance_payments_proof_asset_id_fkey foreign key(proof_asset_id) references public.media_assets(id) on delete restrict;
revoke all on function app.guard_final_finance_payment_delete() from public,anon,authenticated,service_role;
revoke all on function app.guard_final_finance_refund_delete() from public,anon,authenticated,service_role;
revoke all on function app.guard_final_finance_proof_media_asset() from public,anon,authenticated,service_role;
revoke all on function app.guard_final_finance_proof_storage_object() from public,anon,authenticated,service_role;
