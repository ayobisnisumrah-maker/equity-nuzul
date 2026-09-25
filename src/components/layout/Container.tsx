import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'default',
}) => {
  const maxWidthClass =
    size === 'wide'
      ? 'max-w-[1440px]'
      : size === 'narrow'
      ? 'max-w-[1100px]'
      : 'max-w-[1320px]';

  return (
    <div
      className={`w-full mx-auto px-5 sm:px-8 md:px-12 lg:px-16 ${maxWidthClass} ${className}`}
    >
      {children}
    </div>
  );
};
