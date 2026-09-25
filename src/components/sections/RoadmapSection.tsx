import React, { useRef, useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { StaggerHeading } from '../ui/LetterStagger';

interface RoadmapPhase {
  step: string;
  phaseNumber: number;
  period: string;
  title: string;
  status: 'completed' | 'active' | 'upcoming' | 'development';
  statusLabel: string;
  summary: string;
  highlights: string[];
  kpi?: { label: string; value: string };
}

const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    step: '01',
    phaseNumber: 1,
    period: 'Jan – Jun 2024',
    title: 'Fondasi & Legalitas PPIU Resmi',
    status: 'completed',
    statusLabel: 'Terlaksana',
    summary:
      'Pendirian legalitas PT Nuzul Tour & Travel, perizinan resmi PPIU Kemenag RI, dan standardisasi SOP operasional jamaah.',
    highlights: [
      'Izin resmi PPIU Kemenag RI',
      'Standardisasi SOP handling bandara & hotel',
      'Kemitraan awal hotel Makkah & Madinah',
    ],
    kpi: { label: 'Kepatuhan Hukum', value: '100% Terverifikasi' },
  },
  {
    step: '02',
    phaseNumber: 2,
    period: 'Jul – Des 2024',
    title: 'Penguatan Rantai Pasok & Konsorsium',
    status: 'completed',
    statusLabel: 'Terlaksana',
    summary:
      'Pengamanan blok seat reguler maskapai Garuda Indonesia & Saudia Airlines, serta jaringan konsorsium dengan 15+ travel daerah.',
    highlights: [
      'Blok seat maskapai terpercaya',
      'Tim muthowif tersertifikasi di Saudi',
      'Konsorsium 15+ biro travel daerah',
    ],
    kpi: { label: 'Jamaah Terlayani', value: '1.200+ Jamaah' },
  },
  {
    step: '03',
    phaseNumber: 3,
    period: 'Jan – Des 2025',
    title: 'Transformasi Platform Digital & Halal Tour',
    status: 'development',
    statusLabel: 'Pengembangan',
    summary:
      'Automasi portal investor real-time, peluncuran aplikasi jamaah dengan pelacak bagasi, serta perluasan rute Halal Tour mancanegara.',
    highlights: [
      'Portal investor dividen otomatis',
      'Aplikasi mobile & smart baggage tracker',
      'Ekspansi rute Halal Tour global',
    ],
    kpi: { label: 'Pencapaian Jamaah', value: '4.500+ Jamaah' },
  },
  {
    step: '04',
    phaseNumber: 4,
    period: 'Jan – Des 2026',
    title: 'Peluang Equity 40% & Platform B2B',
    status: 'active',
    statusLabel: 'Proses',
    summary:
      'Pembukaan 50 unit equity strategis bagi investor dengan bagi hasil bulanan, serta peluncuran platform live booking B2B untuk mitra agen.',
    highlights: [
      'Penawaran 50 unit equity (Rp.100 Juta/unit)',
      'Skema bagi hasil bulanan transparan',
      'Platform booking B2B inventori live',
    ],
    kpi: { label: 'Target Equity', value: 'Rp.5 Miliar' },
  },
  {
    step: '05',
    phaseNumber: 5,
    period: '2027 – 2028',
    title: 'Holding Ekosistem & Tata Kelola IPO',
    status: 'upcoming',
    statusLabel: 'Mendatang',
    summary:
      'Manajemen pengelolaan hotel di Tanah Suci, integrasi rantai pasok katering, penerapan standar GCG, dan persiapan go-public (IPO).',
    highlights: [
      'Manajemen long-lease hotel di Saudi',
      'Audit akuntan publik independen',
      'Penyusunan tata kelola siap IPO',
    ],
    kpi: { label: 'Target Valuasi', value: 'Rp.50+ Miliar' },
  },
];

export const RoadmapSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0); // Default to first phase (Fase 01)
  const scrollRef = useRef<HTMLDivElement>(null);

  // Touch swipe gesture refs
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwipingTouch = useRef<boolean>(false);

  // Pointer/mouse drag refs for tablet hybrid & mouse testing
  const isMouseDown = useRef<boolean>(false);
  const mouseStartX = useRef<number>(0);
  const mouseScrollStart = useRef<number>(0);
  const hasMouseMoved = useRef<boolean>(false);

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll('.roadmap-card');
    const targetCard = cards[index] as HTMLElement;
    if (targetCard) {
      const isMobileOrTablet = window.innerWidth < 1024;
      // On mobile and tablet, align card cleanly with container padding
      const targetLeft = isMobileOrTablet
        ? targetCard.offsetLeft - 16
        : targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;

      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior,
      });
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    // Ensure horizontal carousel starts at first phase (Fase 01)
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  // Sync active index when user scrolls on touch or trackpad
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const isMobile = window.innerWidth < 640;
    const scrollFocus = isMobile
      ? container.scrollLeft + 60
      : container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDiff = Infinity;

    const cards = container.querySelectorAll('.roadmap-card');
    cards.forEach((child, idx) => {
      const el = child as HTMLElement;
      const childPoint = isMobile
        ? el.offsetLeft
        : el.offsetLeft + el.clientWidth / 2;
      const diff = Math.abs(scrollFocus - childPoint);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  // Touch Swipe Gesture Handlers (Mobile & Tablet)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingTouch.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipingTouch.current) return;
    isSwipingTouch.current = false;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Detect horizontal swipe intent with minimum 35px threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX > 0) {
        // Swiped left -> advance to next phase
        if (activeIndex < ROADMAP_PHASES.length - 1) {
          scrollToIndex(activeIndex + 1);
        }
      } else {
        // Swiped right -> go to previous phase
        if (activeIndex > 0) {
          scrollToIndex(activeIndex - 1);
        }
      }
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    if (scrollRef.current) {
      mouseScrollStart.current = scrollRef.current.scrollLeft;
    }
    hasMouseMoved.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 6) {
      hasMouseMoved.current = true;
    }
    scrollRef.current.scrollLeft = mouseScrollStart.current - deltaX;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    if (hasMouseMoved.current) {
      const deltaX = e.clientX - mouseStartX.current;
      if (deltaX < -35 && activeIndex < ROADMAP_PHASES.length - 1) {
        scrollToIndex(activeIndex + 1);
      } else if (deltaX > 35 && activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      } else {
        scrollToIndex(activeIndex);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      scrollToIndex(activeIndex);
    }
  };

  return (
    <section
      id="roadmap"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08] bg-[#FAFAF8] overflow-hidden"
    >
      <Container size="default">
        {/* Header Compact */}
        <div className="mb-8 sm:mb-10">
          <div>
            <Eyebrow>ROADMAP PERUSAHAAN</Eyebrow>
            <StaggerHeading
              as="h2"
              text="Peta Jalan Pertumbuhan Nuzultrip"
              className="font-h2 font-bold text-[#111111] leading-[1.12] tracking-tight"
              highlightWord="Nuzultrip"
              highlightClass="text-emerald-600"
            />
            <p className="text-[14.5px] sm:text-[15.5px] text-[#666666] mt-2 max-w-xl">
              Tahapan strategis pengembangan bisnis, platform teknologi, dan tata kelola investasi jangka panjang.
            </p>
          </div>
        </div>

        {/* Minimalist Horizontal Step Selector Bar */}
        <div className="hidden sm:grid grid-cols-5 gap-2 mb-6 p-1.5 bg-white rounded-xl border border-black/[0.08] shadow-xs">
          {ROADMAP_PHASES.map((phase, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={phase.step}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={`py-2 px-3 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-center ${
                  isCurrent
                    ? 'bg-[#E5E7EB] text-[#111111] shadow-xs border border-black/10'
                    : 'hover:bg-black/[0.03] text-[#666666] border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={isCurrent ? 'text-[#111111]' : ''}>FASE {phase.step}</span>
                  {phase.status === 'completed' && (
                    <span className="text-emerald-600 font-bold">✓</span>
                  )}
                  {phase.status === 'development' && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {phase.status === 'active' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {phase.status === 'upcoming' && (
                    <span className={isCurrent ? 'text-black/40' : 'text-slate-400'}>○</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span
                    className={`text-[12px] font-semibold truncate ${
                      isCurrent ? 'text-[#111111]' : 'text-[#333333]'
                    }`}
                  >
                    {phase.period}
                  </span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                      phase.status === 'completed'
                        ? 'text-emerald-700 bg-emerald-50'
                        : phase.status === 'development'
                        ? 'text-red-700 bg-red-50 font-bold'
                        : phase.status === 'active'
                        ? 'text-amber-800 bg-amber-50 font-bold'
                        : isCurrent
                        ? 'text-black/70 bg-black/5'
                        : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {phase.statusLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile & Tablet Swipe Hint Bar */}
        <div className="flex sm:hidden items-center justify-between mb-3 text-[12px] text-[#666666]">
          <span className="font-semibold text-[#111111] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Fase {ROADMAP_PHASES[activeIndex].step} dari 05
          </span>
          <span className="text-[11.5px] text-[#777777] flex items-center gap-1">
            <span>Geser card ke samping</span>
            <ArrowRight size={13} className="text-emerald-600 animate-pulse" />
          </span>
        </div>

        {/* Horizontal Slide Carousel Track */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x overscroll-x-contain select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ROADMAP_PHASES.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={item.step}
                onClick={() => scrollToIndex(index)}
                className={`roadmap-card shrink-0 w-[84vw] max-w-[310px] sm:w-[320px] lg:w-[340px] snap-start rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer outline-none ${
                  isSelected
                    ? item.status === 'development'
                      ? 'bg-white border-red-500 shadow-md ring-2 ring-red-400/25'
                      : item.status === 'active'
                      ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : item.status === 'completed'
                      ? 'bg-white border-emerald-400/80 shadow-md ring-2 ring-emerald-400/15'
                      : 'bg-white border-black/40 shadow-md ring-1 ring-black/10'
                    : 'bg-white/80 border-black/[0.08] hover:bg-white'
                }`}
              >
                {/* Card Top: Step number & Status badge */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[12px] font-extrabold text-[#111111] tracking-wider uppercase">
                      FASE {item.step}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : item.status === 'development'
                          ? 'bg-red-50 border-red-200 text-red-700 font-bold shadow-xs'
                          : item.status === 'active'
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600 font-medium'
                      }`}
                    >
                      {item.status === 'completed' && (
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      )}
                      {item.status === 'development' && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                        </span>
                      )}
                      {item.status === 'active' && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                      )}
                      {item.status === 'upcoming' && (
                        <Clock size={12} className="text-slate-400 shrink-0" />
                      )}
                      {item.statusLabel}
                    </span>
                  </div>

                  <div className="text-[12px] font-semibold text-[#888888] mb-1.5">
                    {item.period}
                  </div>

                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#111111] leading-snug tracking-tight mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-[13.5px] text-[#555555] leading-relaxed mb-4">
                    {item.summary}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 pt-3 border-t border-black/[0.06]">
                    {item.highlights.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-[12.5px] text-[#444444]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111111]/40 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Key Metric / Milestone outcome */}
                {item.kpi && (
                  <div className="mt-5 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                      {item.kpi.label}
                    </span>
                    <span className="text-[12.5px] font-bold text-[#111111]">
                      {item.kpi.value}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {/* Spacer for smooth end-of-carousel snap on mobile */}
          <div className="shrink-0 w-2 sm:hidden pointer-events-none" aria-hidden="true" />
        </div>

        {/* Mobile & Tablet Interactive Navigation & Indicators */}
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-black/[0.06] lg:hidden">
          {/* Step Dots Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {ROADMAP_PHASES.map((phase, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={phase.step}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'w-7 sm:w-8 h-2.5 bg-emerald-500 shadow-sm'
                      : 'w-2.5 h-2.5 bg-black/15 hover:bg-black/30'
                  }`}
                  aria-label={`Lihat Fase ${phase.step}`}
                />
              );
            })}
          </div>

          {/* Prev / Next Swipe Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                activeIndex === 0
                  ? 'text-black/25 border-black/5 bg-black/[0.02] cursor-not-allowed'
                  : 'text-[#111111] border-black/15 bg-white hover:bg-black/5 active:scale-95 shadow-xs cursor-pointer'
              }`}
              aria-label="Fase sebelumnya"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToIndex(Math.min(ROADMAP_PHASES.length - 1, activeIndex + 1))}
              disabled={activeIndex === ROADMAP_PHASES.length - 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                activeIndex === ROADMAP_PHASES.length - 1
                  ? 'text-black/25 border-black/5 bg-black/[0.02] cursor-not-allowed'
                  : 'text-white border-emerald-600 bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs cursor-pointer'
              }`}
              aria-label="Fase selanjutnya"
            >
              <span>Fase {ROADMAP_PHASES[Math.min(ROADMAP_PHASES.length - 1, activeIndex + 1)].step}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};
