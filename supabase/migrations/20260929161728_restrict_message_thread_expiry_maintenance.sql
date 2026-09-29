revoke all on function app.expire_message_threads() from public;
revoke all on function app.expire_message_threads() from anon;
revoke all on function app.expire_message_threads() from authenticated;
grant execute on function app.expire_message_threads() to service_role;
