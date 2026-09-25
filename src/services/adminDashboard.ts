import {supabase} from '../lib/supabase';
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getAdminSummary(){
 const [investors,cash,finance,documents]=await Promise.all([
  db().from('investor_profiles').select('user_id,status',{count:'exact'}),
  db().from('cash_transactions').select('id,amount,status,transaction_date').order('transaction_date',{ascending:false}).limit(8),
  db().from('finance_entries').select('type,amount'),
  db().from('portal_documents').select('id,published',{count:'exact'})
 ]);
 if(investors.error)throw investors.error;if(cash.error)throw cash.error;if(finance.error)throw finance.error;if(documents.error)throw documents.error;
 const approved=(investors.data||[]).filter(x=>x.status==='approved').length;
 const income=(finance.data||[]).filter(x=>x.type==='income').reduce((a,x)=>a+Number(x.amount),0);
 const expense=(finance.data||[]).filter(x=>x.type==='expense').reduce((a,x)=>a+Number(x.amount),0);
 return {investors:investors.count||0,approved,cashCount:cash.data?.length||0,income,expense,balance:income-expense,documents:documents.count||0,recentCash:cash.data||[]};
}
export async function getPortalSettings(){const {data,error}=await db().from('portal_settings').select('key,value').order('key');if(error)throw error;return Object.fromEntries((data||[]).map(x=>[x.key,x.value])) as Record<string,string>}
export async function savePortalSettings(values:Record<string,string>){const user=(await db().auth.getUser()).data.user;if(!user)throw new Error('Sesi admin tidak tersedia.');const rows=Object.entries(values).map(([key,value])=>({key,value,updated_by:user.id,updated_at:new Date().toISOString()}));const {error}=await db().from('portal_settings').upsert(rows,{onConflict:'key'});if(error)throw error}
