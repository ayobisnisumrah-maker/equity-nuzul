create or replace function app.guard_finance_payment_failure_separation() returns trigger language plpgsql security definer set search_path='' as $$
declare v_super boolean;
begin
 if old.status='pending' and new.status='failed' then
  select exists(select 1 from public.admins a join public.roles r on r.id=a.role_id join public.user_accounts ua on ua.id=a.id where a.id=auth.uid() and a.is_active and ua.status='active' and r.key='super_admin') into v_super;
  if not coalesce(v_super,false) and old.recorded_by is not null and old.recorded_by=auth.uid() then raise exception 'Pencatat pembayaran tidak dapat membatalkan pembayaran yang sama.' using errcode='42501';end if;
  if new.failed_by is distinct from auth.uid() then raise exception 'Aktor pembatalan pembayaran harus sesuai pengguna aktif.' using errcode='42501';end if;
 end if;
 return new;
end $$;
drop trigger if exists finance_payment_failure_separation_guard on public.finance_payments;
create trigger finance_payment_failure_separation_guard before update of status on public.finance_payments for each row execute function app.guard_finance_payment_failure_separation();
