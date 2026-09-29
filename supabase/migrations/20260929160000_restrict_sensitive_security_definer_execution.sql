-- Restrict sensitive SECURITY DEFINER functions to their intended callers.
-- PostgreSQL grants EXECUTE to PUBLIC by default, so PUBLIC must be revoked explicitly.
revoke execute on function app.convert_portal_inquiry_to_investor(uuid,uuid) from public;
revoke execute on function app.set_portal_inquiry_status(uuid,public.inquiry_status) from public;
revoke execute on function app.transition_portal_section(uuid,public.publication_status) from public;
revoke execute on function app.update_portal_section_content(text,jsonb,text) from public;
grant execute on function app.convert_portal_inquiry_to_investor(uuid,uuid) to authenticated;
grant execute on function app.set_portal_inquiry_status(uuid,public.inquiry_status) to authenticated;
grant execute on function app.transition_portal_section(uuid,public.publication_status) to authenticated;
grant execute on function app.update_portal_section_content(text,jsonb,text) to authenticated;

revoke execute on function app.enforce_public_document_pdf() from public;
revoke execute on function app.guard_investor_status_permission() from public;
revoke execute on function app.guard_public_document_visibility() from public;
revoke execute on function app.sync_investor_account_access() from public;
