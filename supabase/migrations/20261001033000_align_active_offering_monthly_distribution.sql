-- Align the active Nuzultrip Equity offering with the approved monthly distribution cadence.
-- Safe because this offering had no ownership holdings when corrected.
update public.ownership_offerings
set distribution_cadence_months = 1,
    updated_at = now()
where id = '3ce9cd3a-981a-4e9c-bc58-abae01af4454'
  and code = 'nuzul12124'
  and status = 'open'
  and distribution_cadence_months = 6
  and not exists (
    select 1 from public.ownership_holdings h
    where h.offering_id = ownership_offerings.id
  );
