import {supabase} from '../lib/supabase';
export interface InvestorPortfolio{investor_code:string|null;full_name:string;units:number;ownership_percent:number;invested_amount:number}
export interface InvestorTransaction{id:string;transaction_date:string;reference_no:string;description:string;amount:number;payment_method:string;status:string}
export interface InvestorDistribution{id:string;period:string;amount:number;status:string;paid_at:string|null;notes:string|null}
export interface SalesSummary{invoice_count:number;total_sales:number;payments_received:number;refunds:number;outstanding:number;paid_count:number;dp_count:number;refunded_count:number;pax:number}\nexport interface InvestorDocument{id:string;title:string;category:string;file_url:string;created_at:string}
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getInvestorDashboardData(){
 const {data:{user}}=await db().auth.getUser();if(!user)throw new Error('Sesi investor tidak tersedia.');
 const [profile,transactions,distributions,documents,sales,payments]=await Promise.all([
  db().from('investor_profiles').select('investor_code,full_name,units,ownership_percent,invested_amount').eq('user_id',user.id).eq('status','approved').single(),
  db().from('cash_transactions').select('id,transaction_date,reference_no,description,amount,payment_method,status').eq('investor_user_id',user.id).order('transaction_date',{ascending:false}),
  db().from('investor_distributions').select('id,period,amount,status,paid_at,notes').eq('investor_user_id',user.id).order('created_at',{ascending:false}),
  db().from('portal_documents').select('id,title,category,file_url,created_at').eq('published',true).in('audience',['public','investor']).order('created_at',{ascending:false}),\n  db().from('sales_invoices').select('total_amount,paid_amount,refunded_amount,payment_status,pax'),\n  db().from('sales_payments').select('amount,kind')
 ]);
 if(profile.error)throw profile.error;if(transactions.error)throw transactions.error;if(distributions.error)throw distributions.error;if(documents.error)throw documents.error;if(sales.error)throw sales.error;if(payments.error)throw payments.error;\n const invoiceRows=sales.data||[],paymentRows=payments.data||[];const salesSummary:SalesSummary={invoice_count:invoiceRows.length,total_sales:invoiceRows.reduce((a,x)=>a+Number(x.total_amount),0),payments_received:paymentRows.filter(x=>x.kind==='payment').reduce((a,x)=>a+Number(x.amount),0),refunds:paymentRows.filter(x=>x.kind==='refund').reduce((a,x)=>a+Number(x.amount),0),outstanding:invoiceRows.reduce((a,x)=>a+Math.max(0,Number(x.total_amount)-Number(x.paid_amount)),0),paid_count:invoiceRows.filter(x=>x.payment_status==='paid').length,dp_count:invoiceRows.filter(x=>['dp','partial'].includes(x.payment_status)).length,refunded_count:invoiceRows.filter(x=>['refunded','partially_refunded'].includes(x.payment_status)).length,pax:invoiceRows.reduce((a,x)=>a+Number(x.pax),0)};
 return {profile:profile.data as InvestorPortfolio,transactions:(transactions.data||[]) as InvestorTransaction[],distributions:(distributions.data||[]) as InvestorDistribution[],documents:(documents.data||[]) as InvestorDocument[],salesSummary};
}
