import {supabase} from '../lib/supabase';
export interface InvestorPortfolio{investor_code:string|null;full_name:string;units:number;ownership_percent:number;invested_amount:number}
export interface InvestorTransaction{id:string;transaction_date:string;reference_no:string;description:string;amount:number;payment_method:string;status:string}
export interface InvestorDistribution{id:string;period:string;amount:number;status:string;paid_at:string|null;notes:string|null}
export interface SalesSummary{invoice_count:number;total_sales:number;payments_received:number;refunds:number;outstanding:number;net_cash:number;paid_count:number;dp_count:number;refunded_count:number;cancelled_count:number;pax:number}
export interface InvestorDocument{id:string;title:string;category:string;file_url:string;created_at:string}
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getInvestorDashboardData(){
 const {data:{user}}=await db().auth.getUser();if(!user)throw new Error('Sesi investor tidak tersedia.');
 const investor=await db().from('investors').select('id,reference_code,legal_name,status').eq('id',user.id).single();if(investor.error)throw investor.error;if(!['approved','active'].includes(String(investor.data.status)))throw new Error('Akses investor belum aktif.');
 const [holdings,allocations,documents,sales]=await Promise.all([
  db().from('ownership_holdings').select('id,units,ownership_bps,status').eq('investor_id',user.id).in('status',['reserved','active']),
  db().from('profit_distribution_allocations').select('id,allocation_amount,status,paid_at,payment_reference,profit_distributions(period_start,period_end,notes)').eq('investor_id',user.id).in('status',['payable','paid']).order('created_at',{ascending:false}),
  db().from('documents').select('id,title,kind,created_at,published_version_id').eq('status','published').in('visibility',['public','investors']).order('created_at',{ascending:false}),
  db().rpc('get_investor_sales_summary')
 ]);
 if(holdings.error)throw holdings.error;if(allocations.error)throw allocations.error;if(documents.error)throw documents.error;if(sales.error)throw sales.error;
 const hs=holdings.data||[];const units=hs.reduce((s:any,h:any)=>s+Number(h.units||0),0);const bps=hs.reduce((s:any,h:any)=>s+Number(h.ownership_bps||0),0);
 const profile:InvestorPortfolio={investor_code:investor.data.reference_code,full_name:investor.data.legal_name,units,ownership_percent:bps/100,invested_amount:units*100000000};
 const distributions:InvestorDistribution[]=(allocations.data||[]).map((a:any)=>{const d=Array.isArray(a.profit_distributions)?a.profit_distributions[0]:a.profit_distributions;return{id:a.id,period:d?.period_start&&d?.period_end?`${d.period_start} – ${d.period_end}`:'—',amount:Number(a.allocation_amount||0),status:String(a.status),paid_at:a.paid_at||null,notes:d?.notes||null}});
 // Finance invoice/payment tables are admin-only by RLS. Do not bypass RLS or expose other customers' transactions to investors.
 const transactions:InvestorTransaction[]=[];
 const docs:InvestorDocument[]=(documents.data||[]).map((d:any)=>({id:d.id,title:d.title,category:String(d.kind||'Dokumen'),file_url:`/dokumen/${d.id}`,created_at:d.created_at}));
 const raw=Array.isArray(sales.data)?sales.data[0]:sales.data;const salesSummary:SalesSummary={invoice_count:Number(raw?.invoice_count||0),total_sales:Number(raw?.total_sales||0),payments_received:Number(raw?.payments_received||0),refunds:Number(raw?.refunds||0),outstanding:Number(raw?.outstanding||0),net_cash:Number(raw?.net_cash||0),paid_count:Number(raw?.paid_count||0),dp_count:Number(raw?.dp_count||0),refunded_count:Number(raw?.refunded_count||0),cancelled_count:Number(raw?.cancelled_count||0),pax:Number(raw?.pax||0)};
 return {profile,transactions,distributions,documents:docs,salesSummary};
}
