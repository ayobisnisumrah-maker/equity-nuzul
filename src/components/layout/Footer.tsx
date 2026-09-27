import React from 'react';
import { ArrowRight, Instagram, Facebook, Disc as TikTokIcon } from 'lucide-react';
import { Container } from './Container';
import { NuzultripLogo } from '../ui/NuzultripLogo';
import { LOGO_CONFIG } from '../../data/logoDatabase';
import { usePortalContent } from '../../context/PortalContentContext';

interface FooterProps {
  onOpenDetail: (title?: string) => void;
  logoSrc?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDetail,
  logoSrc,
}) => {
  const { content } = usePortalContent();
  const cms = content('footer', {} as Record<string, unknown>);
  const safeUrl = (value: unknown, fallback: string, allowed?: RegExp) => typeof value === 'string' && /^https:\/\//i.test(value) && (!allowed || allowed.test(value)) ? value : fallback;
  const tagline = typeof cms.tagline === 'string' ? cms.tagline : 'Melayani perjalanan Muslim Indonesia dengan hati, profesionalisme, dan teknologi.';
  const contactTitle = typeof cms.contactTitle === 'string' ? cms.contactTitle : 'BUTUH INFORMASI TERBARU?';
  const contactDescription = typeof cms.contactDescription === 'string' ? cms.contactDescription : 'Hubungi tim Investor Relations untuk informasi, dokumen, atau pembaruan resmi Nuzultrip Equity.';
  const contactCta = typeof cms.contactCta === 'string' ? cms.contactCta : 'Hubungi Kami';
  const whatsappUrl = safeUrl(cms.whatsappUrl, 'https://wa.me/6281234567890?text=Halo%20Tim%20Nuzultrip%20Equity,%20saya%20membutuhkan%20informasi%20terbaru%20mengenai%20penawaran%20equity.', /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i);
  const instagramUrl = safeUrl(cms.instagramUrl, 'https://instagram.com', /^https:\/\/(www\.)?instagram\.com\//i);
  const facebookUrl = safeUrl(cms.facebookUrl, 'https://facebook.com', /^https:\/\/(www\.)?facebook\.com\//i);
  const tiktokUrl = safeUrl(cms.tiktokUrl, 'https://tiktok.com', /^https:\/\/(www\.)?tiktok\.com\//i);
  const copyright = typeof cms.copyright === 'string' ? cms.copyright : '© 2026 Nuzultrip. All Rights Reserved.';
  const footerLogo = typeof cms.logoUrl === 'string' && /^https:\/\//i.test(cms.logoUrl) ? cms.logoUrl : logoSrc || LOGO_CONFIG.footerLogoSrc;
  const defaultTentangLinks = [
    'Model Bisnis',
    'Ekosistem Bisnis',
    'Perkembangan',
    'Agen dan Kemitraan',
    'Informasi',
    'Ringkasan Penawaran',
    'Pemegang Equity',
  ];

  const tentangLinks = Array.isArray(cms.aboutLinks) && cms.aboutLinks.every((v) => typeof v === 'string') ? cms.aboutLinks as string[] : defaultTentangLinks;
  const defaultInfoLinks = [
    'Penggunaan Dana',
    'Tata Kelola',
    'Faktor Risiko',
    'Mekanisme Hasil',
    'Legal',
    'Risk Disclosure',
  ];
  const infoLinks = Array.isArray(cms.infoLinks) && cms.infoLinks.every((v) => typeof v === 'string') ? cms.infoLinks as string[] : defaultInfoLinks;

  return (
    <footer id="site-footer" className="bg-[#131314] text-white pt-16 sm:pt-20 pb-12 border-t border-white/10">
      <Container size="default">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16 border-b border-white/15">
          {/* Col 1: Brand & Tagline & Socials */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-5 shrink-0">
                <NuzultripLogo size="lg" src={footerLogo} />
              </div>
              <p className="text-[14px] sm:text-[15px] text-white/70 leading-relaxed max-w-[320px]">
                {tagline}
              </p>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 flex items-center gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Nuzultrip"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Instagram size={17} />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Nuzultrip"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Facebook size={17} />
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Nuzultrip"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <TikTokIcon size={17} />
              </a>
            </div>
          </div>

          {/* Col 2: Tentang Nuzultrip */}
          <div className="lg:col-span-3">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/50 mb-5">
              TENTANG NUZULTRIP
            </h4>
            <ul className="space-y-2.5">
              {tentangLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="text-[14px] text-white/75 hover:text-white transition-colors text-left focus-visible:outline-none cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Informasi & Legal */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/50 mb-5">
              INFORMASI
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="text-[14px] text-white/75 hover:text-white transition-colors text-left focus-visible:outline-none cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Contact Box */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <div className="bg-white/[0.04] rounded-2xl p-6 sm:p-7 border border-white/15 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/60 mb-2.5">
                  {contactTitle}
                </h4>
                <p className="text-[13.5px] text-white/70 leading-relaxed">
                  {contactDescription}
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#10b981] hover:border-[#10b981] text-[#090909] hover:text-white font-bold text-[13.5px] flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200 group cursor-pointer"
                >
                  <span>{contactCta}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/50">
          <p>{copyright}</p>
          <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-right">
            <button
              type="button"
              onClick={() => onOpenDetail('Kebijakan Privasi')}
              className="text-white/60 hover:text-white transition-colors cursor-pointer focus-visible:outline-none"
            >
              Kebijakan Privasi
            </button>
            <span className="text-white/30">•</span>
            <button
              type="button"
              onClick={() => onOpenDetail('Syarat & Ketentuan')}
              className="text-white/60 hover:text-white transition-colors cursor-pointer focus-visible:outline-none"
            >
              Syarat dan Ketentuan
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
};
