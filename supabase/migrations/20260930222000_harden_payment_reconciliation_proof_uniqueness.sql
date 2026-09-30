create unique index if not exists finance_bank_reconciliations_proof_asset_uidx
on public.finance_bank_reconciliations(proof_asset_id)
where proof_asset_id is not null;
