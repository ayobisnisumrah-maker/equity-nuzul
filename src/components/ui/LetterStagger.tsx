import React from 'react';

interface StaggerTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  staggerMs?: number;
  highlightText?: string;
  highlightClassName?: string;
}

/**
 * StaggerText Component (Letter stagger effect disabled as requested)
 * Renders clean typography without letter splitting or rolling animations.
 */
export const StaggerText: React.FC<StaggerTextProps> = ({
  text,
  className = '',
  charClassName = '',
  highlightText,
  highlightClassName = 'text-emerald-400',
}) => {
  if (!highlightText) {
    return (
      <span className={`inline-block ${className} ${charClassName}`.trim()}>
        {text}
      </span>
    );
  }

  const parts = text.split(new RegExp(`(${highlightText})`, 'gi'));
  return (
    <span className={`inline-block ${className}`.trim()}>
      {parts.map((part, idx) => {
        const isHighlight = part.toLowerCase() === highlightText.toLowerCase();
        return (
          <span
            key={idx}
            className={`${isHighlight ? highlightClassName : ''} ${charClassName}`.trim()}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
};

interface StaggerHeadingProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  highlightWord?: string;
  highlightClass?: string;
  staggerDelay?: number;
}

/**
 * StaggerHeading Component (Letter stagger effect disabled as requested)
 * Renders static, crisp typography with optional word highlight.
 */
export const StaggerHeading: React.FC<StaggerHeadingProps> = ({
  children,
  text = '',
  className = '',
  as: Component = 'h2',
  highlightWord,
  highlightClass = 'text-emerald-600',
}) => {
  if (children) {
    return <Component className={className}>{children}</Component>;
  }

  if (!highlightWord) {
    return <Component className={className}>{text}</Component>;
  }

  const words = text.split(' ');
  return (
    <Component className={className}>
      {words.map((word, wordIdx) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanHighlight = highlightWord.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isHighlight = cleanWord === cleanHighlight;

        return (
          <React.Fragment key={wordIdx}>
            <span className={isHighlight ? highlightClass : ''}>{word}</span>
            {wordIdx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </Component>
  );
};
