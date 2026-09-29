-- Prevent authenticated users from probing reply eligibility for threads they do not participate in.
create or replace function app.thread_accepts_investor_reply(p_thread_id uuid)
returns boolean language sql stable security definer set search_path to '' as $$
  select exists (
    select 1
    from public.message_threads t
    where t.id = p_thread_id
      and app.current_investor_id() is not null
      and app.participates_in_thread(t.id)
      and not t.is_closed
      and not t.awaiting_admin_reply
      and (t.expires_at is null or t.expires_at > now())
      and (t.reply_deadline_at is null or t.reply_deadline_at > now())
  );
$$;
revoke execute on function app.thread_accepts_investor_reply(uuid) from public, anon;
grant execute on function app.thread_accepts_investor_reply(uuid) to authenticated;
