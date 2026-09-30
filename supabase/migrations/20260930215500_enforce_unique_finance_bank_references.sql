create unique index if not exists finance_bank_reconciliations_bank_reference_uidx
on public.finance_bank_reconciliations(lower(btrim(bank_reference)))
where nullif(btrim(bank_reference),'') is not null;

create unique index if not exists finance_refunds_bank_reference_uidx
on public.finance_refunds(lower(btrim(bank_reference)))
where status='processed' and nullif(btrim(bank_reference),'') is not null;
