import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type PortalRole='admin'|'investor';
export interface PortalIdentity{role:PortalRole;name:string;roleLabel:string}

interface SessionRoute {
 authenticated?: boolean;
 account_type?: string;
 role_key?: string;
 investor_status?: string|null;
 route?: string;
 reason?: string;
}

export async function signInPortal(identifier:string,password:string){
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const email=identifier.trim();
 if(!email.includes('@'))throw new Error('Gunakan email terdaftar untuk masuk.');
 const {data,error}=await supabase.auth.signInWithPassword({email,password});
 if(error)throw error;
 if(!data.user)throw new Error('Akun tidak ditemukan.');
 try{return {user:data.user,...await resolvePortalIdentity(data.user)}}catch(error){await supabase.auth.signOut();throw error}
}

export async function resolvePortalIdentity(user:User):Promise<PortalIdentity>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');

 const [{data:routeData,error:routeError},{data:account,error:accountError}]=await Promise.all([
  supabase.rpc('get_current_session_route'),
  supabase.from('user_accounts').select('id,status,full_name').eq('id',user.id).maybeSingle(),
 ]);
 if(routeError)throw routeError;
 if(accountError)throw accountError;
 if(!account||account.status!=='active'||!account.full_name)throw new Error('Akun tidak terdaftar.');

 const route=routeData as SessionRoute|null;
 if(!route?.authenticated)throw new Error('Sesi tidak valid.');

 if(route.route==='/admin'&&route.account_type==='admin'){
  return {role:'admin',name:account.full_name,roleLabel:formatAdminRole(route.role_key)};
 }

 if(route.route==='/investor'&&route.account_type==='investor'&&route.reason==='active_ownership'){
  return {role:'investor',name:account.full_name,roleLabel:'Investor'};
 }

 if(route.reason==='ownership_missing')throw new Error('Akun investor belum memiliki alokasi kepemilikan aktif.');
 if(route.reason==='investor_not_active')throw new Error('Akun investor belum aktif.');
 throw new Error('Akun tidak terdaftar.');
}

function formatAdminRole(roleKey?:string){
 if(roleKey==='super_admin')return 'Super Admin';
 const labels:Record<string,string>={
  admin_document_verification:'Admin Dokumen',
  admin_finance_reporting:'Admin Keuangan & Laporan',
  admin_internal:'Admin Internal',
  admin_investor_relations:'Admin Investor',
  admin_portal_communications:'Admin Portal',
 };
 return roleKey&&labels[roleKey]?labels[roleKey]:'Admin';
}

export async function resolvePortalRole(user:User):Promise<PortalRole>{return (await resolvePortalIdentity(user)).role}

export async function requestPasswordReset(email:string){
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const value=email.trim().toLowerCase();
 if(!value.includes('@'))throw new Error('Masukkan email terdaftar.');
 const redirectTo=new URL('/atur-sandi',window.location.origin).toString();
 const {error}=await supabase.auth.resetPasswordForEmail(value,{redirectTo});
 if(error)throw error;
}
