import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  variant = 'light',
  className = '',
}) => {
  const colorClass = variant === 'dark' ? 'text-white/70' : 'text-[#111111]';

  return (
    <div
      className={`text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em] mb-4 sm:mb-5 select-none ${colorClass} ${className}`}
    >
      {children}
    </div>
  );
};
