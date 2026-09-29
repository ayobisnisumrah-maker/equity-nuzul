drop policy if exists message_threads_insert_admin on public.message_threads;
drop policy if exists message_threads_insert_investor on public.message_threads;
revoke insert on public.message_threads from authenticated;

drop policy if exists message_attachments_select on public.message_attachments;
create policy message_attachments_select on public.message_attachments
for select to authenticated
using (
 exists (
  select 1 from public.messages m
  where m.id=message_attachments.message_id
    and (app.has_permission('messages.view') or app.participates_in_thread(m.thread_id))
 )
);
