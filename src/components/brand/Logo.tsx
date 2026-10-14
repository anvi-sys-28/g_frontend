import React from 'react';

interface LogoProps {
  variant?: 'white' | 'brand';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'white', className = '', size = 'md' }: LogoProps) {
  const isWhite = variant === 'white';

  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2 font-black tracking-tight select-none ${className}`}>
      {/* Original lightning cricket badge */}
      <div
        className={`flex items-center justify-center rounded-lg font-black transition-transform ${
          iconSizes[size]
        } ${
          isWhite
            ? 'bg-white text-brand-600 shadow-sm'
            : 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
        }`}
      >
        ⚡
      </div>

      <div className={`flex items-baseline ${textSizes[size]}`}>
        <span className={isWhite ? 'text-white' : 'text-surface-text font-black'}>
          Live
        </span>
        <span className={isWhite ? 'text-white/90 font-extrabold' : 'text-brand-600 font-extrabold'}>
          Cricket
        </span>
      </div>
    </div>
  );
}
