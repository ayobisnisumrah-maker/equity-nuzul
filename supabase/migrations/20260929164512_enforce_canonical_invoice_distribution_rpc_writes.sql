-- Canonical finance invoice writes must go through app RPCs.
drop policy if exists finance_invoices_insert on public.finance_invoices;
drop policy if exists finance_invoices_update on public.finance_invoices;
drop policy if exists finance_invoices_delete on public.finance_invoices;
drop policy if exists finance_invoice_items_insert on public.finance_invoice_items;
drop policy if exists finance_invoice_items_update on public.finance_invoice_items;
drop policy if exists finance_invoice_items_delete on public.finance_invoice_items;
revoke insert, update, delete on public.finance_invoices from authenticated;
revoke insert, update, delete on public.finance_invoice_items from authenticated;

-- Canonical profit distribution lifecycle must go through app RPCs.
drop policy if exists profit_distributions_insert_admin on public.profit_distributions;
drop policy if exists profit_distributions_update_admin on public.profit_distributions;
drop policy if exists profit_distribution_allocations_insert_admin on public.profit_distribution_allocations;
drop policy if exists profit_distribution_allocations_update_admin on public.profit_distribution_allocations;
drop policy if exists profit_distribution_allocations_delete_admin on public.profit_distribution_allocations;
revoke insert, update, delete on public.profit_distributions from authenticated;
revoke insert, update, delete on public.profit_distribution_allocations from authenticated;
