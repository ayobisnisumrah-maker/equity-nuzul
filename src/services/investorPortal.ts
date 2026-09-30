import {supabase} from '../lib/supabase';
export interface InvestorPortfolio{investor_code:string|null;full_name:string;units:number;ownership_percent:number;invested_amount:number}
export interface InvestorTransaction{id:string;transaction_date:string;reference_no:string;description:string;amount:number;payment_method:string;status:string}
export interface InvestorHolding{id:string;offering_name:string;offering_code:string;units:number;ownership_percent:number;unit_price:number;invested_amount:number;acquisition_at:string;transfer_eligible_at:string;status:string;acquisition_reference:string|null}
export interface InvestorInheritance{id:string;holding_id:string;beneficiary_name:string;units:number;status:string;requested_at:string;approved_at:string|null;completed_at:string|null;rejection_reason:string|null}
export interface InvestorDistribution{id:string;period:string;amount:number;status:string;paid_at:string|null;notes:string|null}
export interface SalesSummary{invoice_count:number;total_sales:number;payments_received:number;refunds:number;outstanding:number;net_cash:number;paid_count:number;dp_count:number;refunded_count:number;cancelled_count:number;pax:number}
export interface InvestorDocument{id:string;title:string;category:string;file_url:string;created_at:string}
export interface InvestorFinancialReport{report_id:string;title:string;period_start:string;period_end:string;published_at:string|null;storage_path:string;original_filename:string}
const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function getInvestorDashboardData(){
 const {data:{user}}=await db().auth.getUser();if(!user)throw new Error('Sesi investor tidak tersedia.');
 const investor=await db().from('investors').select('id,reference_code,legal_name,status').eq('id',user.id).single();if(investor.error)throw investor.error;if(!['approved','active'].includes(String(investor.data.status)))throw new Error('Akses investor belum aktif.');
 const [holdings,allocations,documents,sales,ownershipActivity,portfolioDetails,inheritanceActivity]=await Promise.all([
  db().from('ownership_holdings').select('id,units,ownership_bps,status').eq('investor_id',user.id).in('status',['reserved','active']),
  db().from('profit_distribution_allocations').select('id,allocation_amount,status,paid_at,payment_reference,profit_distributions(period_start,period_end,notes)').eq('investor_id',user.id).in('status',['payable','paid']).order('created_at',{ascending:false}),
  db().from('documents').select('id,title,kind,created_at,published_version_id').eq('status','published').order('created_at',{ascending:false}),
  db().rpc('get_investor_sales_summary'),
  db().rpc('get_investor_ownership_activity'),
  db().rpc('get_investor_equity_portfolio_detail'),
  db().rpc('get_investor_inheritance_activity')
 ]);
 if(holdings.error)throw holdings.error;if(allocations.error)throw allocations.error;if(documents.error)throw documents.error;if(sales.error)throw sales.error;if(ownershipActivity.error)throw ownershipActivity.error;if(portfolioDetails.error)throw portfolioDetails.error;if(inheritanceActivity.error)throw inheritanceActivity.error;
 const hs=holdings.data||[];const units=hs.reduce((s:any,h:any)=>s+Number(h.units||0),0);const bps=hs.reduce((s:any,h:any)=>s+Number(h.ownership_bps||0),0);
 const holdingDetails:InvestorHolding[]=(portfolioDetails.data||[]).map((h:any)=>({id:h.holding_id,offering_name:h.offering_name,offering_code:h.offering_code,units:Number(h.units||0),ownership_percent:Number(h.ownership_bps||0)/100,unit_price:Number(h.unit_price||0),invested_amount:Number(h.invested_amount||0),acquisition_at:h.acquisition_at,transfer_eligible_at:h.transfer_eligible_at,status:h.status,acquisition_reference:h.acquisition_reference||null}));
 const profile:InvestorPortfolio={investor_code:investor.data.reference_code,full_name:investor.data.legal_name,units,ownership_percent:bps/100,invested_amount:holdingDetails.reduce((sum,h)=>sum+h.invested_amount,0)};
 const inheritance:InvestorInheritance[]=(inheritanceActivity.data||[]).map((i:any)=>({id:i.id,holding_id:i.holding_id,beneficiary_name:i.beneficiary_name,units:Number(i.units||0),status:i.status,requested_at:i.requested_at,approved_at:i.approved_at||null,completed_at:i.completed_at||null,rejection_reason:i.rejection_reason||null}));
 const distributions:InvestorDistribution[]=(allocations.data||[]).map((a:any)=>{const d=Array.isArray(a.profit_distributions)?a.profit_distributions[0]:a.profit_distributions;return{id:a.id,period:d?.period_start&&d?.period_end?`${d.period_start} – ${d.period_end}`:'—',amount:Number(a.allocation_amount||0),status:String(a.status),paid_at:a.paid_at||null,notes:d?.notes||null}});
 // Investor transaction history is sourced only from canonical ownership records through a self-scoped SECURITY DEFINER RPC. Customer finance rows remain private.
 const transactions:InvestorTransaction[]=(ownershipActivity.data||[]).map((t:any)=>({id:t.id,transaction_date:t.transaction_date,reference_no:t.reference_no,description:t.description,amount:Number(t.amount||0),payment_method:t.payment_method,status:t.status}));
 const docs:InvestorDocument[]=(documents.data||[]).map((d:any)=>({id:d.id,title:d.title,category:String(d.kind||'Dokumen'),file_url:d.id,created_at:d.created_at}));
 const raw=Array.isArray(sales.data)?sales.data[0]:sales.data;const salesSummary:SalesSummary={invoice_count:Number(raw?.invoice_count||0),total_sales:Number(raw?.total_sales||0),payments_received:Number(raw?.payments_received||0),refunds:Number(raw?.refunds||0),outstanding:Number(raw?.outstanding||0),net_cash:Number(raw?.net_cash||0),paid_count:Number(raw?.paid_count||0),dp_count:Number(raw?.dp_count||0),refunded_count:Number(raw?.refunded_count||0),cancelled_count:Number(raw?.cancelled_count||0),pax:Number(raw?.pax||0)};
 const financialReportsResult=await db().schema('app').rpc('list_investor_financial_reports');if(financialReportsResult.error)throw financialReportsResult.error;const financialReports=(financialReportsResult.data||[]) as InvestorFinancialReport[];
 return {profile,holdings:holdingDetails,inheritance,transactions,distributions,documents:docs,financialReports,salesSummary};
}

export async function downloadInvestorDocument(documentId:string){const client=db();const {data,error}=await client.functions.invoke('investor-document-download',{body:{document_id:documentId}});if(error)throw error;if(!data?.url)throw new Error('Tautan dokumen tidak tersedia.');window.open(String(data.url),'_blank','noopener,noreferrer')}

export async function downloadInvestorFinancialReport(path:string,fileName:string){const client=db();const {data,error}=await client.storage.from('financial-documents').download(path);if(error)throw error;const url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download=fileName||'laporan-keuangan.pdf';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
