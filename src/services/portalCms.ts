import { supabase } from '../lib/supabase';

export type PortalContentMap = Record<string, unknown>;

export interface PortalCmsSection {
  id: string;
  key: string;
  label: string;
  content: PortalContentMap;
  updated_at?: string;
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
    .select('id,key,label,content,updated_at')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as PortalCmsSection[];
}

export async function savePortalContent(section: PortalCmsSection): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { error } = await supabase.from('portal_content').update({
    content: section.content,
    updated_at: new Date().toISOString(),
  }).eq('id', section.id);
  if (error) throw error;
}
