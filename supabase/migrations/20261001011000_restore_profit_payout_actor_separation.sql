create or replace function app.guard_profit_payout_actor_separation(p_uploaded_by uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not app.is_active_super_admin() and p_uploaded_by=auth.uid() then
  raise exception 'Uploader bukti pembayaran tidak dapat menandai payout yang sama sebagai paid.' using errcode='42501';
 end if;
end $$;
revoke all on function app.guard_profit_payout_actor_separation(uuid) from public,anon;
grant execute on function app.guard_profit_payout_actor_separation(uuid) to authenticated,service_role;
