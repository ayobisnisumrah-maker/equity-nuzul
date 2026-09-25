import React from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  customDisplay?: string;
  useGrouping?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  customDisplay,
  useGrouping = true,
}) => {
  if (customDisplay) {
    return <span className={className}>{customDisplay}</span>;
  }

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      // Indonesian decimal comma formatting (e.g. 0,8)
      return num.toFixed(decimals).replace('.', ',');
    }
    if (!useGrouping) {
      return Math.round(num).toString();
    }
    return Math.round(num).toLocaleString('id-ID');
  };

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span className={prefix.endsWith(' ') ? 'mr-1' : ''}>{prefix}</span>}
      <span>{formatNumber(value)}</span>
      {suffix && (
        <span className={suffix.startsWith(' ') ? 'ml-1.5' : ''}>
          {suffix.startsWith(' ') ? suffix.trimStart() : suffix}
        </span>
      )}
    </span>
  );
};
