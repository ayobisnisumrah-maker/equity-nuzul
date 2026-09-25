import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { listPortalContent, savePortalContent, type PortalCmsSection } from '../../services/portalCms';
import { supabase } from '../../lib/supabase';

export const PortalContentDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sections,setSections]=useState<PortalCmsSection[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [draft,setDraft]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>{void (async()=>{try{const rows=await listPortalContent();setSections(rows);if(rows[0])setSelectedId(rows[0].id)}catch(e){setMessage(e instanceof Error?e.message:'Gagal memuat konten')}})()},[]);
  const selected=useMemo(()=>sections.find(s=>s.id===selectedId),[sections,selectedId]);
  useEffect(()=>{setDraft(selected?JSON.stringify(selected.content,null,2):'')},[selected]);
  const save=async()=>{if(!selected)return;setBusy(true);setMessage('');try{const content=JSON.parse(draft);await savePortalContent({...selected,content});setSections(v=>v.map(s=>s.id===selected.id?{...s,content}:s));setMessage('Konten tersimpan.')}catch(e){setMessage(e instanceof Error?e.message:'Gagal menyimpan')}finally{setBusy(false)}};
  const logout=async()=>{await supabase?.auth.signOut();onBack()};
  return <div className="min-h-screen bg-[#f5f5f3] text-[#111]">
    <header className="sticky top-0 z-20 bg-[#131314] text-white border-b border-white/10"><div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10" aria-label="Kembali"><ArrowLeft size={18}/></button><div><div className="font-bold">Dashboard Portal</div><div className="text-xs text-white/50">Edit konten tanpa mengubah layout</div></div></div><button onClick={logout} className="text-sm text-white/70 hover:text-white">Keluar</button></div></header>
    <div className="max-w-7xl mx-auto p-5 grid lg:grid-cols-[280px_1fr] gap-5">
      <aside className="bg-white rounded-2xl border p-3 h-fit"><div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-black/40">Bagian Portal</div>{sections.map(s=><button key={s.id} onClick={()=>setSelectedId(s.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm ${selectedId===s.id?'bg-black text-white':'hover:bg-black/5'}`}>{s.label}</button>)}</aside>
      <main className="bg-white rounded-2xl border p-5"><div className="flex items-center justify-between gap-4 mb-4"><div><h1 className="text-xl font-bold">{selected?.label||'Konten Portal'}</h1><p className="text-xs text-black/50 mt-1">Hanya nilai konten yang dapat diubah. Struktur layout tetap dikunci oleh kode portal.</p></div><button disabled={!selected||busy} onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-40"><Save size={15}/>{busy?'Menyimpan...':'Simpan'}</button></div>
      {message&&<div className="mb-3 text-sm rounded-xl bg-black/5 px-3 py-2">{message}</div>}
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} spellCheck={false} className="w-full min-h-[65vh] rounded-xl border p-4 font-mono text-xs leading-6 focus:outline-none focus:ring-2 focus:ring-black/20" placeholder="Konten JSON bagian portal"/>
      </main>
    </div>
  </div>;
};
