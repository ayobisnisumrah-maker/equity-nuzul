import { usePortalSection } from '../../context/PortalContentContext';
import React from 'react';
import { Phone, FileDown, ArrowRight } from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { StaggerHeading } from '../ui/LetterStagger';
import { ArrowButton } from '../ui/ArrowButton';
import { IMAGES } from '../../data/landingData';

interface QuickActionSectionProps {
  onOpenInterest: () => void;
  onOpenPitchdeck: () => void;
}

export const QuickActionSection: React.FC<QuickActionSectionProps> = ({
  onOpenInterest,
  onOpenPitchdeck,
}) => {
  const field = usePortalSection('quick_action');
  return (
    <section
      id="kontak"
      className="bg-[#121317] text-white py-16 sm:py-24 lg:py-28"
    >
      <Container size="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
          {/* Column 1: Left Headline & Bottom-Aligned CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Eyebrow variant="dark">QUICK ACTION</Eyebrow>
              <div className="mb-4">
                <StaggerHeading
                  as="h2"
                  text="Kenali. Pelajari. Tentukan Langkah Anda."
                  className="font-h2 font-bold text-white leading-[1.08] tracking-tight"
                  highlightWord="Langkah"
                  highlightClass="text-emerald-400"
                />
              </div>
              <p className="text-[15px] sm:text-[16px] text-white/65 leading-relaxed max-w-[320px]">
                Tim Investor Relations kami siap memberikan pendampingan personal bagi calon mitra dan investor strategis.
              </p>
            </div>

            {/* Bottom-aligned CTA rata bawah sejajar dengan frame Unduh Pitchdeck */}
            <div className="pt-8 sm:pt-10 mt-auto pb-1">
              <ArrowButton
                variant="dark-link"
                onClick={onOpenInterest}
                id="quick-action-cta-discuss"
                className="text-white hover:text-emerald-400 transition-colors"
              >
                Diskusikan Peluang
              </ArrowButton>
            </div>
          </div>

          {/* Column 2: 2 Action Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Action Card 1: Hubungi Tim WhatsApp / Call */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Nuzultrip%20Equity,%20saya%20tertarik%20mengenal%20penawaran%20equity%20lebih%20lanjut"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1e1f20]/60 hover:bg-[#1e1f20] rounded-2xl p-6 border border-white/10 transition-all duration-300 flex flex-col justify-between flex-1 group cursor-pointer outline-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#282a2c] border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.35)] hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all duration-300">
                  <Phone size={18} className="text-white transition-colors duration-200" />
                </div>
                <ArrowRight size={16} className="text-white/60 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all duration-200" />
              </div>
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                  Investor Relations
                </span>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-white mt-1">
                  Hubungi Tim
                </h3>
                <p className="text-[14px] text-white/70 mt-1 font-mono">
                  +62 812-3456-7890
                </p>
              </div>
            </a>

            {/* Action Card 2: Unduh Pitchdeck */}
            <div
              onClick={onOpenPitchdeck}
              className="bg-[#1e1f20]/60 hover:bg-[#1e1f20] rounded-2xl p-6 border border-white/10 transition-all duration-300 flex flex-col justify-between flex-1 group cursor-pointer outline-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#282a2c] border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.35)] hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all duration-300">
                  <FileDown size={18} className="text-white transition-colors duration-200" />
                </div>
                <ArrowRight size={16} className="text-white/60 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all duration-200" />
              </div>
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">
                  Dokumen Resmi
                </span>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-white mt-1">
                  Unduh Pitchdeck
                </h3>
                <p className="text-[14px] text-white/70 mt-1">
                  Pelajari ringkasan model bisnis & proyeksi
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Visual Invitation Card with CTA */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-white/15 flex flex-col justify-between p-7 text-white group">
              <img
                src={field('imageUrl', IMAGES.quickActionBg)}
                alt="Ekosistem Nuzultrip"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/70" />

              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {field('eyebrow', 'Langkah Awal Kemitraan')}
                </span>
                <h3 className="text-[22px] sm:text-[24px] font-bold text-white mt-2 leading-[1.2]">
                  {field('headline', 'Siap Mengenal Nuzultrip Lebih Jauh?')}
                </h3>
                <p className="text-[14px] text-white/75 mt-2 leading-relaxed">
                  {field('description', 'Dapatkan konsultasi eksklusif mengenai struktur kepemilikan dan skema bagi hasil.')}
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  type="button"
                  onClick={onOpenInterest}
                  className="w-full py-3.5 px-5 rounded-xl bg-white text-[#090909] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white border border-transparent hover:border-emerald-500/60 active:scale-98 transition-all duration-300 shadow-md hover:shadow-[0_6px_24px_rgba(16,185,129,0.35)] group cursor-pointer"
                >
                  <span>{field('primaryCta', 'Ajukan Minat Equity')}</span>
                  <ArrowRight size={16} className="text-current group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
