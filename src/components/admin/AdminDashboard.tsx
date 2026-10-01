import React,{useEffect,useMemo,useState} from 'react';
import {PortalEditor} from './PortalEditor';
import {CashierModule,DocumentsModule,FinanceModule,ReportsModule} from './OperationsModules';
import {InvestorManagement} from './InvestorManagement';
import {AdminManagement} from './AdminManagement';
import {AdminSummary,SettingsModule} from './AdminOverview';
import type {PortalIdentity} from '../../services/auth';
import {getAdminAccess,type AdminModule} from '../../services/adminAccess';
import {supabase} from '../../lib/supabase';
import {BarChart3,BookOpen,Building2,BadgeDollarSign,FileText,LayoutDashboard,LogOut,Menu,Settings,Users,WalletCards,X} from 'lucide-react';

type Module=AdminModule;
const modules:{id:Module;label:string;icon:any;description:string}[]=[
 {id:'ringkasan',label:'Ringkasan',icon:LayoutDashboard,description:'Ringkasan operasional Nuzultrip Equity'},
 {id:'portal',label:'Portal',icon:Building2,description:'Kelola isi portal tanpa mengubah layout'},
 {id:'investor',label:'Investor',icon:Users,description:'Pendaftaran, verifikasi, dan data investor'},
 {id:'kasir',label:'Kasir',icon:BadgeDollarSign,description:'Pencatatan penerimaan dan transaksi'},
 {id:'keuangan',label:'Keuangan',icon:WalletCards,description:'Pemasukan, pengeluaran, dan rekonsiliasi'},
 {id:'laporan',label:'Laporan',icon:BarChart3,description:'Laporan operasional, investor, dan keuangan'},
 {id:'dokumen',label:'Dokumen Portal',icon:FileText,description:'Dokumen PDF publik dan investor'},
 {id:'admin',label:'Admin',icon:BookOpen,description:'Pengguna admin dan pembagian tugas'},
 {id:'pengaturan',label:'Pengaturan',icon:Settings,description:'Konfigurasi dashboard dan portal'}
];
export const AdminDashboard:React.FC<{identity:PortalIdentity;onBack:()=>void;onLogout:()=>void}>=({identity,onBack,onLogout})=>{
 const [active,setActive]=useState<Module>('ringkasan');const [mobile,setMobile]=useState(false);const [permissions,setPermissions]=useState<AdminModule[]>(['ringkasan']);const [permissionKeys,setPermissionKeys]=useState<string[]>([]);const [roleLabel,setRoleLabel]=useState(identity.roleLabel);
 useEffect(()=>{void supabase?.auth.getUser().then(async({data})=>{if(!data.user)return;try{const access=await getAdminAccess(data.user.id);setPermissions(access.permissions);setPermissionKeys(access.permissionKeys);setRoleLabel(access.role);if(!access.permissions.includes(active))setActive('ringkasan')}catch{}})},[]);
 const visibleModules=useMemo(()=>modules.filter(m=>permissions.includes(m.id)),[permissions]);
 const current=modules.find(x=>x.id===active)!;
 return <div className="min-h-screen bg-[#f6f7f8] text-[#111] flex">
  <aside className={`fixed lg:sticky top-0 z-40 h-screen w-[248px] bg-white text-[#111] border-r border-black/[.08] p-4 flex flex-col transition-transform lg:translate-x-0 ${mobile?'translate-x-0':'-translate-x-full'}`}>
   <div className="px-3 py-4 border-b border-black/[.08] flex items-center justify-between"><div><div className="font-bold">Nuzultrip Equity</div><div className="text-xs text-black/45 mt-1">{identity.name} · {roleLabel}</div></div><button className="lg:hidden" onClick={()=>setMobile(false)}><X size={20}/></button></div>
   <nav className="py-5 space-y-1.5 overflow-y-auto">{visibleModules.map(m=>{const I=m.icon;return <button key={m.id} onClick={()=>{setActive(m.id);setMobile(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${active===m.id?'bg-[#111] text-white shadow-sm':'text-black/60 hover:bg-black/[.045] hover:text-black'}`}><I size={17}/>{m.label}</button>})}</nav>
   <div className="mt-auto border-t border-black/[.08] pt-3"><button onClick={onBack} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black/50 hover:text-black hover:bg-black/[.035] rounded-lg">← Kembali ke Portal</button><button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black/50 hover:text-black hover:bg-black/[.035] rounded-lg"><LogOut size={17}/>Keluar</button></div>
  </aside>
  {mobile&&<button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={()=>setMobile(false)} aria-label="Tutup menu"/>}
  <main className="flex-1 min-w-0">
   <header className="min-h-[78px] bg-white/95 backdrop-blur border-b border-black/[.08] flex items-center px-5 lg:px-10 gap-4 sticky top-0 z-20"><button className="lg:hidden p-2" onClick={()=>setMobile(true)}><Menu size={20}/></button><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.16em] font-bold text-black/35">Control Center</p><h1 className="font-bold text-lg tracking-[-.02em] mt-0.5">{current.label}</h1><p className="text-xs text-black/45 mt-0.5 truncate">{current.description}</p></div><div className="ml-auto hidden md:flex items-center gap-3"><div className="text-right"><p className="text-xs font-bold">{identity.name}</p><p className="text-[11px] text-black/40">{roleLabel}</p></div><div className="w-9 h-9 rounded-full bg-[#111] text-white grid place-items-center text-xs font-bold">{identity.name.slice(0,2).toUpperCase()}</div></div></header>
   <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
    {active==='ringkasan'?<AdminSummary/>:
    active==='portal'?<PortalEditor permissionKeys={permissionKeys}/>:
    active==='investor'?<InvestorManagement permissionKeys={permissionKeys}/>:
    active==='kasir'?<CashierModule permissionKeys={permissionKeys}/>:
    active==='keuangan'?<FinanceModule permissionKeys={permissionKeys}/>:
    active==='laporan'?<ReportsModule permissionKeys={permissionKeys}/>:
    active==='dokumen'?<DocumentsModule permissionKeys={permissionKeys} roleLabel={roleLabel}/>:
    active==='admin'?<AdminManagement permissionKeys={permissionKeys}/>:
    active==='pengaturan'?<SettingsModule permissionKeys={permissionKeys}/>:
    null}
   </div>
  </main>
 </div>
};
