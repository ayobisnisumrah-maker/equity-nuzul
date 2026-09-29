alter function app.transition_financial_report(uuid, public.publication_status) security definer;
alter function app.transition_financial_report(uuid, public.publication_status) set search_path = '';

drop policy if exists financial_reports_update_admin on public.financial_reports;
create policy financial_reports_update_admin
on public.financial_reports for update to authenticated
using (app.has_permission('financial_reports.update'))
with check (app.has_permission('financial_reports.update'));

drop policy if exists financial_report_versions_update_admin on public.financial_report_versions;
create policy financial_report_versions_update_admin
on public.financial_report_versions for update to authenticated
using (app.has_permission('financial_reports.update'))
with check (app.has_permission('financial_reports.update'));
