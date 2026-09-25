import headerLogoImage from '../assets/images/regenerated_image_1790320127213.png';
import footerLogoImage from '../assets/images/regenerated_image_1790320132755.png';

/**
 * Nuzultrip Official & Final Main Logo Database
 * Official Brand Asset: Nuzultrip Equity
 */

export interface LogoItem {
  id: string;
  name: string;
  filename: string;
  description: string;
  markColor: string;
  textColor: string;
  textLines: [string, string];
  recommendedBg: 'dark' | 'light';
  svgPath: string;
  aspectRatio: string;
  viewBox: string;
}

/**
 * Konfigurasi Frame Gambar Logo
 * Mendukung format gambar .png, .svg, .jpg, atau .webp
 */
export const LOGO_CONFIG = {
  // Frame Logo Header (Latar Gelap)
  headerLogoSrc: headerLogoImage,
  // Frame Logo Footer (Latar Gelap)
  footerLogoSrc: footerLogoImage,
  // Frame Logo Latar Terang
  lightLogoSrc: headerLogoImage,
  // Default gambar logo
  defaultLogoSrc: headerLogoImage,
};

// Logo database exclusively containing the official uploaded final logo
export const LOGO_DATABASE: Record<string, LogoItem> = {
  'main-logo-dark': {
    id: 'main-logo-dark',
    name: 'Nuzultrip Equity - Main Logo (Latar Gelap)',
    filename: 'regenerated_image_1790320127213.png',
    description: 'Logo Resmi & Final Nuzultrip Equity: Lambang Hijau Zamrud (#00D285) dengan teks Putih Murni (#FFFFFF).',
    markColor: '#00D285',
    textColor: '#FFFFFF',
    textLines: ['Nuzultrip', 'Equity'],
    recommendedBg: 'dark',
    svgPath: headerLogoImage,
    aspectRatio: '38/10',
    viewBox: '0 0 380 100',
  },
  'main-logo-light': {
    id: 'main-logo-light',
    name: 'Nuzultrip Equity - Main Logo (Latar Terang)',
    filename: 'regenerated_image_1790320127213.png',
    description: 'Logo Resmi & Final Nuzultrip Equity untuk Latar Terang.',
    markColor: '#00D285',
    textColor: '#000000',
    textLines: ['Nuzultrip', 'Equity'],
    recommendedBg: 'light',
    svgPath: headerLogoImage,
    aspectRatio: '38/10',
    viewBox: '0 0 380 100',
  },
};

export const getMainLogo = (theme: 'dark' | 'light' = 'dark'): LogoItem => {
  return theme === 'dark'
    ? LOGO_DATABASE['main-logo-dark']
    : LOGO_DATABASE['main-logo-light'];
};
