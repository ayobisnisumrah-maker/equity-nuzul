import { usePortalSection } from '../../context/PortalContentContext';
import React, { useState } from 'react';
import { Megaphone, X, ArrowRight, ExternalLink } from 'lucide-react';

interface FloatingAnnouncementProps {
  isVisible: boolean;
  onOpenDetail?: () => void;
}

export const FloatingAnnouncement: React.FC<FloatingAnnouncementProps> = ({
  isVisible,
  onOpenDetail,
}) => {
  const field = usePortalSection('header');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      {/* Popover Announcement Card */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-[310px] sm:w-[350px] bg-[#1e1f20]/95 backdrop-blur-xl text-white border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-bottom-3 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Megaphone size={12} className="animate-pulse" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Pengumuman Resmi
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup Pengumuman"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-[13px] text-neutral-200 leading-relaxed mb-4">
            <strong className="text-white font-semibold">{field('announcementTitle', 'RUPS Luar Biasa Kuartal 3')}</strong>{' '}{field('announcementText', 'dijadwalkan pada 20 Oktober 2026. Laporan Triwulan II telah terbit.')}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.08]">
            <span className="text-[11px] text-neutral-400">
              {field('announcementBadge', 'Pengumuman')}
            </span>
            {onOpenDetail && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDetail();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-black text-[12px] font-semibold transition-all duration-200"
              >
                <span>Detail</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Button with Notification Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white hover:bg-neutral-50 text-[#111111] border border-neutral-300 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-neutral-400 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
          isOpen ? 'ring-2 ring-neutral-800 bg-neutral-100' : ''
        }`}
        aria-label="Buka Pengumuman RUPS"
        title="Pengumuman Resmi Nuzultrip"
      >
        <Megaphone
          size={20}
          className="text-[#111111] transition-transform duration-200 group-hover:scale-110"
        />

        {/* Pulsing Notification Dot (Tetap Hijau) */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-sm" />
        </span>
      </button>
    </div>
  );
};
