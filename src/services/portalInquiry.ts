import { supabase } from '../lib/supabase';

export type EquityInterestInput={
  name:string;
  email:string;
  phone:string;
  investorType:string;
  units:number;
  ownershipPercent:number;
  investmentValue:number;
};

export async function submitEquityInterest(input:EquityInterestInput){
  if(!supabase) throw new Error('Layanan pengajuan belum tersedia.');
  const message=[
    'Minat Equity Nuzultrip',
    `Profil: ${input.investorType}`,
    `Unit: ${input.units}`,
    `Porsi: ${input.ownershipPercent.toLocaleString('id-ID')}%`,
    `Nilai: Rp ${input.investmentValue.toLocaleString('id-ID')}`
  ].join('\n');
  const {error}=await supabase.from('portal_inquiries').insert({
    name:input.name.trim(),
    email:input.email.trim().toLowerCase(),
    phone:input.phone.trim(),
    organization:input.investorType,
    message,
    source_page:'equity-interest',
    user_agent:navigator.userAgent,
    status:'new'
  });
  if(error) throw error;
}
