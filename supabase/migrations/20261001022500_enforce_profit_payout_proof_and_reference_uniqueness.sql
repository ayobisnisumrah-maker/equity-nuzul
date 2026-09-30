-- Prevent payout evidence and external payment references from being reused
-- across investor allocations.

create unique index if not exists profit_distribution_payment_proofs_storage_path_uidx
on public.profit_distribution_payment_proofs (storage_path);

create unique index if not exists profit_distribution_allocations_payment_reference_uidx
on public.profit_distribution_allocations (lower(btrim(payment_reference)))
where nullif(btrim(coalesce(payment_reference,'')),'') is not null;
