-- Consolidate equivalent permissive SELECT policies without changing authorization semantics.
drop policy if exists investors_select_admin on public.investors;
drop policy if exists investors_select_self on public.investors;
create policy investors_select_authenticated on public.investors for select to authenticated using (app.has_permission('investors.view') or id = app.current_user_id());

drop policy if exists ownership_holdings_select_admin on public.ownership_holdings;
drop policy if exists ownership_holdings_select_self on public.ownership_holdings;
create policy ownership_holdings_select_authenticated on public.ownership_holdings for select to authenticated using (app.has_permission('ownership.view') or app.has_permission('profit_distributions.view') or investor_id = private.current_historical_investor_id());

drop policy if exists ownership_offerings_select_admin on public.ownership_offerings;
drop policy if exists ownership_offerings_select_owned_by_investor on public.ownership_offerings;
create policy ownership_offerings_select_authenticated on public.ownership_offerings for select to authenticated using (app.has_permission('ownership_offerings.view') or exists (select 1 from public.ownership_holdings h where h.offering_id=ownership_offerings.id and h.investor_id=app.current_investor_id()));

drop policy if exists ownership_inheritance_admin_read on public.ownership_inheritance;
drop policy if exists ownership_inheritance_investor_read on public.ownership_inheritance;
drop policy if exists ownership_inheritance_client_deny on public.ownership_inheritance;
create policy ownership_inheritance_select_authenticated on public.ownership_inheritance for select to authenticated using (current_investor_id = app.current_user_id() or app.has_permission('ownership_inheritance.view'));

drop policy if exists profit_distributions_select_admin on public.profit_distributions;
drop policy if exists profit_distributions_select_self on public.profit_distributions;
create policy profit_distributions_select_authenticated on public.profit_distributions for select to authenticated using (app.has_permission('profit_distributions.view') or private.investor_can_read_canonical_distribution(id,app.current_investor_id(),null::uuid));

drop policy if exists profit_distribution_allocations_select_admin on public.profit_distribution_allocations;
drop policy if exists profit_distribution_allocations_select_self on public.profit_distribution_allocations;
create policy profit_distribution_allocations_select_authenticated on public.profit_distribution_allocations for select to authenticated using (app.has_permission('profit_distributions.view') or app.has_permission('profit_distribution_payments.view') or (investor_id=app.current_investor_id() and status=any(array['payable'::text,'paid'::text]) and private.investor_can_read_canonical_distribution(distribution_id,investor_id,id)));

drop policy if exists profit_distribution_payment_proofs_select_admin on public.profit_distribution_payment_proofs;
drop policy if exists profit_distribution_payment_proofs_select_self on public.profit_distribution_payment_proofs;
create policy profit_distribution_payment_proofs_select_authenticated on public.profit_distribution_payment_proofs for select to authenticated using (app.has_permission('profit_distribution_payments.view') or (investor_id=app.current_investor_id() and private.investor_can_read_canonical_distribution(null::uuid,investor_id,allocation_id)));
