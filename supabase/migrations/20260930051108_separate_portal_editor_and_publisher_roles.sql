delete from public.role_permissions rp using public.roles r,public.permissions p
where rp.role_id=r.id and rp.permission_id=p.id and r.key='admin_portal_communications' and p.key='portal.publish';
