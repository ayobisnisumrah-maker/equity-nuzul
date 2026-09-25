import {supabase} from '../lib/supabase';
export type AdminModule='ringkasan'|'portal'|'investor'|'kasir'|'keuangan'|'laporan'|'dokumen'|'admin'|'pengaturan';
export interface AdminAccess{role:string;permissions:AdminModule[]}
const permissionMap:Record<Exclude<AdminModule,'ringkasan'>,string[]>={
 portal:['portal.view'],
 investor:['investors.view'],
 kasir:['financial_reports.create','financial_reports.update'],
 keuangan:['financial_periods.view','financial_reports.view','profit_distributions.view'],
 laporan:['financial_reports.view','audit_logs.view'],
 dokumen:['documents.view'],
 admin:['admins.view','roles.view'],
 pengaturan:['settings.view']
};
export async function getAdminAccess(_userId?:string):Promise<AdminAccess>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const {data,error}=await supabase.rpc('current_admin_access');if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('Akses admin tidak tersedia.');
 const keys=new Set<string>((row.permission_keys??[]) as string[]);
 const permissions:AdminModule[]=['ringkasan'];
 for(const [module,required] of Object.entries(permissionMap) as [Exclude<AdminModule,'ringkasan'>,string[]][])if(required.some(key=>keys.has(key)))permissions.push(module);
 return {role:String(row.role_label||'Admin'),permissions};
}
