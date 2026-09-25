import React from 'react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { StaggerHeading } from '../ui/LetterStagger';
import { ABOUT_METRICS } from '../../data/landingData';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="tentang"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08] bg-[#F5F5F3]"
    >
      <Container size="default">
        {/* Header - Eyebrow & Headline 2 Baris Rata Tengah */}
        <div className="text-center max-w-[860px] mx-auto mb-12 sm:mb-16 flex flex-col items-center">
          <Eyebrow>TENTANG KAMI</Eyebrow>
          <div className="max-w-[820px] text-center">
            <StaggerHeading
              as="h2"
              text="Menghadirkan Inovasi Teknologi dengan Integrasi Berkelanjutan"
              className="font-h2 font-bold text-[#111111] leading-[1.18] tracking-tight justify-center text-center"
              highlightWord="Berkelanjutan"
              highlightClass="text-emerald-600"
            />
          </div>
        </div>

        {/* Outline Grid System - Semua tulisan rata tengah, garis pemisah sejajar */}
        <div className="border border-black/[0.14] rounded-2xl overflow-hidden bg-white/50 backdrop-blur-xs shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 lg:divide-x divide-black/[0.12]">
            {ABOUT_METRICS.map((item, index) => (
              <div
                key={item.id}
                className={`p-6 sm:p-7 flex flex-col justify-between items-center text-center transition-colors duration-200 hover:bg-black/[0.03] group ${
                  /* Responsif border handling untuk 2-kolom pada layar tablet */
                  index % 2 === 1 ? 'sm:border-l sm:border-black/[0.12] lg:border-l-0' : ''
                } ${
                  index >= 2 ? 'sm:border-t sm:border-black/[0.12] lg:border-t-0' : ''
                }`}
              >
                {/* Top Stat Value Section - Tinggi seragam agar garis pemisah tepat sejajar dari metrik 1 hingga 5 */}
                <div className="w-full flex flex-col items-center justify-end h-[96px] sm:h-[105px] pb-3">
                  <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.16em] mb-2 text-center">
                    Metrik 0{index + 1}
                  </div>
                  <div className="font-stat-large text-[#111111] font-extrabold tracking-tight text-center group-hover:scale-105 transition-transform duration-200">
                    <AnimatedNumber
                      value={item.value}
                      prefix={item.prefix}
                      suffix={item.suffix}
                      decimals={item.decimals}
                      customDisplay={item.customDisplay}
                      useGrouping={item.useGrouping}
                    />
                  </div>
                </div>

                {/* Garis Pemisah Presisi Sejajar Horisontal */}
                <div className="w-full border-t border-black/[0.1] my-0" />

                {/* Bottom Label & Description Section - Rata Tengah */}
                <div className="w-full pt-4 flex flex-col items-center text-center flex-1 justify-start">
                  <p className="text-[13.5px] sm:text-[14px] font-bold text-[#222222] leading-snug text-center">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-[11.5px] sm:text-[12px] text-[#666666] leading-relaxed mt-1.5 text-center line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

