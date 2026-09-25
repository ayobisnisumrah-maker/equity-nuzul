import {supabase} from '../lib/supabase';
export interface InvestorPortfolio{investor_code:string|null;full_name:string;units:number;ownership_percent:number;invested_amount:number}
export interface InvestorTransaction{id:string;transaction_date:string;reference_no:string;description:string;amount:number;payment_method:string;status:string}
export interface InvestorDistribution{id:string;period:string;amount:number;status:string;paid_at:string|null;notes:string|null}
export interface SalesSummary{invoice_count:number;total_sales:number;payments_received:number;refunds:number;outstanding:number;paid_count:number;dp_count:number;refunded_count:number;pax:number}\nexport interface InvestorDocument{id:string;title:string;category:string;file_url:string;created_at:string}
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getInvestorDashboardData(){
 const {data:{user}}=await db().auth.getUser();if(!user)throw new Error('Sesi investor tidak tersedia.');
 const [profile,transactions,distributions,documents,sales]=await Promise.all([
  db().from('investor_profiles').select('investor_code,full_name,units,ownership_percent,invested_amount').eq('user_id',user.id).eq('status','approved').single(),
  db().from('cash_transactions').select('id,transaction_date,reference_no,description,amount,payment_method,status').eq('investor_user_id',user.id).order('transaction_date',{ascending:false}),
  db().from('investor_distributions').select('id,period,amount,status,paid_at,notes').eq('investor_user_id',user.id).order('created_at',{ascending:false}),
  db().from('portal_documents').select('id,title,category,file_url,created_at').eq('published',true).in('audience',['public','investor']).order('created_at',{ascending:false}),
  db().rpc('get_investor_sales_summary')
 ]);
 if(profile.error)throw profile.error;if(transactions.error)throw transactions.error;if(distributions.error)throw distributions.error;if(documents.error)throw documents.error;if(sales.error)throw sales.error;
 const raw=Array.isArray(sales.data)?sales.data[0]:sales.data;const salesSummary:SalesSummary={invoice_count:Number(raw?.invoice_count||0),total_sales:Number(raw?.total_sales||0),payments_received:Number(raw?.payments_received||0),refunds:Number(raw?.refunds||0),outstanding:Number(raw?.outstanding||0),paid_count:Number(raw?.paid_count||0),dp_count:Number(raw?.dp_count||0),refunded_count:Number(raw?.refunded_count||0),pax:Number(raw?.pax||0)};
 return {profile:profile.data as InvestorPortfolio,transactions:(transactions.data||[]) as InvestorTransaction[],distributions:(distributions.data||[]) as InvestorDistribution[],documents:(documents.data||[]) as InvestorDocument[],salesSummary};
}
