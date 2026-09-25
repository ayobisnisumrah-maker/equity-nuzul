import { supabase } from '../lib/supabase';

export type PortalContentMap = Record<string, unknown>;

export interface PortalCmsSection {
  id: string;
  key: string;
  label: string;
  content: PortalContentMap;
  updated_at?: string;
  draft_content?: PortalContentMap|null;
  draft_updated_at?: string|null;
  published_at?: string|null;
}

export async function listPublishedPortalContent(): Promise<PortalCmsSection[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('portal_content')
    .select('id,key,label,content,updated_at')
    .eq('published', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as PortalCmsSection[];
}

export async function listPortalContent(): Promise<PortalCmsSection[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('portal_content')
    .select('id,key,label,content,draft_content,updated_at,draft_updated_at,published_at')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as PortalCmsSection[];
}

export async function savePortalContent(section: PortalCmsSection): Promise<void> {
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const {error}=await supabase.rpc('save_portal_content_draft',{p_id:section.id,p_content:section.content});if(error)throw error;
}

export async function publishPortalContent(id:string):Promise<void>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const {error}=await supabase.rpc('publish_portal_content',{p_id:id});if(error)throw error;window.dispatchEvent(new Event('portal-content-published'));
}

export async function uploadPortalImage(sectionKey:string,fieldKey:string,file:File):Promise<string>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 if(!['image/jpeg','image/png','image/webp','image/svg+xml'].includes(file.type))throw new Error('Gambar harus JPG, PNG, WEBP, atau SVG.');
 if(file.size>10*1024*1024)throw new Error('Ukuran gambar maksimal 10 MB.');
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Sesi admin tidak tersedia.');
 const ext=file.name.split('.').pop()?.toLowerCase()||'bin';const path=`${sectionKey}/${fieldKey}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
 const up=await supabase.storage.from('portal-media').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
 const url=supabase.storage.from('portal-media').getPublicUrl(path).data.publicUrl;
 const {error}=await supabase.from('portal_media').insert({section_key:sectionKey,field_key:fieldKey,file_name:file.name,file_url:url,storage_path:path,mime_type:file.type,created_by:user.id});
 if(error){await supabase.storage.from('portal-media').remove([path]);throw error}return url;
}

export async function ensurePortalContentSection(key:string,label:string,content:PortalContentMap,sortOrder:number):Promise<PortalCmsSection>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const found=await supabase.from('portal_content').select('id,key,label,content,draft_content,updated_at,draft_updated_at,published_at').eq('key',key).maybeSingle();
 if(found.error)throw found.error;if(found.data)return found.data as PortalCmsSection;
 const {data,error}=await supabase.from('portal_content').insert({key,label,content,sort_order:sortOrder,published:true}).select('id,key,label,content,draft_content,updated_at,draft_updated_at,published_at').single();
 if(error)throw error;return data as PortalCmsSection;
}

export interface PortalContentVersion{ id:string;portal_content_id:string;section_key:string;version_no:number;content:PortalContentMap;action:'publish'|'rollback';source_version_id?:string|null;created_at:string; }
export async function listPortalContentVersions(portalContentId:string):Promise<PortalContentVersion[]>{
 if(!supabase)return[];const {data,error}=await supabase.from('portal_content_versions').select('id,portal_content_id,section_key,version_no,content,action,source_version_id,created_at').eq('portal_content_id',portalContentId).order('version_no',{ascending:false}).limit(20);if(error)throw error;return(data??[]) as PortalContentVersion[];
}
export async function rollbackPortalContent(portalContentId:string,versionId:string):Promise<void>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');const {error}=await supabase.rpc('rollback_portal_content',{p_id:portalContentId,p_version_id:versionId});if(error)throw error;window.dispatchEvent(new Event('portal-content-published'));
}
