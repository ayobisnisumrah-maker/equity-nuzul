-- investors.id is already protected by investors_pkey; this identical unique index only adds write/storage overhead.
drop index if exists public.investors_account_id_unique;
