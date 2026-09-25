import {supabase} from '../lib/supabase';
export type InvestorRow={user_id:string;investor_code:string|null;full_name:string;status:string;created_at:string};
export type CashRow={id:string;transaction_date:string;reference_no:string;description:string;amount:number;payment_method:string;status:string};
export type FinanceRow={id:string;entry_date:string;type:'income'|'expense';category:string;description:string;amount:number;reference_no:string|null};
export type DocumentRow={id:string;title:string;category:string;file_url:string;audience:string;published:boolean;created_at:string};
const client=()=>{if(!supabase)throw new Error('Supabase belum dikonfigurasi.');return supabase};
export async function listInvestors(){const {data,error}=await client().from('investor_profiles').select('user_id,investor_code,full_name,status,created_at').order('created_at',{ascending:false});if(error)throw error;return data as InvestorRow[]}
export async function setInvestorStatus(user_id:string,status:string){const {error}=await client().from('investor_profiles').update({status,updated_at:new Date().toISOString()}).eq('user_id',user_id);if(error)throw error}
export async function listCash(){const {data,error}=await client().from('cash_transactions').select('*').order('transaction_date',{ascending:false});if(error)throw error;return data as CashRow[]}
export async function addCash(input:Omit<CashRow,'id'>){const {error}=await client().from('cash_transactions').insert(input);if(error)throw error}
export async function listFinance(){const {data,error}=await client().from('finance_entries').select('*').order('entry_date',{ascending:false});if(error)throw error;return data as FinanceRow[]}
export async function addFinance(input:Omit<FinanceRow,'id'>){const {error}=await client().from('finance_entries').insert(input);if(error)throw error}
export async function listDocuments(){const {data,error}=await client().from('portal_documents').select('*').order('created_at',{ascending:false});if(error)throw error;return data as DocumentRow[]}
