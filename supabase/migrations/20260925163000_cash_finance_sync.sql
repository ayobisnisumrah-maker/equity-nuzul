alter table public.cash_transactions add column if not exists investor_user_id uuid references public.investor_profiles(user_id);
alter table public.cash_transactions add column if not exists category text not null default 'Penerimaan Investor';
alter table public.finance_entries add column if not exists cash_transaction_id uuid unique references public.cash_transactions(id);
create index if not exists idx_cash_investor on public.cash_transactions(investor_user_id);
create index if not exists idx_finance_cash on public.finance_entries(cash_transaction_id);

create or replace function public.post_cash_transaction(
 p_transaction_date date,p_reference_no text,p_description text,p_amount numeric,p_payment_method text,p_investor_user_id uuid default null,p_category text default 'Penerimaan Investor'
) returns uuid language plpgsql security invoker set search_path=public as $$
declare v_cash uuid;
begin
 if not public.is_portal_admin() then raise exception 'Akses ditolak'; end if;
 insert into public.cash_transactions(transaction_date,reference_no,description,amount,payment_method,status,investor_user_id,category,created_by)
 values(p_transaction_date,p_reference_no,p_description,p_amount,p_payment_method,'posted',p_investor_user_id,p_category,auth.uid()) returning id into v_cash;
 insert into public.finance_entries(entry_date,type,category,description,amount,reference_no,cash_transaction_id,created_by)
 values(p_transaction_date,'income',p_category,p_description,p_amount,p_reference_no,v_cash,auth.uid());
 return v_cash;
end $$;
grant execute on function public.post_cash_transaction(date,text,text,numeric,text,uuid,text) to authenticated;
