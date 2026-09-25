import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { listPublishedPortalContent, type PortalCmsSection } from '../services/portalCms';
import { supabase } from '../lib/supabase';
import { mergePublishedContent, readContentField } from '../services/portalContentValues';

type Context = { sections: PortalCmsSection[]; error: string; content: <T>(key: string, fallback: T) => T };
const PortalContentContext = createContext<Context>({ sections: [], error: '', content: (_key, fallback) => fallback });
export const PortalContentProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [sections, setSections] = useState<PortalCmsSection[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let generation = 0;
    const load = async () => {
      const request = ++generation;
      try {
        const rows = await listPublishedPortalContent();
        if (active && request === generation) { setSections(rows); setError(''); }
      } catch { if (active) setError('Pembaruan konten belum dapat dimuat.'); }
    };
    void load();
    const channel = supabase?.channel('portal-content-live').on('postgres_changes', { event: '*', schema: 'public', table: 'portal_content' }, () => void load()).subscribe();
    // Refetch after publishing in this tab and after reconnecting. Polling also covers
    // projects where the Realtime publication has not been enabled yet.
    const refresh = () => { if (document.visibilityState === 'visible') void load(); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('portal-content-published', refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false; window.clearInterval(timer);
      window.removeEventListener('portal-content-published', refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', refresh);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);
  const value = useMemo(() => ({ sections, error, content: <T,>(key: string, fallback: T): T => mergePublishedContent(sections.find(s => s.key === key)?.content, fallback) }), [sections, error]);
  return <PortalContentContext.Provider value={value}>{children}</PortalContentContext.Provider>;
};
export const usePortalContent = () => useContext(PortalContentContext);
export function usePortalSection(key: string) {
  const { sections } = usePortalContent();
  const row = sections.find(section => section.key === key);
  return <T,>(field: string, fallback: T): T => readContentField(row?.content, field, fallback);
}
