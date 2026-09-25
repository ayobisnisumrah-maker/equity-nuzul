import React,{useEffect,useMemo,useState} from 'react';
import {PortalEditor} from './PortalEditor';
import {CashierModule,DocumentsModule,FinanceModule,ReportsModule} from './OperationsModules';
import {InvestorManagement} from './InvestorManagement';
import {AdminManagement} from './AdminManagement';
import type {PortalIdentity} from '../../services/auth';
import {getAdminAccess,type AdminModule} from '../../services/adminAccess';
import {supabase} from '../../lib/supabase';
import {BarChart3,BookOpen,Building2,CashRegister,FileText,LayoutDashboard,LogOut,Menu,ReceiptText,Settings,Users,WalletCards,X} from 'lucide-react';

type Module=AdminModule;
const modules:{id:Module;label:string;icon:any;description:string}[]=[
 {id:'ringkasan',label:'Ringkasan',icon:LayoutDashboard,description:'Ringkasan operasional Nuzultrip Equity'},
 {id:'portal',label:'Portal',icon:Building2,description:'Kelola isi portal tanpa mengubah layout'},
 {id:'investor',label:'Investor',icon:Users,description:'Pendaftaran, verifikasi, dan data investor'},
 {id:'kasir',label:'Kasir',icon:CashRegister,description:'Pencatatan penerimaan dan transaksi'},
 {id:'keuangan',label:'Keuangan',icon:WalletCards,description:'Pemasukan, pengeluaran, dan rekonsiliasi'},
 {id:'laporan',label:'Laporan',icon:BarChart3,description:'Laporan operasional, investor, dan keuangan'},
 {id:'dokumen',label:'Dokumen Portal',icon:FileText,description:'Dokumen PDF publik dan investor'},
 {id:'admin',label:'Admin',icon:BookOpen,description:'Pengguna admin dan pembagian tugas'},
 {id:'pengaturan',label:'Pengaturan',icon:Settings,description:'Konfigurasi dashboard dan portal'}
];
export const AdminDashboard:React.FC<{identity:PortalIdentity;onBack:()=>void;onLogout:()=>void}>=({identity,onBack,onLogout})=>{
 const [active,setActive]=useState<Module>('ringkasan');const [mobile,setMobile]=useState(false);const [permissions,setPermissions]=useState<AdminModule[]>(['ringkasan']);const [roleLabel,setRoleLabel]=useState(identity.roleLabel);
 useEffect(()=>{void supabase?.auth.getUser().then(async({data})=>{if(!data.user)return;try{const access=await getAdminAccess(data.user.id);setPermissions(access.permissions);setRoleLabel(access.role);if(!access.permissions.includes(active))setActive('ringkasan')}catch{}})},[]);
 const visibleModules=useMemo(()=>modules.filter(m=>permissions.includes(m.id)),[permissions]);
 const current=modules.find(x=>x.id===active)!;
 return <div className="min-h-screen bg-[#f5f5f3] text-[#111] flex">
  <aside className={`fixed lg:sticky top-0 z-40 h-screen w-[270px] bg-[#131314] text-white p-4 flex flex-col transition-transform lg:translate-x-0 ${mobile?'translate-x-0':'-translate-x-full'}`}>
   <div className="px-3 py-4 border-b border-white/10 flex items-center justify-between"><div><div className="font-bold">Nuzultrip Equity</div><div className="text-xs text-white/45 mt-1">{identity.name} · {roleLabel}</div></div><button className="lg:hidden" onClick={()=>setMobile(false)}><X size={20}/></button></div>
   <nav className="py-4 space-y-1 overflow-y-auto">{visibleModules.map(m=>{const I=m.icon;return <button key={m.id} onClick={()=>{setActive(m.id);setMobile(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${active===m.id?'bg-white text-black':'text-white/70 hover:bg-white/10 hover:text-white'}`}><I size={17}/>{m.label}</button>})}</nav>
   <div className="mt-auto border-t border-white/10 pt-2"><button onClick={onBack} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white">← Kembali ke Portal</button><button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white"><LogOut size={17}/>Keluar</button></div>
  </aside>
  {mobile&&<button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={()=>setMobile(false)} aria-label="Tutup menu"/>}
  <main className="flex-1 min-w-0">
   <header className="h-[72px] bg-white border-b flex items-center px-5 lg:px-8 gap-4 sticky top-0 z-20"><button className="lg:hidden p-2" onClick={()=>setMobile(true)}><Menu size={20}/></button><div><h1 className="font-bold">{current.label}</h1><p className="text-xs text-black/45">{current.description}</p></div></header>
   <div className="p-5 lg:p-8">
    {active==='ringkasan'?<div className="space-y-6"><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[['Investor','—'],['Transaksi Kasir','—'],['Pemasukan','—'],['Dokumen','—']].map(([l,v])=><div key={l} className="bg-white border rounded-2xl p-5"><p className="text-xs text-black/45">{l}</p><p className="text-2xl font-bold mt-2">{v}</p></div>)}</div><div className="bg-white border rounded-2xl p-6"><h2 className="font-bold">Aktivitas Portal</h2><p className="text-sm text-black/50 mt-2">Data operasional akan ditampilkan dari database production setelah modul terkait terhubung.</p></div></div>:
    active==='portal'?<PortalEditor/>:
    active==='investor'?<InvestorManagement/>:
    active==='kasir'?<CashierModule/>:
    active==='keuangan'?<FinanceModule/>:
    active==='laporan'?<ReportsModule/>:
    active==='dokumen'?<DocumentsModule/>:
    active==='admin'?<AdminManagement/>:
    <div className="bg-white border rounded-2xl p-6 min-h-[420px]"><div className="flex items-center gap-3"><current.icon size={20}/><h2 className="font-bold">{current.label}</h2></div><p className="text-sm text-black/50 mt-3">{current.description}. Modul ini disiapkan terpisah dari source tampilan portal agar isi portal yang sudah ada tetap utuh.</p>{active==='kasir'&&<div className="mt-6 border rounded-xl p-4 flex items-center gap-3"><ReceiptText size={18}/><span className="text-sm">Transaksi kasir akan menggunakan data transaksi production, bukan data dummy.</span></div>}</div>}
   </div>
  </main>
 </div>
};
