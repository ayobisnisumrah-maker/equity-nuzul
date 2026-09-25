import React, { useState, useEffect, useRef } from 'react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { ArrowButton } from '../ui/ArrowButton';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { StaggerHeading } from '../ui/LetterStagger';
import { COMPANY_METRICS, IMAGES } from '../../data/landingData';

interface CompanySectionProps {
  onOpenDetail: () => void;
}

export const CompanySection: React.FC<CompanySectionProps> = ({ onOpenDetail }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Preload all 5 images on mount
  useEffect(() => {
    IMAGES.companySlices.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Automatic slideshow for mobile or when not hovered
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % IMAGES.companySlices.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Mouse move handler for 5 horizontal segment divisions
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, x / width));

    // Divide 0..1 into 5 parts
    const index = Math.min(Math.floor(ratio * 5), 4);
    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  const handleMouseLeave = () => {
    // Keep currently viewed index so user can comfortably read the corresponding metric
  };

  return (
    <section
      id="perusahaan"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08]"
    >
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
          {/* Column 1: Left Description & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <Eyebrow>PERUSAHAAN</Eyebrow>
              <div className="mb-5 sm:mb-6">
                <StaggerHeading
                  as="h2"
                  text="Perjalanan Muslim yang Bertumbuh"
                  className="font-h2 font-bold text-[#111111] leading-[1.08] tracking-tight"
                  highlightWord="Bertumbuh"
                  highlightClass="text-emerald-600"
                />
              </div>
              <p className="text-[16px] sm:text-[17px] text-[#555555] leading-[1.65] max-w-[360px]">
                Menghadirkan layanan perjalanan ibadah yang bermakna melalui layanan,
                jaringan, dan teknologi.
              </p>
            </div>

            {/* Bottom-aligned CTA link */}
            <div className="pt-8 sm:pt-10 mt-auto">
              <ArrowButton
                variant="link"
                onClick={onOpenDetail}
                id="company-cta-detail"
              >
                Lebih Detail Penawaran
              </ArrowButton>
            </div>
          </div>

          {/* Column 2: Center Interactive 5-Slice Image */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden border border-black/[0.1] bg-[#E8E8E4] shadow-sm cursor-crosshair group select-none"
            >
              {IMAGES.companySlices.map((url, idx) => (
                <div
                  key={url}
                  className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                    idx === activeImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Galeri perjalanan Nuzultrip #${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              ))}

              {/* Clean pure visual image card without text overlay */}
              {/* Indicator bar showing active 1 of 5 */}
              <div className="absolute bottom-4 inset-x-6 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: 5 Poin Metrik & Kredensial Disusun Vertikal */}
          <div className="lg:col-span-4 flex flex-col justify-between py-1 h-full">
            <div className="flex flex-col justify-between h-full gap-y-3 sm:gap-y-3.5">
              {COMPANY_METRICS.map((item, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`pb-2.5 sm:pb-3 border-b transition-all duration-200 cursor-pointer flex flex-col group ${
                      isActive
                        ? 'border-black/50 pl-2'
                        : 'border-black/[0.08] hover:border-black/30 hover:pl-1'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-none transition-colors duration-200 ${
                          isActive ? 'text-[#000000]' : 'text-[#111111] group-hover:text-black'
                        }`}
                      >
                        <AnimatedNumber
                          value={item.value}
                          prefix={item.prefix}
                          suffix={item.suffix}
                          decimals={item.decimals}
                        />
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse" />
                      )}
                    </div>
                    <p
                      className={`text-[13px] sm:text-[14px] font-medium leading-snug mt-1.5 transition-colors duration-200 ${
                        isActive ? 'text-[#111111]' : 'text-[#666666] group-hover:text-[#333333]'
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}

              {/* Point 5: Headline Amanah dengan deskripsi Terverifikasi PPIU Kemenag */}
              <div
                onMouseEnter={() => setActiveImageIndex(4)}
                onClick={() => setActiveImageIndex(4)}
                className={`pb-2.5 sm:pb-3 border-b transition-all duration-200 cursor-pointer flex flex-col group ${
                  activeImageIndex === 4
                    ? 'border-black/50 pl-2'
                    : 'border-black/[0.08] hover:border-black/30 hover:pl-1'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-none transition-colors duration-200 ${
                      activeImageIndex === 4
                        ? 'text-[#000000]'
                        : 'text-[#111111] group-hover:text-black'
                    }`}
                  >
                    Amanah
                  </div>
                  {activeImageIndex === 4 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse" />
                  )}
                </div>
                <p
                  className={`text-[13px] sm:text-[14px] font-medium leading-snug mt-1.5 transition-colors duration-200 ${
                    activeImageIndex === 4
                      ? 'text-[#111111]'
                      : 'text-[#666666] group-hover:text-[#333333]'
                  }`}
                >
                  Terverifikasi PPIU Kemenag
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
