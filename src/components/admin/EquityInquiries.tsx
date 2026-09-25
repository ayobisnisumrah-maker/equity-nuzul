import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { EquityInquiry } from '../../services/publicActions';
type Inquiry = EquityInquiry & { status: 'new' | 'contacted' | 'closed'; created_at: string };
export function EquityInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const load = async () => {
    if (!supabase) { setError('Layanan pengajuan belum terhubung.'); return; }
    const result = await supabase.from('equity_inquiries').select('id,name,email,phone,investor_type,units,status,created_at').order('created_at', { ascending: false }).limit(100);
    if (result.error) { setError('Pengajuan belum dapat dimuat. Periksa koneksi database.'); return; }
    setRows(result.data as Inquiry[]); setError('');
  };
  useEffect(() => {
    void load();
    const channel = supabase?.channel('admin-equity-inquiries').on('postgres_changes', { event: '*', schema: 'public', table: 'equity_inquiries' }, () => void load()).subscribe();
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);
  const update = async (id: string, status: Inquiry['status']) => {
    if (!supabase) return;
    setBusy(id);
    const { error } = await supabase.from('equity_inquiries').update({ status }).eq('id', id);
    if (error) setError('Status belum tersimpan.'); else await load();
    setBusy('');
  };
  return <section className="bg-white border rounded-2xl p-5 mb-6">
    <div className="flex justify-between gap-3"><h2 className="font-bold">Pengajuan Minat Equity</h2><button onClick={() => void load()} className="text-sm underline">Muat ulang</button></div>
    <p className="text-sm text-black/50 mt-1">Permintaan dari portal publik. Pembuatan akun investor tetap dilakukan oleh admin.</p>
    {error && <p role="alert" className="text-red-700 text-sm mt-3">{error}</p>}
    {!error && !rows.length && <p className="text-sm text-black/50 mt-4">Belum ada pengajuan.</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm mt-4 text-left"><thead><tr>{['Nama', 'Kontak', 'Profil', 'Unit', 'Status'].map(x => <th key={x} className="py-2 pr-4">{x}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="py-3 pr-4">{row.name}</td><td className="pr-4">{row.email}<br />{row.phone}</td><td className="pr-4">{row.investor_type}</td><td className="pr-4">{row.units}</td><td><select aria-label={`Status ${row.name}`} disabled={busy === row.id} value={row.status} onChange={e => void update(row.id, e.target.value as Inquiry['status'])} className="border rounded-lg p-2"><option value="new">Baru</option><option value="contacted">Dihubungi</option><option value="closed">Selesai</option></select></td></tr>)}</tbody></table></div>
  </section>;
}
