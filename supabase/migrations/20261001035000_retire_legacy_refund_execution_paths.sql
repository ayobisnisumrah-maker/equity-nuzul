-- Retire legacy refund execution paths that bypass approval/proof workflow.
create or replace function app.process_finance_refund(p_invoice_id uuid,p_payment_id uuid,p_amount numeric,p_reason text,p_notes text)
returns uuid language plpgsql security definer set search_path='' as $$
begin raise exception 'Legacy direct refund RPC is retired. Use request_finance_refund -> approve_finance_refund -> process_approved_finance_refund with proof.' using errcode='42501';end $$;
revoke all on function app.process_finance_refund(uuid,uuid,numeric,text,text) from public,anon,authenticated,service_role;
create or replace function app.process_finance_refund(p_invoice_id uuid,p_payment_id uuid,p_amount numeric,p_reason text,p_notes text,p_idempotency_key text)
returns uuid language plpgsql security definer set search_path='' as $$
begin raise exception 'Legacy direct refund RPC is retired. Use request_finance_refund -> approve_finance_refund -> process_approved_finance_refund with proof.' using errcode='42501';end $$;
revoke all on function app.process_finance_refund(uuid,uuid,numeric,text,text,text) from public,anon,authenticated,service_role;
create or replace function app.process_approved_finance_refund(p_refund_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
begin raise exception 'Refund proof and bank reference are required. Use process_approved_finance_refund(uuid,uuid,text).' using errcode='42501';end $$;
revoke all on function app.process_approved_finance_refund(uuid) from public,anon,authenticated,service_role;
