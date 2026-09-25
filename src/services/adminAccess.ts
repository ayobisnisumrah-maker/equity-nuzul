import {supabase} from '../lib/supabase';
export type AdminModule='ringkasan'|'portal'|'investor'|'kasir'|'keuangan'|'laporan'|'dokumen'|'admin'|'pengaturan';
export interface AdminAccess{role:string;permissions:AdminModule[]}
const ALL:AdminModule[]=['ringkasan','portal','investor','kasir','keuangan','laporan','dokumen','admin','pengaturan'];
export async function getAdminAccess(userId:string):Promise<AdminAccess>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const {data,error}=await supabase.from('portal_admins').select('role,permissions').eq('user_id',userId).single();if(error)throw error;
 const role=String(data.role||'Admin');const permissions=role.toLowerCase()==='super admin'?ALL:((data.permissions||['ringkasan']) as AdminModule[]);
 return {role,permissions};
}
