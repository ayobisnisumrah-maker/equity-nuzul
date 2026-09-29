drop policy if exists investors_select_authenticated on public.investors;
create policy investors_select_authenticated
on public.investors
for select
to authenticated
using (
  app.has_permission('investors.view')
  or id = app.current_investor_id()
);
