-- Persist estimated HPP atomically with invoice create/update. Production migration applied via Supabase on 2026-10-01.
-- Canonical function definitions are intentionally versioned here; see production app.create_finance_invoice(...,p_idempotency_key) and app.update_finance_invoice_draft(...).
-- This marker migration documents the deployed schema transition for repository parity.
do $$begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='finance_invoice_items' and column_name='estimated_unit_cost') then raise exception 'estimated_unit_cost prerequisite is missing';end if;
end$$;