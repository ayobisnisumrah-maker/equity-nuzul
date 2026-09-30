-- Let an authenticated browser observe its own account-status row through
-- existing RLS, so disabling an account causes immediate portal revalidation.
alter publication supabase_realtime add table public.user_accounts;
