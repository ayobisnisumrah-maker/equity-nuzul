import React from 'react';
import { Compass, Globe, Building2, Luggage } from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { ArrowButton } from '../ui/ArrowButton';
import { StaggerHeading } from '../ui/LetterStagger';
import { ServiceItem } from '../../data/landingData';
import { PORTAL_DEFAULTS } from '../../data/portalDefaults';
import { usePortalContent } from '../../context/PortalContentContext';

interface ServicesSectionProps {
  onOpenServiceDetail: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenServiceDetail }) => {
  const {content}=usePortalContent();
  const cms:any=content('services',PORTAL_DEFAULTS.services);
  const items:ServiceItem[]=Array.isArray(cms.items)?cms.items:[];
  const getIcon = (iconName: string) => {
    const iconClass = "transition-colors duration-200 text-[#111111] group-hover:text-white";
    switch (iconName) {
      case 'umroh':
        return <Building2 size={24} className={iconClass} />;
      case 'land':
        return <Luggage size={24} className={iconClass} />;
      case 'tour':
        return <Compass size={24} className={iconClass} />;
      case 'travel':
        return <Globe size={24} className={iconClass} />;
      default:
        return <Building2 size={24} className={iconClass} />;
    }
  };

  return (
    <section
      id="layanan"
      className="py-16 sm:py-24 lg:py-28 border-t border-black/[0.08]"
    >
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Title & Description */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <Eyebrow>{cms.eyebrow}</Eyebrow>
              <div className="mb-5 sm:mb-6">
                <StaggerHeading
                  as="h2"
                  text={cms.title}
                  className="font-h2 font-bold text-[#111111] leading-[1.12] tracking-tight"
                  highlightWord={cms.highlightWord}
                  highlightClass="text-emerald-600"
                />
              </div>
              <p className="text-[16px] sm:text-[17px] text-[#555555] leading-[1.65] max-w-[360px]">
                {cms.description}
              </p>
            </div>

            {/* Bottom-aligned CTA on Left Column */}
            <div className="pt-8 sm:pt-10 mt-auto">
              <ArrowButton
                variant="link"
                onClick={() => items[0] && onOpenServiceDetail(items[0])}
                id="services-cta-other"
              >
                {cms.moreCta}
              </ArrowButton>
            </div>
          </div>

          {/* Right Column: 2x2 Services Grid */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {items.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onOpenServiceDetail(service)}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-start min-h-[180px] sm:min-h-[200px] hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group outline-none"
                >
                  {/* Minimal Icon with soft background that turns green on card hover */}
                  <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] flex items-center justify-center border border-black/[0.06] mb-5 group-hover:scale-105 group-hover:bg-[#10b981] group-hover:border-[#10b981] group-hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-300 shrink-0">
                    {getIcon(service.iconName)}
                  </div>

                  {/* Service Tag / Title & Description */}
                  <div>
                    <h3 className="text-[18px] sm:text-[19px] font-bold text-[#111111] mb-2 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[14px] sm:text-[14.5px] text-[#555555] leading-relaxed">
                      {service.description || service.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
