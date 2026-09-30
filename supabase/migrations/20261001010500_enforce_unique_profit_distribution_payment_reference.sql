create unique index if not exists profit_distribution_payment_proofs_payment_reference_uidx
on public.profit_distribution_payment_proofs(lower(btrim(payment_reference)))
where nullif(btrim(coalesce(payment_reference,'')),'') is not null;
