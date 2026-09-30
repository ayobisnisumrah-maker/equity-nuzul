-- Trigger guard functions are invoked by PostgreSQL triggers, not by application clients.
-- Remove direct Data API execution from browser roles.
revoke all on function app.guard_document_update() from public, anon, authenticated;
revoke all on function app.guard_document_version_update() from public, anon, authenticated;
