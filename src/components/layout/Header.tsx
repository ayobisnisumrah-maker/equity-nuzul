import { usePortalSection } from '../../context/PortalContentContext';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Megaphone } from 'lucide-react';
import { Container } from './Container';
import { NuzultripLogo } from '../ui/NuzultripLogo';
import { LOGO_CONFIG } from '../../data/logoDatabase';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenInterest: () => void;
  logoSrc?: string;
  isPastHero?: boolean;
  onOpenAnnouncement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogin,
  onOpenInterest,
  logoSrc,
  isPastHero = false,
  onOpenAnnouncement,
}) => {
  const field = usePortalSection('header');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const navLinks = [
    { key: 'tentang', label: 'Tentang', href: '#tentang' },
    { key: 'peluang', label: 'Peluang', href: '#peluang' },
    { key: 'proses', label: 'Proses', href: '#proses' },
    { key: 'roadmap', label: 'Roadmap', href: '#roadmap' },
    { key: 'jaringan', label: 'Jaringan', href: '#jaringan' },
    { key: 'investor', label: 'Investor', href: '#informasi' },
    { key: 'kontak', label: 'Kontak', href: '#kontak' },
  ].map((link, index) => ({ ...link, label: field('navLabels', [] as string[])[index] ?? link.label }));

  useEffect(() => {
    const SECTIONS_CONFIG: { id: string; key: string }[] = [
      { id: 'tentang', key: 'tentang' },
      { id: 'peluang', key: 'peluang' },
      { id: 'perusahaan', key: 'peluang' },
      { id: 'layanan', key: 'peluang' },
      { id: 'proses', key: 'proses' },
      { id: 'roadmap', key: 'roadmap' },
      { id: 'jaringan', key: 'jaringan' },
      { id: 'informasi', key: 'investor' },
      { id: 'kontak', key: 'kontak' },
      { id: 'artikel', key: 'kontak' },
    ];

    let ticking = false;

    const determineActiveSection = () => {
      // 1. Header scroll background styling threshold
      setIsScrolled(window.scrollY > 40);

      // 2. Hero top area check
      if (window.scrollY < 200) {
        setActiveSection('');
        return;
      }

      // 3. Scrolled near bottom of page -> Kontak is active
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection('kontak');
        return;
      }

      // 4. Focus trigger point in pixels from viewport top (below header)
      const triggerY = 140;

      for (let i = 0; i < SECTIONS_CONFIG.length; i++) {
        const el = document.getElementById(SECTIONS_CONFIG[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom > triggerY) {
            setActiveSection(SECTIONS_CONFIG[i].key);
            return;
          }
        }
      }

      // 5. Fallback: Find the last passed section
      for (let i = SECTIONS_CONFIG.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS_CONFIG[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            setActiveSection(SECTIONS_CONFIG[i].key);
            return;
          }
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          determineActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    determineActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, key: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(key);
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 70;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      id="site-header"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      {/* 00. Top Announcement Section Above Header (Hides when scrolled past Hero) */}
      <div
        id="announcement-bar"
        onClick={onOpenAnnouncement}
        className={`w-full bg-[#131314]/95 border-emerald-500/25 text-white backdrop-blur-md transition-all duration-500 overflow-hidden relative z-20 ${
          isPastHero
            ? 'max-h-0 opacity-0 py-0 border-b-0 pointer-events-none'
            : 'max-h-20 opacity-100 py-1.5 sm:py-2 px-3 sm:px-4 border-b shadow-sm cursor-pointer hover:bg-[#1a1b1e]'
        }`}
        title="Klik untuk melihat rincian pengumuman resmi"
      >
        <Container size="default">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-center flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Megaphone size={11} className="shrink-0" />
              <span>{field('announcementBadge', 'Pengumuman')}</span>
            </span>
            <p className="text-[11.5px] sm:text-[12.5px] leading-tight text-neutral-200">
              <strong className="text-white font-medium">{field('announcementTitle', 'RUPS Luar Biasa Kuartal 3')}</strong> {field('announcementText', 'dijadwalkan pada 20 Oktober 2026. Laporan Triwulan II telah terbit.')}
            </p>
          </div>
        </Container>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-[#131314]/92 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <Container size="default">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              id="header-logo"
              className="flex items-center shrink-0 group focus-visible:outline-none transition-opacity hover:opacity-90 py-1"
              aria-label="Nuzultrip Beranda"
            >
              <NuzultripLogo size="md" src={logoSrc || LOGO_CONFIG.headerLogoSrc} />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Navigasi Utama">
              {navLinks.map((link) => {
                const isActive = activeSection === link.key;
                return (
                  <a
                    key={link.key}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.key)}
                    className={`text-[14px] xl:text-[15px] font-medium transition-colors duration-200 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-sm ${
                      isActive
                        ? 'text-emerald-400 font-semibold'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right Action: Masuk & CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                id="header-masuk-btn"
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-[#10b981] border border-white/15 hover:border-[#10b981] text-white hover:text-white text-[14px] font-semibold transition-all duration-200 active:scale-98 shadow-sm hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] group backdrop-blur-sm cursor-pointer"
              >
                <span>{field('loginLabel', 'Masuk')}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile Full-Screen Overlay Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-overlay"
          className={`lg:hidden fixed inset-0 ${
            isPastHero ? 'top-[62px]' : 'top-[96px]'
          } bg-[#131314]/98 backdrop-blur-xl z-40 px-6 py-8 flex flex-col justify-between border-t border-white/10 overflow-y-auto transition-all duration-300 animate-in fade-in`}
        >
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.key)}
                  className={`text-[20px] font-semibold py-2 border-b border-white/[0.08] flex items-center justify-between transition-colors ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    size={16}
                    className={isActive ? 'text-emerald-400' : 'text-white/40'}
                  />
                </a>
              );
            })}
          </div>

          <div className="pt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInterest();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-semibold text-center flex items-center justify-center gap-2"
            >
              <span>Ajukan Minat Equity</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-3.5 px-6 rounded-xl border border-white/20 text-white font-medium text-center"
            >
              Masuk Portal Investor
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
