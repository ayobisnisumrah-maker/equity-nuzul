create policy storage_orphan_reviews_no_client_access on public.storage_orphan_reviews for all to authenticated using(false) with check(false);
