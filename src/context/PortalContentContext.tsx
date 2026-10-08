import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import { listPublishedPortalContent, type PortalCmsSection } from '../services/portalCms';
import { supabase } from '../lib/supabase';

type Ctx={sections:PortalCmsSection[];loadError:string|null;content:<T=any>(key:string,fallback:T)=>T};
const PortalContentContext=createContext<Ctx>({sections:[],loadError:null,content:(_k,f)=>f});
export const PortalContentProvider:React.FC<React.PropsWithChildren>=({children})=>{
 const [sections,setSections]=useState<PortalCmsSection[]>([]);const [loadError,setLoadError]=useState<string|null>(null);
 useEffect(()=>{let active=true;const load=async()=>{try{const rows=await listPublishedPortalContent();if(active){setSections(rows);setLoadError(null)}}catch(error){if(active)setLoadError(error instanceof Error?error.message:'Gagal memuat konten portal.')}};void load();const channel=supabase?.channel('portal-content-live').on('postgres_changes',{event:'*',schema:'public',table:'portal_content'},()=>void load()).subscribe();return()=>{active=false;if(channel&&supabase)void supabase.removeChannel(channel)}},[]);
 const value=useMemo(()=>({sections,loadError,content:<T,>(key:string,fallback:T)=>{const row=sections.find(s=>s.key===key);return (row?.content as T)||fallback}}),[sections,loadError]);
 return <PortalContentContext.Provider value={value}>{loadError&&<div role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg">Konten portal belum berhasil disinkronkan. Informasi yang tampil mungkin bukan versi terbaru. Silakan muat ulang halaman.</div>}{children}</PortalContentContext.Provider>
};
export const usePortalContent=()=>useContext(PortalContentContext);
