insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portal-documents','portal-documents',true,20971520,array['application/pdf'])
on conflict(id) do update set public=true,file_size_limit=20971520,allowed_mime_types=array['application/pdf'];

create policy "admins upload portal documents" on storage.objects for insert to authenticated
with check(bucket_id='portal-documents' and public.is_portal_admin());

create policy "admins update portal documents" on storage.objects for update to authenticated
using(bucket_id='portal-documents' and public.is_portal_admin())
with check(bucket_id='portal-documents' and public.is_portal_admin());

create policy "admins delete portal documents" on storage.objects for delete to authenticated
using(bucket_id='portal-documents' and public.is_portal_admin());

create policy "public reads portal documents" on storage.objects for select to public
using(bucket_id='portal-documents');
