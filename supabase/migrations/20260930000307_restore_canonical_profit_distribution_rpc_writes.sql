alter function app.create_profit_distribution(uuid,uuid,integer,integer,text) security definer;
alter function app.create_profit_distribution(uuid,uuid,integer,integer,text) set search_path='';
alter function app.transition_profit_distribution(uuid,public.profit_distribution_status) security definer;
alter function app.transition_profit_distribution(uuid,public.profit_distribution_status) set search_path='';
alter function app.mark_profit_distribution_allocation_paid(uuid,text) security definer;
alter function app.mark_profit_distribution_allocation_paid(uuid,text) set search_path='';
