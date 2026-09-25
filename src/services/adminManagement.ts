import {supabase} from '../lib/supabase';import type {AdminModule} from './adminAccess';
export interface AdminRow{user_id:string;full_name:string;role:string;permissions:AdminModule[];created_at:string}
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function listAdmins(){const {data,error}=await db().from('portal_admins').select('user_id,full_name,role,permissions,created_at').order('created_at');if(error)throw error;return (data||[]) as AdminRow[]}
export async function updateAdminAccess(user_id:string,input:{full_name:string;role:string;permissions:AdminModule[]}){const {error}=await db().from('portal_admins').update(input).eq('user_id',user_id);if(error)throw error}
export async function registerExistingAdmin(input:{user_id:string;full_name:string;role:string;permissions:AdminModule[]}){const {error}=await db().from('portal_admins').insert(input);if(error)throw error}
export async function removeAdmin(user_id:string){const {error}=await db().from('portal_admins').delete().eq('user_id',user_id);if(error)throw error}
