import { supabase } from '../lib/supabase';

export type PortalContentMap = Record<string, unknown>;
const canonicalJson=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);

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
 const {error}=await supabase.rpc('save_portal_content_draft',{p_id:section.id,p_content:section.content});if(error)throw error;const {data:stored,error:verifyError}=await supabase.from('portal_content').select('draft_content').eq('id',section.id).single();if(verifyError)throw new Error('Draft dikirim tetapi verifikasi gagal: '+verifyError.message);if(canonicalJson(stored?.draft_content)!==canonicalJson(section.content))throw new Error('Draft tidak sesuai dengan hasil baca ulang database.');
}

export async function publishPortalContent(id:string):Promise<void>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const {error}=await supabase.rpc('publish_portal_content',{p_id:id});if(error)throw error;const {data:stored,error:verifyError}=await supabase.from('portal_content').select('content,draft_content,published,published_at').eq('id',id).single();if(verifyError)throw new Error('Publish dikirim tetapi verifikasi gagal: '+verifyError.message);if(!stored?.published||!stored.published_at||canonicalJson(stored.content)!==canonicalJson(stored.draft_content))throw new Error('Hasil publish belum sesuai dengan konten draft di database.');
}

export async function uploadPortalImage(sectionKey:string,fieldKey:string,file:File):Promise<string>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Gambar harus JPG, PNG, atau WEBP.');
 if(file.size>10*1024*1024)throw new Error('Ukuran gambar maksimal 10 MB.');
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Sesi admin tidak tersedia.');
 const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
 const safeSection=sectionKey.replace(/[^a-zA-Z0-9_-]/g,'-'),safeField=fieldKey.replace(/[^a-zA-Z0-9_-]/g,'-');
 const path=`portal/${safeSection}/${safeField}/${crypto.randomUUID()}.${ext}`;
 const up=await supabase.storage.from('public-media').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
 const asset=await supabase.schema('app').rpc('register_portal_public_media',{p_path:path,p_original_filename:file.name,p_mime_type:file.type,p_byte_size:file.size});
 if(asset.error){await supabase.storage.from('public-media').remove([path]);throw asset.error}
 return supabase.storage.from('public-media').getPublicUrl(path).data.publicUrl;
}

export async function ensurePortalContentSection(key:string,label:string,content:PortalContentMap,sortOrder:number):Promise<PortalCmsSection>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const found=await supabase.from('portal_content').select('id,key,label,content,draft_content,updated_at,draft_updated_at,published_at').eq('key',key).maybeSingle();
 if(found.error)throw found.error;if(found.data)return found.data as PortalCmsSection;
 const {data,error}=await supabase.from('portal_content').insert({page:'home',section:key,title:label,slug:key,status:'published',key,label,content,draft_content:content,sort_order:sortOrder,published:true,published_at:new Date().toISOString()}).select('id,key,label,content,draft_content,updated_at,draft_updated_at,published_at').single();
 if(error)throw error;return data as PortalCmsSection;
}

export interface PortalContentVersion{ id:string;portal_content_id:string;section_key:string;version_no:number;content:PortalContentMap;action:'publish'|'rollback';source_version_id?:string|null;created_at:string; }
export async function listPortalContentVersions(portalContentId:string):Promise<PortalContentVersion[]>{
 if(!supabase)return[];const {data,error}=await supabase.from('portal_content_versions').select('id,portal_content_id,section_key,version_no,content,action,source_version_id,created_at').eq('portal_content_id',portalContentId).order('version_no',{ascending:false}).limit(20);if(error)throw error;return(data??[]) as PortalContentVersion[];
}
export async function rollbackPortalContent(portalContentId:string,versionId:string):Promise<void>{
 if(!supabase)throw new Error('Supabase belum dikonfigurasi.');
 const versionResult=await supabase.from('portal_content_versions').select('content').eq('id',versionId).eq('portal_content_id',portalContentId).single();
 if(versionResult.error)throw versionResult.error;
 const rollbackResult=await supabase.rpc('rollback_portal_content',{p_id:portalContentId,p_version_id:versionId});
 if(rollbackResult.error)throw rollbackResult.error;
 const readback=await supabase.from('portal_content').select('content,draft_content,published,published_at').eq('id',portalContentId).single();
 if(readback.error)throw new Error('Rollback berhasil dikirim tetapi verifikasi gagal: '+readback.error.message);
 const stored=readback.data;
 if(!stored?.published||!stored.published_at||canonicalJson(stored.content)!==canonicalJson(versionResult.data.content)||canonicalJson(stored.draft_content)!==canonicalJson(versionResult.data.content))throw new Error('Konten rollback tidak sesuai dengan versi yang dipilih saat dibaca ulang dari database.');
}
