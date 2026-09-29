-- Consolidate overlapping messaging read policies while preserving admin/participant access.
drop policy if exists message_reads_insert_admin_own on public.message_reads;
drop policy if exists message_reads_select_admin_own on public.message_reads;

drop policy if exists message_threads_select_admin on public.message_threads;
drop policy if exists message_threads_select_participant on public.message_threads;
create policy message_threads_select_authenticated on public.message_threads for select to authenticated
using (app.has_permission('messages.view') or app.participates_in_thread(id));

drop policy if exists messages_select_admin on public.messages;
drop policy if exists messages_select_participant on public.messages;
create policy messages_select_authenticated on public.messages for select to authenticated
using (app.has_permission('messages.view') or app.participates_in_thread(thread_id));

drop policy if exists thread_participants_select_admin on public.thread_participants;
drop policy if exists thread_participants_select_own on public.thread_participants;
create policy thread_participants_select_authenticated on public.thread_participants for select to authenticated
using (app.has_permission('messages.view') or (user_id=app.current_user_id() and private.current_historical_investor_id() is not null));
