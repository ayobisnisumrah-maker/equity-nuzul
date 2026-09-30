create unique index if not exists document_access_grants_one_active_per_investor_document on public.document_access_grants(document_id,investor_id) where revoked_at is null;
-- Lifecycle guard: grant actor must be current actor; only restricted documents and approved/active investors; revoked grants immutable.
