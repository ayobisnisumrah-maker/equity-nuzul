drop policy if exists ownership_holdings_insert_admin on public.ownership_holdings;
drop policy if exists ownership_holdings_update_admin on public.ownership_holdings;
revoke insert, update, delete on public.ownership_holdings from authenticated;

drop policy if exists ownership_inheritance_select_authenticated on public.ownership_inheritance;
create policy ownership_inheritance_select_authenticated on public.ownership_inheritance
for select to authenticated
using (current_investor_id=app.current_investor_id() or app.has_permission('ownership_inheritance.view'));
