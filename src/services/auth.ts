import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type PortalRole='admin'|'investor';
export interface PortalIdentity{role:PortalRole;name:string;roleLabel:string}

export async function signInPortal(identifier:string,password:string){
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const email=identifier.trim();
 if(!email.includes('@'))throw new Error('Gunakan email terdaftar untuk masuk.');
 const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
 if(!data.user)throw new Error('Akun tidak ditemukan.');
 try{return {user:data.user,...await resolvePortalIdentity(data.user)}}catch(error){await supabase.auth.signOut();throw error}
}
export async function resolvePortalIdentity(user:User):Promise<PortalIdentity>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const account=await supabase.from('user_accounts').select('id,status,full_name').eq('id',user.id).maybeSingle();
 if(account.error)throw account.error;
 if(!account.data||account.data.status!=='active'||!account.data.full_name)throw new Error('Akun tidak terdaftar.');

 const admin=await supabase.from('admins').select('id,is_active,title,role_id').eq('id',user.id).maybeSingle();
 if(admin.error)throw admin.error;
 if(admin.data?.is_active){
  const roleLabel=admin.data.title||'Admin';
  return {role:'admin',name:account.data.full_name,roleLabel};
 }

 const investor=await supabase.from('investors').select('id,status,legal_name').eq('id',user.id).maybeSingle();
 if(investor.error)throw investor.error;
 if(investor.data&&['approved','active'].includes(String(investor.data.status))){
  return {role:'investor',name:investor.data.legal_name||account.data.full_name,roleLabel:'Investor'};
 }
 throw new Error('Akun tidak terdaftar.');
}
export async function resolvePortalRole(user:User):Promise<PortalRole>{return (await resolvePortalIdentity(user)).role}
