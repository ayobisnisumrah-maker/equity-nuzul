import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ list: vi.fn(), submit: vi.fn(), download: vi.fn(), publish: vi.fn(), save: vi.fn(), rows: [] as any[] }));
vi.mock('../src/lib/supabase', () => ({ supabase: null }));
vi.mock('../src/services/portalCms', () => ({
  listPublishedPortalContent: state.list,
  listPortalContent: async () => state.rows,
  ensurePortalContentSection: async (key: string, label: string, content: any) => ({ id: key, key, label, content }),
  savePortalContent: state.save, publishPortalContent: state.publish,
  listPortalContentVersions: async () => [], uploadPortalImage: vi.fn()
}));
vi.mock('../src/services/publicActions', () => ({ submitEquityInquiry: state.submit, downloadPublishedPitchdeck: state.download }));
import { PortalContentProvider } from '../src/context/PortalContentContext';
import { HeroSection } from '../src/components/sections/HeroSection';
import { RoadmapSection } from '../src/components/sections/RoadmapSection';
import { InvestorInformationSection } from '../src/components/sections/InvestorInformationSection';
import { PortalEditor } from '../src/components/admin/PortalEditor';
import { EquityInterestModal } from '../src/components/modals/EquityInterestModal';
import { PitchdeckModal } from '../src/components/modals/PitchdeckModal';
import { readContentField } from '../src/services/portalContentValues';
let root: Root; let container: HTMLDivElement;
async function render(node: React.ReactNode) { await act(async () => root.render(node)); }
async function click(text: string) { const button = [...container.querySelectorAll('button')].find(x => x.textContent === text)!; expect(button).toBeTruthy(); await act(async () => button.click()); }
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks(); state.rows = []; state.list.mockResolvedValue([]);
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} });
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
describe('published dashboard content reaches the portal', () => {
  it('keeps original hero content until CMS supplies a published override', async () => {
    await render(<PortalContentProvider><HeroSection onOpenInterest={() => {}} /></PortalContentProvider>);
    expect(container.textContent).toContain('Berkembang Dalam Ekosistem Muslim');
    state.list.mockResolvedValue([{ id: 'hero', key: 'hero', content: { headline: 'Judul dari dashboard', headlineHighlight: 'Terbit', primaryCta: 'Hubungi pengelola' } }]);
    await act(async () => window.dispatchEvent(new Event('portal-content-published')));
    expect(container.textContent).toContain('Judul dari dashboard');
    expect(container.textContent).toContain('Hubungi pengelola');
    expect(container.textContent).not.toContain('Berkembang Dalam Ekosistem Muslim');
  });
  it('supports empty published lists without crashing roadmap or investor cards', async () => {
    state.list.mockResolvedValue([{ key: 'roadmap', content: { phasesJson: [] } }, { key: 'investor', content: { itemsJson: [] } }]);
    await render(<PortalContentProvider><RoadmapSection /><InvestorInformationSection onSelectItem={() => {}} /></PortalContentProvider>);
    expect(container.querySelectorAll('.roadmap-card')).toHaveLength(0);
  });
  it('keeps valid empty fields and decodes existing JSON strings', () => {
    expect(readContentField({ x: '' }, 'x', 'old')).toBe('');
    expect(readContentField({ x: '[]' }, 'x', ['old'])).toEqual([]);
    expect(readContentField({ x: 'broken' }, 'x', ['old'])).toEqual(['old']);
    expect(readContentField({ x: {} }, 'x', { title: 'original' })).toEqual({ title: 'original' });
  });
});
describe('draft publication', () => {
  it('publishes the values currently shown in the editor, saving them first', async () => {
    state.rows = [{ id: 'hero-id', key: 'hero', label: 'Hero', content: { headline: 'Published' }, draft_content: { headline: 'Saved draft' } }];
    await render(<PortalEditor />); await click('Hero');
    const input = [...container.querySelectorAll('input')].find(x => x.value === 'Saved draft')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Latest edit'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await click('Publish Section');
    expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'hero-id', content: expect.objectContaining({ headline: 'Latest edit' }) }));
    expect(state.publish).toHaveBeenCalledWith('hero-id');
    expect(state.save.mock.invocationCallOrder[0]).toBeLessThan(state.publish.mock.invocationCallOrder[0]);
    expect(container.textContent).toContain('Sudah Dipublish');
  });
  it('does not publish when saving the draft fails', async () => {
    state.rows = [{ id: 'hero-id', key: 'hero', label: 'Hero', content: { headline: 'Published' } }]; state.save.mockRejectedValueOnce(new Error('Database unavailable'));
    await render(<PortalEditor />); await click('Hero'); await click('Publish Section');
    expect(state.publish).not.toHaveBeenCalled(); expect(container.textContent).toContain('Database unavailable');
  });
});
describe('public forms fail honestly', () => {
  it('only acknowledges an inquiry after persistence succeeds and passes selected units', async () => {
    state.submit.mockRejectedValueOnce(new Error('Pengajuan belum tersimpan.')).mockResolvedValueOnce(undefined);
    await render(<EquityInterestModal isOpen onClose={() => {}} initialUnits={5} />);
    await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(container.textContent).toContain('Pengajuan belum tersimpan.'); expect(container.textContent).not.toContain('Pengajuan Minat Diterima');
    await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(container.textContent).toContain('Pengajuan Minat Diterima');
    expect(state.submit.mock.calls[0][0].units).toBe(5);
    expect(state.submit.mock.calls[1][0].id).toBe(state.submit.mock.calls[0][0].id);
  });
  it('does not claim a PDF was downloaded or emailed when unavailable', async () => {
    state.download.mockRejectedValueOnce(new Error('Pitchdeck resmi belum dipublikasikan.'));
    await render(<PitchdeckModal isOpen onClose={() => {}} />);
    await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(container.textContent).toContain('Pitchdeck resmi belum dipublikasikan.');
    expect(container.textContent).not.toContain('Unduhan PDF Dimulai');
    expect(container.textContent).not.toContain('dikirimkan');
  });
});
