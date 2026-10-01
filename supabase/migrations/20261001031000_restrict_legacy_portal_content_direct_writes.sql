-- Legacy portal_content is read-only through the Data API.
-- Mutations are performed by guarded SECURITY DEFINER RPCs:
-- save_portal_content_draft, publish_portal_content, rollback_portal_content.
revoke insert, update, delete on table public.portal_content from anon, authenticated;
grant select on table public.portal_content to anon, authenticated;
