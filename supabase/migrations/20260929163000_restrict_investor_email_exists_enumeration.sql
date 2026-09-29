-- Prevent client-side investor email enumeration.
-- This helper has no caller in the web client and is retained for trusted backend use only.
revoke execute on function app.investor_email_exists(text) from public, anon, authenticated;
grant execute on function app.investor_email_exists(text) to service_role;
