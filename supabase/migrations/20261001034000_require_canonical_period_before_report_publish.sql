-- Prevent legacy/non-canonical financial periods from reaching the published-report state.
CREATE OR REPLACE FUNCTION app.transition_financial_report(p_report_id uuid, p_target publication_status)
 RETURNS TABLE(report_id uuid, version_id uuid, previous_status publication_status, status publication_status)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_report public.financial_reports%rowtype;
 v_version public.financial_report_versions%rowtype;
 v_period_status public.period_status;
 v_period_end date;
 v_permission text;
 v_now timestamptz:=now();
begin
 select * into v_report from public.financial_reports where id=p_report_id for update;
 if v_report.id is null then raise exception 'Financial report not found.' using errcode='P0002'; end if;
 if v_report.current_version_id is null then raise exception 'Financial report has no current version.' using errcode='23514'; end if;
 select * into v_version from public.financial_report_versions where id=v_report.current_version_id and financial_report_id=v_report.id for update;
 if v_version.id is null then raise exception 'Current financial report version not found.' using errcode='P0002'; end if;

 if v_report.status='draft' and p_target='review' then
  v_permission:='financial_reports.review';
  if v_version.document_asset_id is null
     or not exists(select 1 from public.financial_line_items where financial_report_version_id=v_version.id)
     or not exists(select 1 from public.financial_kpis where financial_report_version_id=v_version.id)
  then raise exception 'Add an attachment, financial line items, and KPIs before review.' using errcode='23514'; end if;
 elsif v_report.status='review' and p_target='approved' then
  v_permission:='financial_reports.approve';
 elsif v_report.status='approved' and p_target='published' then
  v_permission:='financial_reports.publish';
  perform app.assert_canonical_financial_period(v_report.financial_period_id);
  if not app.is_active_super_admin() and v_version.approved_by=auth.uid() then
   raise exception 'Approver laporan tidak dapat memublikasikan laporan yang sama.' using errcode='42501';
  end if;
  select fp.status,fp.ends_on into v_period_status,v_period_end
  from public.financial_periods fp where fp.id=v_report.financial_period_id for share;
  if v_period_status is null then raise exception 'Financial period not found.' using errcode='P0002'; end if;
  if v_period_status not in ('closed','locked') then raise exception 'Financial period must be closed or locked before publishing the report.' using errcode='23514'; end if;
  if v_period_end>current_date then raise exception 'Financial report cannot be published before the period end date (%).',v_period_end using errcode='23514'; end if;
 else
  raise exception 'Invalid financial report transition: % -> %',v_report.status,p_target using errcode='42501';
 end if;

 if not app.has_permission(v_permission) then raise exception 'Missing permission: %',v_permission using errcode='42501'; end if;

 perform set_config('app.financial_report_transition','allowed',true);
 if p_target='review' then
  update public.financial_report_versions set status='review' where id=v_version.id;
  update public.financial_reports set status='review' where id=v_report.id;
 elsif p_target='approved' then
  update public.financial_report_versions set status='approved',approved_by=auth.uid(),approved_at=v_now where id=v_version.id;
  update public.financial_reports set status='approved' where id=v_report.id;
 elsif p_target='published' then
  update public.financial_report_versions set status='published',published_by=auth.uid(),published_at=v_now where id=v_version.id;
  update public.financial_reports set status='published',published_version_id=v_version.id where id=v_report.id;
 end if;
 perform set_config('app.financial_report_transition','',true);

 return query select v_report.id,v_version.id,v_report.status,p_target;
end
$function$

