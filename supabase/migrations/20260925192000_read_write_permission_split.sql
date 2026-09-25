drop policy if exists "cash permission manages cash" on public.cash_transactions;
create policy "cash and summary read cash" on public.cash_transactions for select to authenticated
using(public.has_admin_permission('kasir') or public.has_admin_permission('ringkasan') or public.has_admin_permission('laporan'));
create policy "cash permission writes cash" on public.cash_transactions for insert to authenticated
with check(public.has_admin_permission('kasir'));
create policy "cash permission updates cash" on public.cash_transactions for update to authenticated
using(public.has_admin_permission('kasir')) with check(public.has_admin_permission('kasir'));
create policy "cash permission deletes cash" on public.cash_transactions for delete to authenticated
using(public.has_admin_permission('kasir'));

drop policy if exists "finance permission manages finance" on public.finance_entries;
create policy "finance and reporting read finance" on public.finance_entries for select to authenticated
using(public.has_admin_permission('keuangan') or public.has_admin_permission('laporan') or public.has_admin_permission('ringkasan'));
create policy "finance permission writes finance" on public.finance_entries for insert to authenticated
with check(public.has_admin_permission('keuangan') or public.has_admin_permission('kasir'));
create policy "finance permission updates finance" on public.finance_entries for update to authenticated
using(public.has_admin_permission('keuangan')) with check(public.has_admin_permission('keuangan'));
create policy "finance permission deletes finance" on public.finance_entries for delete to authenticated
using(public.has_admin_permission('keuangan'));

create policy "summary reads investors" on public.investor_profiles for select to authenticated
using(public.has_admin_permission('ringkasan') or public.has_admin_permission('investor'));
create policy "summary reads documents" on public.portal_documents for select to authenticated
using(public.has_admin_permission('ringkasan') or public.has_admin_permission('dokumen'));

create policy "investor permission manages profiles" on public.investor_profiles for update to authenticated
using(public.has_admin_permission('investor')) with check(public.has_admin_permission('investor'));
