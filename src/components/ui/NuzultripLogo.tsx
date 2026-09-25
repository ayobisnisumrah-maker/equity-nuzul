import React, { useState } from 'react';
import { getMainLogo, LOGO_CONFIG } from '../../data/logoDatabase';

export interface NuzultripLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'white' | 'dark';
  src?: string; // Jalur file gambar (mendukung format .png, .svg, .jpg, .webp)
  alt?: string;
  markColor?: string;
  textColor?: string;
}

/**
 * NuzultripLogo Image Frame Component
 * Membungkus logo dalam frame gambar proporsional yang bisa menerima file PNG, SVG, JPG.
 */
export const NuzultripLogo: React.FC<NuzultripLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'brand',
  src,
  alt = 'Nuzultrip Equity',
  markColor,
  textColor,
}) => {
  const [imageError, setImageError] = useState(false);

  // Ukuran frame gambar dengan aspect-ratio terkunci 38:10 agar tidak gepeng
  // sm: mobile navbar (~28px-30px height, ~106px-114px width)
  // md: desktop navbar (~34px-38px height, ~129px-144px width)
  // lg: footer branding (~40px-44px height, ~152px-167px width)
  // xl: large display (~48px-56px height, ~182px-212px width)
  const sizeClasses = {
    sm: 'h-7 sm:h-7.5 w-auto aspect-[38/10]',
    md: 'h-8.5 sm:h-9 md:h-9.5 w-auto aspect-[38/10]',
    lg: 'h-10 sm:h-11 w-auto aspect-[38/10]',
    xl: 'h-12 sm:h-14 w-auto aspect-[38/10]',
  }[size];

  // Tentukan path sumber gambar (PNG / SVG / JPG)
  const resolvedSrc =
    src !== undefined
      ? src
      : variant === 'dark'
      ? LOGO_CONFIG.lightLogoSrc
      : LOGO_CONFIG.headerLogoSrc;

  // Jika sumber gambar valid dan tidak error, tampilkan tag <img> dalam frame gambar
  if (resolvedSrc && !imageError) {
    return (
      <div
        className={`logo-frame relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
      >
        <img
          src={resolvedSrc}
          alt={alt}
          className="w-full h-full object-contain select-none block"
          loading="eager"
          decoding="async"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback vector inline jika file gambar eksternal gagal dimuat
  const logoData = getMainLogo(variant === 'dark' ? 'light' : 'dark');
  const resolvedMarkColor =
    markColor ||
    (variant === 'white'
      ? '#FFFFFF'
      : variant === 'dark'
      ? '#000000'
      : logoData.markColor);

  const resolvedTextColor =
    textColor ||
    (variant === 'dark'
      ? '#000000'
      : '#FFFFFF');

  return (
    <div
      className={`logo-frame relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
    >
      <svg
        viewBox={logoData.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full select-none block"
        aria-label={alt}
      >
        <g
          stroke={resolvedMarkColor}
          strokeWidth="15.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 46.5 9.5 L 72.9 35.9" />
          <path d="M 16.6 51.8 L 34.2 34.2 L 65.8 65.8 L 83.4 48.2" />
          <path d="M 27.1 64.1 L 53.5 90.5" />
        </g>
        <text
          x="114"
          y="45"
          fill={resolvedTextColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="44"
          fontWeight="800"
          letterSpacing="-0.6px"
        >
          Nuzultrip
        </text>
        <text
          x="114"
          y="88"
          fill={resolvedTextColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="44"
          fontWeight="800"
          letterSpacing="-0.6px"
        >
          Equity
        </text>
      </svg>
    </div>
  );
};
