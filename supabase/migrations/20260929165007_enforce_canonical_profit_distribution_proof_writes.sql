drop policy if exists profit_distribution_payment_proofs_insert_admin on public.profit_distribution_payment_proofs;
drop policy if exists profit_distribution_payment_proofs_update_admin on public.profit_distribution_payment_proofs;
revoke insert, update, delete on public.profit_distribution_payment_proofs from authenticated;

drop policy if exists payment_proofs_admin_insert on storage.objects;
create policy payment_proofs_admin_insert on storage.objects for insert to authenticated with check (bucket_id='profit-distribution-proofs' and app.has_permission('profit_distribution_payments.upload_proof'));
drop policy if exists payment_proofs_admin_select on storage.objects;
create policy payment_proofs_admin_select on storage.objects for select to authenticated using (bucket_id='profit-distribution-proofs' and app.has_permission('profit_distribution_payments.view'));
drop policy if exists payment_proofs_admin_update on storage.objects;
create policy payment_proofs_admin_update on storage.objects for update to authenticated using (bucket_id='profit-distribution-proofs' and app.has_permission('profit_distribution_payments.replace_proof')) with check (bucket_id='profit-distribution-proofs' and app.has_permission('profit_distribution_payments.replace_proof'));
drop policy if exists payment_proofs_admin_delete on storage.objects;
create policy payment_proofs_admin_delete on storage.objects for delete to authenticated using (bucket_id='profit-distribution-proofs' and app.has_permission('profit_distribution_payments.replace_proof'));
