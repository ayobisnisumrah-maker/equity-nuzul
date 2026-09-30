revoke all on function app.document_workflow_permission_allowed(public.publication_status) from public,anon,authenticated;
grant execute on function app.document_workflow_permission_allowed(public.publication_status) to service_role;
revoke all on function app.process_finance_refund(uuid,uuid,numeric,text,text) from public,anon,authenticated;
grant execute on function app.process_finance_refund(uuid,uuid,numeric,text,text) to service_role;
