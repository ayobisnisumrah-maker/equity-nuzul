import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, ChevronDown } from 'lucide-react';
import { HeroParticles } from '../hero/HeroParticles';
import { StaggerText } from '../ui/LetterStagger';
import { usePortalContent } from '../../context/PortalContentContext';

interface HeroSectionProps {
  onOpenInterest: () => void;
  onOpenPitchdeck?: () => void;
}

const HIGHLIGHT_BADGES = [
  '40% Alokasi Equity',
  '50 Unit Terbatas',
  'Rp 100 Juta / Unit',
  'Dividen Berkala',
  'Jaringan 4 Negara',
  '1000+ Jamaah Tahunan',
  'Izin PPIU Kemenag Resmi',
  'Kontrak Hotel Langsung Makkah-Madinah',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenInterest,
  onOpenPitchdeck,
}) => {
  const { content } = usePortalContent();
  const cms = content('hero', {} as Record<string, unknown>);
  const eyebrow = typeof cms.eyebrow === 'string' ? cms.eyebrow : 'NUZULTRIP EQUITY';
  const headline = typeof cms.headline === 'string' ? cms.headline : 'Berkembang Dalam Ekosistem Muslim';
  const headlineHighlight = typeof cms.headlineHighlight === 'string' ? cms.headlineHighlight : 'Yang Terintegrasi';
  const description = typeof cms.description === 'string' ? cms.description : 'Nuzultrip membangun ekosistem perjalanan Muslim melalui layanan, jaringan, dan teknologi yang terintegrasi untuk mendukung pertumbuhan jangka panjang.';
  const primaryCta = typeof cms.primaryCta === 'string' ? cms.primaryCta : 'Ajukan Minat Equity';
  const secondaryCta = typeof cms.secondaryCta === 'string' ? cms.secondaryCta : 'Unduh Pitchdeck 2025';
  const highlightsLabel = typeof cms.highlightsLabel === 'string' ? cms.highlightsLabel : 'SOROTAN EKOSISTEM NUZULTRIP';
  const highlights = Array.isArray(cms.highlights) && cms.highlights.every((v) => typeof v === 'string') ? cms.highlights as string[] : HIGHLIGHT_BADGES;
  const [isEntranceVisible, setIsEntranceVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Staggered entrance animation trigger on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntranceVisible(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Lightweight scroll listener: idle when user scrolls past hero section
  useEffect(() => {
    let ticking = false;
    let lastY = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      // When scrolled well past the hero (> 600px), stop triggering re-renders
      if (currentY > 600 && lastY > 600) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const clampedY = Math.min(600, window.scrollY);
          setScrollY(clampedY);
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const entranceClass = isEntranceVisible ? 'entrance visible' : 'entrance';

  // Minimalist kinetic scroll animation: content subtly ascends and scales down with depth
  const scrollProgress = Math.min(1.2, scrollY / 480);
  const parallaxContent = {
    transform: `translate3d(0, ${-scrollY * 0.22}px, 0) scale(${Math.max(0.92, 1 - scrollProgress * 0.08)})`,
    opacity: Math.max(0, 1 - scrollProgress * 1.05),
  };

  return (
    <section
      id="hero"
      className="hero relative overflow-hidden bg-[#131314] text-white min-h-screen flex flex-col justify-between"
    >
      {/* 1. Subtle Floating Micro-Particles Background */}
      <HeroParticles scrollY={scrollY} />

      {/* 2. Hero Content Container */}
      <div className="hero-content relative z-[2] flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-32 sm:pt-36 md:pt-40 pb-12">
        <div className="hero-spacer" />

        {/* Minimalist Floating Pill: NUZULTRIP EQUITY */}
        <div
          className={`${entranceClass} stagger-1 mb-5 sm:mb-6`}
          style={parallaxContent}
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.14)]">
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-emerald-300/90">
              {eyebrow}
            </span>
          </div>
        </div>

        {/* Display Headline with Kinetic Letter Stagger Model */}
        <div
          className={`${entranceClass} stagger-2 hero-heading max-w-4xl`}
          style={parallaxContent}
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] leading-[1.12] text-[#f4f4f8]">
            {headline}{' '}
            <span
              className="inline-block"
              style={{
                color: '#34d399',
                textShadow:
                  '0 0 35px rgba(16, 185, 129, 0.45), 0 0 70px rgba(16, 185, 129, 0.2)',
              }}
            >
              {headlineHighlight}
            </span>
          </h1>
        </div>

        {/* Subtitle / Deskripsi Baru Sesuai Permintaan */}
        <div
          className={`${entranceClass} stagger-3 mt-5 sm:mt-6 mb-8 sm:mb-9`}
          style={parallaxContent}
        >
          <p className="hero-subtitle text-[#9499ab] text-sm sm:text-base md:text-lg max-w-3xl lg:max-w-[860px] mx-auto leading-[1.7] font-normal">
            {description}
          </p>
        </div>

        {/* Primary & Secondary CTA Buttons with Kinetic Letter-Stagger Interaction */}
        <div
          className={`${entranceClass} stagger-4 hero-buttons flex flex-wrap items-center justify-center gap-3.5 sm:gap-4`}
          style={parallaxContent}
        >
          {/* Primary CTA (Letter Stagger on hover) */}
          <button
            id="hero-cta-primary"
            onClick={onOpenInterest}
            className="group relative px-8 py-3.5 sm:py-4 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              boxShadow:
                '0 4px 25px rgba(16, 185, 129, 0.45), 0 10px 40px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span className="relative z-10 font-semibold tracking-wide">
              <StaggerText text={primaryCta} />
            </span>
            <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
              }}
            />
          </button>

          {/* Secondary CTA (Letter Stagger on hover) */}
          <button
            id="hero-cta-pitchdeck"
            onClick={onOpenPitchdeck || onOpenInterest}
            className="group px-7 py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-base text-[#f0f0f5] bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.14] hover:border-white/[0.28] backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="tracking-wide">
              <StaggerText text={secondaryCta} />
            </span>
          </button>
        </div>

        {/* 3. Sorotan Ekosistem & Frame Berjalan dengan Spasi Height yang Jelas */}
        <div
          className={`${entranceClass} stagger-5 hero-partners w-full max-w-4xl mx-auto mt-14 sm:mt-20 pt-4`}
        >
          {/* Label Row Sorotan Lengkap */}
          <div className="hero-partners-label-row flex items-center justify-center gap-3.5 w-full max-w-md mx-auto mb-6 sm:mb-8">
            <span
              className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              aria-hidden="true"
            />
            <span className="text-[10.5px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-emerald-400/90 whitespace-nowrap">
              {highlightsLabel}
            </span>
            <span
              className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Frame Berjalan Dibawahnya dengan Spasi Height yang Lega */}
          <div className="hero-partners-track w-full overflow-hidden py-2 px-1">
            <div className="animate-marquee-slow flex items-center gap-2.5">
              {[...highlights, ...highlights].map((badge, idx) => (
                <div
                  key={idx}
                  className="hero-chip group/chip px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.09] hover:border-emerald-500/30 transition-all duration-200 flex items-center gap-2 shrink-0 backdrop-blur-sm"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: '#10b981',
                      boxShadow:
                        '0 0 6px rgba(16, 185, 129, 0.9), 0 0 12px rgba(16, 185, 129, 0.4)',
                    }}
                  />
                  <span className="text-xs sm:text-[13px] text-[#e0e2ec] font-medium tracking-wide">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Minimalist Scroll Cue Indicator */}
        <div
          className="flex flex-col items-center gap-1.5 pt-7 transition-opacity duration-300 pointer-events-none select-none"
          style={{
            opacity: Math.max(0, 1 - scrollY / 80),
          }}
          aria-hidden="true"
        >
          <span className="text-[9.5px] tracking-[0.22em] uppercase font-bold text-white/35">
            Scroll Eksplorasi
          </span>
          <ChevronDown size={14} className="text-emerald-400/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
