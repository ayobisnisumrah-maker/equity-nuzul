import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { StaggerText, StaggerHeading } from '../ui/LetterStagger';
import { INVESTOR_INFO_LIST, InvestorInfoItem } from '../../data/landingData';
import { usePortalContent } from '../../context/PortalContentContext';

interface InvestorInformationSectionProps {
  onSelectItem: (item: InvestorInfoItem) => void;
}

export const InvestorInformationSection: React.FC<InvestorInformationSectionProps> = ({
  onSelectItem,
}) => {
  const { content } = usePortalContent();
  const cms = content('investor', {} as Record<string, unknown>);
  const eyebrow = typeof cms.eyebrow === 'string' ? cms.eyebrow : 'INFORMASI INVESTOR';
  const headline = typeof cms.headline === 'string' ? cms.headline : 'Informasi penting dalam satu tempat';
  const moreLabel = typeof cms.moreLabel === 'string' ? cms.moreLabel : 'Selengkapnya';
  const items = Array.isArray(cms.itemsJson) && cms.itemsJson.length ? cms.itemsJson as InvestorInfoItem[] : INVESTOR_INFO_LIST;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const activeId = hoveredCard || items[0].id;

  return (
    <section
      id="informasi"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08]"
    >
      <Container size="default">
        {/* Section Header */}
        <div className="max-w-[720px] mb-12 sm:mb-16">
          <Eyebrow>{eyebrow}</Eyebrow>
          <StaggerHeading
            as="h2"
            text={headline}
            className="font-h2 font-bold text-[#111111] leading-[1.08] tracking-tight"
            highlightWord="tempat"
            highlightClass="text-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Image that dynamically updates on card hover (gambar saja tanpa text atau keterangan) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative w-full h-full min-h-[380px] sm:min-h-[500px] rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm bg-[#E8E8E4]">
              {items.map((item) => (
                <img
                  key={item.id}
                  src={item.imageUrl}
                  alt={item.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                    item.id === activeId
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  }`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* Right Column: 6 Investor Information Cards in 2 columns x 3 rows */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const isItemActive = item.id === activeId;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onClick={() => onSelectItem(item)}
                  className={`bg-white rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isItemActive
                      ? 'shadow-lg scale-[1.01]'
                      : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md'
                  }`}
                >
                  <div>
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-[#111111] mb-2 tracking-tight group-hover:text-black">
                      {item.title}
                    </h3>
                    <p className="text-[13.5px] sm:text-[14px] text-[#666666] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-[13px] font-semibold text-[#111111]">
                    <StaggerText text={moreLabel} />
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
