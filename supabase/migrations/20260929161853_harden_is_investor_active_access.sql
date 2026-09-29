create or replace function app.is_investor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.investors i
    join public.user_accounts ua on ua.id = i.id
    where i.id = (select auth.uid())
      and ua.status = 'active'
      and i.status in ('approved','active')
  );
$function$;
