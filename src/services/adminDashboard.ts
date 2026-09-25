import {supabase} from '../lib/supabase';
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getAdminSummary(){
 const [investors,cash,finance,documents,sales]=await Promise.all([
  db().from('investor_profiles').select('user_id,status',{count:'exact'}),
  db().from('cash_transactions').select('id,amount,status,transaction_date').order('transaction_date',{ascending:false}).limit(8),
  db().from('finance_entries').select('type,amount'),
  db().from('portal_documents').select('id,published',{count:'exact'}),
  db().from('sales_invoices').select('id,total_amount,paid_amount,refunded_amount,payment_status,transaction_status,pax,voided_at')
 ]);
 if(investors.error)throw investors.error;if(cash.error)throw cash.error;if(finance.error)throw finance.error;if(documents.error)throw documents.error;if(sales.error)throw sales.error;
 const approved=(investors.data||[]).filter(x=>x.status==='approved').length;
 const income=(finance.data||[]).filter(x=>x.type==='income').reduce((a,x)=>a+Number(x.amount),0);
 const expense=(finance.data||[]).filter(x=>x.type==='expense').reduce((a,x)=>a+Number(x.amount),0);
 const activeSales=(sales.data||[]).filter(x=>!x.voided_at);const salesTotal=activeSales.reduce((a,x)=>a+Number(x.total_amount),0);const salesPaid=activeSales.reduce((a,x)=>a+Number(x.paid_amount),0);const salesRefund=(sales.data||[]).reduce((a,x)=>a+Number(x.refunded_amount),0);const salesOutstanding=activeSales.reduce((a,x)=>a+Math.max(0,Number(x.total_amount)-Number(x.paid_amount)),0);const salesPax=activeSales.reduce((a,x)=>a+Number(x.pax),0);const paidInvoices=(sales.data||[]).filter(x=>x.payment_status==='paid').length;const dpInvoices=(sales.data||[]).filter(x=>['dp','partial'].includes(x.payment_status)).length;const refundedInvoices=(sales.data||[]).filter(x=>['refunded','partially_refunded'].includes(x.payment_status)).length;const cancelledInvoices=(sales.data||[]).filter(x=>x.payment_status==='cancelled').length;return {investors:investors.count||0,approved,cashCount:cash.data?.length||0,income,expense,balance:income-expense,documents:documents.count||0,recentCash:cash.data||[],sales:{invoiceCount:activeSales.length,total:salesTotal,paid:salesPaid,refund:salesRefund,outstanding:salesOutstanding,netCash:salesPaid-salesRefund,pax:salesPax,paidInvoices,dpInvoices,refundedInvoices,cancelledInvoices}};
}
export async function getPortalSettings(){const {data,error}=await db().from('portal_settings').select('key,value').order('key');if(error)throw error;return Object.fromEntries((data||[]).map(x=>[x.key,x.value])) as Record<string,string>}
export async function savePortalSettings(values:Record<string,string>){const user=(await db().auth.getUser()).data.user;if(!user)throw new Error('Sesi admin tidak tersedia.');const rows=Object.entries(values).map(([key,value])=>({key,value,updated_by:user.id,updated_at:new Date().toISOString()}));const {error}=await db().from('portal_settings').upsert(rows,{onConflict:'key'});if(error)throw error}
