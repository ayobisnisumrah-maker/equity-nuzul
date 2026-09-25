import React from 'react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { ArrowButton } from '../ui/ArrowButton';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { StaggerHeading } from '../ui/LetterStagger';
import { EQUITY_METRICS } from '../../data/landingData';
import { EquityCalculator } from './EquityCalculator';
import { usePortalContent } from '../../context/PortalContentContext';

interface EquitySectionProps {
  onOpenInterest: () => void;
  onOpenDetail: () => void;
}

export const EquitySection: React.FC<EquitySectionProps> = ({
  onOpenInterest,
  onOpenDetail,
}) => {
  const { content } = usePortalContent();
  const cms = content('equity', {} as Record<string, unknown>);
  const eyebrow = typeof cms.eyebrow === 'string' ? cms.eyebrow : 'PELUANG EQUITY';
  const headline = typeof cms.headline === 'string' ? cms.headline : 'Kesempatan Bertumbuh Bersama';
  const description = typeof cms.description === 'string' ? cms.description : 'Jadilah bagian dari perjalanan besar Nuzultrip dengan kepemilikan yang jelas, transparan, dan terstruktur.';
  const detailCta = typeof cms.detailCta === 'string' ? cms.detailCta : 'Lebih Detail Penawaran';
  const metrics = Array.isArray(cms.metricsJson) && cms.metricsJson.length ? cms.metricsJson as typeof EQUITY_METRICS : EQUITY_METRICS;
  return (
    <section
      id="peluang"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08]"
    >
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
          {/* Column 1: Left Editorial Content */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <Eyebrow>{eyebrow}</Eyebrow>
              <div className="mb-5 sm:mb-6">
                <StaggerHeading
                  as="h2"
                  text={headline}
                  className="font-h2 font-bold text-[#111111] leading-[1.08] tracking-tight"
                  highlightWord="Bersama"
                  highlightClass="text-emerald-600"
                />
              </div>
              <p className="text-[16px] sm:text-[17px] text-[#555555] leading-[1.65] max-w-[360px]">
                {description}
              </p>
            </div>

            {/* Bottom-aligned CTA link */}
            <div className="pt-8 sm:pt-10 mt-auto">
              <ArrowButton
                variant="link"
                onClick={onOpenDetail}
                id="equity-cta-detail"
              >
                {detailCta}
              </ArrowButton>
            </div>
          </div>

          {/* Column 2: 6 Metrics Point - Dibatasi Garis Atas & Garis Bawah Rata Frame Simulasi */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-[420px] sm:min-h-[480px] border-t border-b border-black/[0.08] divide-y divide-black/[0.08]">
            {metrics.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 flex-1 py-2 sm:py-2.5 group"
              >
                <div className="text-[23px] sm:text-[25px] lg:text-[27px] font-extrabold text-[#111111] tracking-tight leading-none shrink-0 group-hover:translate-x-0.5 transition-transform duration-200">
                  <AnimatedNumber
                    value={item.value}
                    prefix={item.prefix}
                    suffix={item.suffix}
                    decimals={item.decimals}
                    customDisplay={item.customDisplay}
                  />
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-[#666666] font-medium text-right leading-snug max-w-[195px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Column 3: Frame Simulasi Interaktif Bagi Hasil di Kanan */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <EquityCalculator onOpenInterest={onOpenInterest} />
          </div>
        </div>
      </Container>
    </section>
  );
};
