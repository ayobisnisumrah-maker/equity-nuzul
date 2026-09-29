create or replace function app.list_my_ownership_inheritance()
returns setof public.ownership_inheritance
language sql
stable
security definer
set search_path = ''
as $function$
  select oi.*
  from public.ownership_inheritance oi
  where oi.current_investor_id = app.current_investor_id()
  order by oi.requested_at desc;
$function$;
