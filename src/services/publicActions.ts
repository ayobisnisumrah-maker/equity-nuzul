import { supabase } from '../lib/supabase';
export interface EquityInquiry { id: string; name: string; email: string; phone: string; investor_type: string; units: number; }
export function validateInquiry(input: EquityInquiry) {
  if (!input.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.phone.replace(/\D/g, '').length < 8) throw new Error('Lengkapi nama, email, dan nomor telepon yang valid.');
  if (!Number.isInteger(input.units) || input.units < 1 || input.units > 50) throw new Error('Jumlah unit harus antara 1 dan 50.');
  return { ...input, name: input.name.trim(), email: input.email.trim().toLowerCase(), phone: input.phone.trim() };
}
export async function submitEquityInquiry(input: EquityInquiry) {
  const data = validateInquiry(input);
  if (!supabase) throw new Error('Layanan pengajuan belum terhubung. Silakan coba lagi nanti.');
  const { error } = await supabase.from('equity_inquiries').insert(data);
  // Retrying an acknowledged request must not create a second inquiry.
  if (error && error.code !== '23505') throw new Error('Pengajuan belum tersimpan. Silakan coba kembali.');
}
export async function downloadPublishedPitchdeck() {
  if (!supabase) throw new Error('Layanan dokumen belum terhubung.');
  const { data, error } = await supabase.from('portal_documents').select('title,file_url').eq('published', true).eq('audience', 'public').ilike('category', 'pitchdeck').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error('Dokumen belum dapat dimuat. Silakan coba kembali.');
  if (!data) throw new Error('Pitchdeck resmi belum dipublikasikan.');
  const url = new URL(data.file_url);
  if (url.protocol !== 'https:' || !url.pathname.toLowerCase().endsWith('.pdf')) throw new Error('Dokumen yang dipublikasikan harus berupa PDF.');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unduhan gagal. Silakan coba kembali.');
  const blob = await response.blob();
  if (!(await blob.slice(0, 5).text()).startsWith('%PDF-')) throw new Error('Berkas yang tersedia bukan PDF yang valid.');
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = href; link.download = 'Pitchdeck-Nuzultrip.pdf'; link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
