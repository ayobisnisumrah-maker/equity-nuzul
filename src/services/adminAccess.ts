import {supabase} from '../lib/supabase';
export type AdminModule='ringkasan'|'portal'|'investor'|'kasir'|'keuangan'|'laporan'|'dokumen'|'admin'|'pengaturan';
export interface AdminAccess{role:string;permissions:AdminModule[];permissionKeys:string[]}
const permissionMap:Record<Exclude<AdminModule,'ringkasan'>,string[]>={
 portal:['portal.view'],
 investor:['investors.view'],
 kasir:['finance_invoices.create','finance_invoices.issue','finance_invoices.update_draft','finance_invoices.void','finance_payments.create','finance_payments.reconcile','finance_payments.fail','finance_refunds.request','finance_refunds.approve','finance_refunds.process'],
 keuangan:['finance_expenses.record','finance_expenses.void','financial_periods.view','financial_reports.view','profit_distributions.view','profit_distribution_payments.view'],
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
 return {role:String(row.role_label||'Admin'),permissions,permissionKeys:Array.from(keys)};
}
