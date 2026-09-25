import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import { listPublishedPortalContent, type PortalCmsSection } from '../services/portalCms';
import { supabase } from '../lib/supabase';

type Ctx={sections:PortalCmsSection[];content:<T=any>(key:string,fallback:T)=>T};
const PortalContentContext=createContext<Ctx>({sections:[],content:(_k,f)=>f});
export const PortalContentProvider:React.FC<React.PropsWithChildren>=({children})=>{
 const [sections,setSections]=useState<PortalCmsSection[]>([]);
 useEffect(()=>{let active=true;const load=async()=>{try{const rows=await listPublishedPortalContent();if(active)setSections(rows)}catch{}};void load();const channel=supabase?.channel('portal-content-live').on('postgres_changes',{event:'*',schema:'public',table:'portal_content'},()=>void load()).subscribe();return()=>{active=false;if(channel&&supabase)void supabase.removeChannel(channel)}},[]);
 const value=useMemo(()=>({sections,content:<T,>(key:string,fallback:T)=>{const row=sections.find(s=>s.key===key);return (row?.content as T)||fallback}}),[sections]);
 return <PortalContentContext.Provider value={value}>{children}</PortalContentContext.Provider>
};
export const usePortalContent=()=>useContext(PortalContentContext);
