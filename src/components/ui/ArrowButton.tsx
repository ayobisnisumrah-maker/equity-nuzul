import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StaggerText } from './LetterStagger';

interface ArrowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'dark-outline' | 'link' | 'dark-link';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  ariaLabel?: string;
  enableStagger?: boolean;
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
  size = 'md',
  id,
  ariaLabel,
  enableStagger = true,
}) => {
  const isLinkVariant = variant === 'link' || variant === 'dark-link';

  const baseStyles =
    'group inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 select-none cursor-pointer';

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'bg-[#090909] text-white hover:bg-[#222222] border border-[#090909] rounded-xl active:scale-[0.99]';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-transparent text-[#111111] hover:bg-black/5 border border-black/15 rounded-xl';
  } else if (variant === 'dark-outline') {
    variantStyles =
      'bg-transparent text-white hover:bg-white/10 border border-white/20 rounded-xl';
  } else if (variant === 'link') {
    variantStyles =
      'bg-transparent text-[#111111] hover:text-black p-0 border-b border-transparent hover:border-black/30 font-semibold';
  } else if (variant === 'dark-link') {
    variantStyles =
      'bg-transparent text-white hover:text-white/90 p-0 border-b border-transparent hover:border-white/40 font-semibold';
  }

  let sizeStyles = '';
  if (!isLinkVariant) {
    if (size === 'sm') {
      sizeStyles = 'min-h-[40px] px-4 py-2 text-[14px]';
    } else if (size === 'lg') {
      sizeStyles = 'min-h-[50px] px-7 py-3 text-[16px]';
    } else {
      sizeStyles = 'min-h-[46px] px-5 py-2.5 text-[15px]';
    }
  } else {
    sizeStyles = 'text-[15px] py-1';
  }

  const renderedText =
    enableStagger && typeof children === 'string' ? (
      <StaggerText text={children} />
    ) : (
      <span className="truncate">{children}</span>
    );

  const content = (
    <>
      {renderedText}
      <ArrowRight
        size={isLinkVariant ? 17 : 16}
        className={`ml-2 shrink-0 transition-transform duration-200 group-hover:translate-x-1.5 ${
          variant === 'primary' ? 'text-white' : ''
        }`}
      />
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
