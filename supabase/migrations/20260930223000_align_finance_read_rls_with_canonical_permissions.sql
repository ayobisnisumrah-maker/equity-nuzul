drop policy if exists finance_invoices_select on public.finance_invoices;
create policy finance_invoices_select on public.finance_invoices for select to authenticated using (
 app.has_permission('finance_invoices.create') or app.has_permission('finance_invoices.issue') or app.has_permission('finance_invoices.update_draft') or app.has_permission('finance_invoices.void') or app.has_permission('finance_payments.create') or app.has_permission('finance_payments.reconcile') or app.has_permission('finance_payments.fail') or app.has_permission('finance_refunds.request') or app.has_permission('finance_refunds.approve') or app.has_permission('finance_refunds.process') or app.has_permission('financial_reports.view'));
drop policy if exists finance_invoice_items_select on public.finance_invoice_items;
create policy finance_invoice_items_select on public.finance_invoice_items for select to authenticated using (
 app.has_permission('finance_invoices.create') or app.has_permission('finance_invoices.issue') or app.has_permission('finance_invoices.update_draft') or app.has_permission('finance_invoices.void') or app.has_permission('finance_payments.create') or app.has_permission('finance_payments.reconcile') or app.has_permission('finance_payments.fail') or app.has_permission('finance_refunds.request') or app.has_permission('finance_refunds.approve') or app.has_permission('finance_refunds.process') or app.has_permission('financial_reports.view'));
drop policy if exists finance_payments_select on public.finance_payments;
create policy finance_payments_select on public.finance_payments for select to authenticated using (
 app.has_permission('finance_payments.create') or app.has_permission('finance_payments.reconcile') or app.has_permission('finance_payments.fail') or app.has_permission('finance_refunds.request') or app.has_permission('finance_refunds.approve') or app.has_permission('finance_refunds.process') or app.has_permission('financial_reports.view'));
drop policy if exists finance_refunds_select on public.finance_refunds;
create policy finance_refunds_select on public.finance_refunds for select to authenticated using (
 app.has_permission('finance_refunds.request') or app.has_permission('finance_refunds.approve') or app.has_permission('finance_refunds.process') or app.has_permission('financial_reports.view'));
