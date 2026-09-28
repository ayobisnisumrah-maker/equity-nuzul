import {supabase} from '../lib/supabase';

const db=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};

export async function getAdminSummary(){
 const [investors,documents,invoices,items,payments,refunds,expenses]=await Promise.all([
  db().from('investors').select('id,status',{count:'exact'}),
  db().from('documents').select('id',{count:'exact'}),
  db().from('finance_invoices').select('id,status,grand_total,paid_total,refunded_total'),
  db().from('finance_invoice_items').select('invoice_id,quantity,unit_label'),
  db().from('finance_payments').select('id,amount,status,received_at').order('received_at',{ascending:false}),
  db().from('finance_refunds').select('id,invoice_id,amount,status'),
  db().from('finance_expenses').select('id,total_amount,status')
 ]);
 for(const result of [investors,documents,invoices,items,payments,refunds,expenses])if(result.error)throw result.error;

 const investorRows=investors.data||[];
 const invoiceRows=invoices.data||[];
 const itemRows=items.data||[];
 const paymentRows=payments.data||[];
 const refundRows=refunds.data||[];
 const expenseRows=expenses.data||[];

 const approved=investorRows.filter(x=>['approved','active'].includes(String(x.status))).length;
 const confirmedPayments=paymentRows.filter(x=>x.status==='confirmed');
 const processedRefunds=refundRows.filter(x=>x.status==='processed');
 const activeExpenses=expenseRows.filter(x=>!['void','cancelled'].includes(String(x.status)));
 const income=confirmedPayments.reduce((a,x)=>a+Number(x.amount||0),0);
 const expense=activeExpenses.reduce((a,x)=>a+Number(x.total_amount||0),0);
 const refund=processedRefunds.reduce((a,x)=>a+Number(x.amount||0),0);

 const activeSales=invoiceRows.filter(x=>!['draft','void'].includes(String(x.status)));
 const salesTotal=activeSales.reduce((a,x)=>a+Number(x.grand_total||0),0);
 const salesPaid=activeSales.reduce((a,x)=>a+Number(x.paid_total||0),0);
 const salesOutstanding=activeSales.reduce((a,x)=>a+Math.max(0,Number(x.grand_total||0)-Math.max(0,Number(x.paid_total||0)-Number(x.refunded_total||0))),0);
 const paidInvoices=invoiceRows.filter(x=>x.status==='paid').length;
 const dpInvoices=invoiceRows.filter(x=>x.status==='partially_paid').length;
 const refundedInvoiceIds=new Set(processedRefunds.map(x=>x.invoice_id).filter(Boolean));
 const refundedInvoices=refundedInvoiceIds.size;
 const cancelledInvoices=invoiceRows.filter(x=>x.status==='void').length;
 const activeInvoiceIds=new Set(activeSales.map(x=>x.id));
 const pax=itemRows.filter(x=>activeInvoiceIds.has(x.invoice_id)&&String(x.unit_label).toLowerCase()==='pax').reduce((a,x)=>a+Number(x.quantity||0),0);

 return {
  investors:investors.count||0,
  approved,
  cashCount:confirmedPayments.length,
  income,
  expense,
  balance:income-refund-expense,
  documents:documents.count||0,
  recentCash:confirmedPayments.slice(0,8),
  sales:{
   invoiceCount:activeSales.length,
   total:salesTotal,
   paid:salesPaid,
   refund,
   outstanding:salesOutstanding,
   netCash:salesPaid-refund,
   pax,
   paidInvoices,
   dpInvoices,
   refundedInvoices,
   cancelledInvoices
  }
 };
}

export async function getPortalSettings(){const {data,error}=await db().from('site_settings').select('key,value').order('key');if(error)throw error;return Object.fromEntries((data||[]).map(x=>[x.key,typeof x.value==='string'?x.value:String(x.value??'')])) as Record<string,string>}
export async function savePortalSettings(values:Record<string,string>){const user=(await db().auth.getUser()).data.user;if(!user)throw new Error('Sesi admin tidak tersedia.');const existing=await db().from('site_settings').select('key,description,is_public');if(existing.error)throw existing.error;const meta=new Map((existing.data||[]).map(x=>[x.key,x]));const rows=Object.entries(values).map(([key,value])=>({key,value,description:meta.get(key)?.description||key,is_public:meta.get(key)?.is_public??false,updated_by:user.id,updated_at:new Date().toISOString()}));const {error}=await db().from('site_settings').upsert(rows,{onConflict:'key'});if(error)throw error}

export async function getSalesReport(){const [invoices,items,payments,refunds,expenses]=await Promise.all([db().from('finance_invoices').select('id,reference,status,customer_name,grand_total,paid_total,refunded_total,created_at,departure_on').order('created_at',{ascending:false}),db().from('finance_invoice_items').select('invoice_id,quantity,unit_label'),db().from('finance_payments').select('invoice_id,amount,status'),db().from('finance_refunds').select('invoice_id,amount,status'),db().from('finance_expenses').select('total_amount,status')]);for(const r of [invoices,items,payments,refunds,expenses])if(r.error)throw r.error;const invoiceRows=invoices.data||[],active=invoiceRows.filter(x=>!['draft','void'].includes(String(x.status))),ids=new Set(active.map(x=>x.id));const confirmed=(payments.data||[]).filter(x=>x.status==='confirmed'&&ids.has(x.invoice_id));const processed=(refunds.data||[]).filter(x=>x.status==='processed'&&ids.has(x.invoice_id));const activeExpenses=(expenses.data||[]).filter(x=>!['void','cancelled'].includes(String(x.status)));const pax=(items.data||[]).filter(x=>ids.has(x.invoice_id)&&String(x.unit_label).toLowerCase()==='pax').reduce((a,x)=>a+Number(x.quantity||0),0);const income=confirmed.reduce((a,x)=>a+Number(x.amount||0),0),refund=processed.reduce((a,x)=>a+Number(x.amount||0),0),expense=activeExpenses.reduce((a,x)=>a+Number(x.total_amount||0),0);return {invoices:invoiceRows,pax,total:active.reduce((a,x)=>a+Number(x.grand_total||0),0),income,refund,expense,netCash:income-refund-expense,outstanding:active.reduce((a,x)=>a+Math.max(0,Number(x.grand_total||0)-Math.max(0,Number(x.paid_total||0)-Number(x.refunded_total||0))),0),paid:active.filter(x=>x.status==='paid').length,partial:active.filter(x=>x.status==='partially_paid').length,issued:active.filter(x=>x.status==='issued').length,voided:invoiceRows.filter(x=>x.status==='void').length}}
