import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type PortalRole='admin'|'investor';
export async function signInPortal(identifier:string,password:string){
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const email=identifier.trim();
 if(!email.includes('@'))throw new Error('Gunakan email terdaftar untuk masuk.');
 const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
 if(!data.user)throw new Error('Akun tidak ditemukan.');
 const role=await resolvePortalRole(data.user);return {user:data.user,role};
}
export async function resolvePortalRole(user:User):Promise<PortalRole>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const admin=await supabase.from('portal_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(admin.error)throw admin.error;if(admin.data)return 'admin';
 const investor=await supabase.from('investor_profiles').select('user_id,status').eq('user_id',user.id).eq('status','approved').maybeSingle();
 if(investor.error)throw investor.error;if(investor.data)return 'investor';
 await supabase.auth.signOut();throw new Error('Akun belum memiliki akses dashboard.');
}
