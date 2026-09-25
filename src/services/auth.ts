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
 const identity=await resolvePortalIdentity(data.user);return {user:data.user,...identity};
}
export async function resolvePortalIdentity(user:User):Promise<PortalIdentity>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const admin=await supabase.from('portal_admins').select('user_id,full_name,role').eq('user_id',user.id).maybeSingle();
 if(admin.error)throw admin.error;
 if(admin.data){if(!admin.data.full_name){await supabase.auth.signOut();throw new Error('Akun tidak terdaftar.');}return {role:'admin',name:admin.data.full_name,roleLabel:admin.data.role||'Admin'};}
 const investor=await supabase.from('investor_profiles').select('user_id,status,full_name').eq('user_id',user.id).eq('status','approved').maybeSingle();
 if(investor.error)throw investor.error;
 if(investor.data){if(!investor.data.full_name){await supabase.auth.signOut();throw new Error('Akun tidak terdaftar.');}return {role:'investor',name:investor.data.full_name,roleLabel:'Investor'};}
 await supabase.auth.signOut();throw new Error('Akun tidak terdaftar.');
}
export async function resolvePortalRole(user:User):Promise<PortalRole>{return (await resolvePortalIdentity(user)).role}
