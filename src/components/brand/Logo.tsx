import React from 'react';

interface LogoProps {
  variant?: 'white' | 'brand' | 'gold-spade';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GoldenSpadeEmblem({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="spadeBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3d2c0b" />
          <stop offset="70%" stopColor="#1a1205" />
          <stop offset="100%" stopColor="#0d0902" />
        </radialGradient>
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="75%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <linearGradient id="spadeGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Crown/Sunburst Dots */}
      <circle cx="50" cy="50" r="46" stroke="url(#goldRing)" strokeWidth="1.2" strokeDasharray="3 3.5" opacity="0.8" />
      <circle cx="50" cy="50" r="42" fill="url(#spadeBg)" stroke="url(#goldRing)" strokeWidth="2.5" filter="url(#goldGlow)" />
      <circle cx="50" cy="50" r="37" stroke="url(#goldRing)" strokeWidth="0.8" opacity="0.6" />

      {/* Ornate Crown Top Points */}
      <path d="M38 18L50 10L62 18L57 23H43L38 18Z" fill="url(#goldRing)" />
      <circle cx="50" cy="9" r="2.2" fill="#fef08a" />
      <circle cx="37" cy="17" r="1.8" fill="#fef08a" />
      <circle cx="63" cy="17" r="1.8" fill="#fef08a" />

      {/* Royal Golden Spade Symbol */}
      <path
        d="M50 24 C47 33 32 43 32 54 C32 63 39 68 47 65.5 C48.5 65 49.5 64 50 63 C50.5 64 51.5 65 53 65.5 C61 68 68 63 68 54 C68 43 53 33 50 24 Z"
        fill="url(#spadeGold)"
      />
      {/* Spade Stem */}
      <path d="M47.5 60.5 H52.5 L55 74 C55 76 57 78 60 78 H40 C43 78 45 76 45 74 L47.5 60.5 Z" fill="url(#spadeGold)" />

      {/* Laurel leaves left & right */}
      <path d="M17 45 C17 60 27 72 38 78" stroke="url(#goldRing)" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <path d="M83 45 C83 60 73 72 62 78" stroke="url(#goldRing)" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Logo({ variant = 'gold-spade', className = '', size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  if (variant === 'gold-spade' || variant === 'white') {
    return (
      <div className={`inline-flex items-center gap-2.5 font-black tracking-tight select-none ${className}`}>
        <GoldenSpadeEmblem className={iconSizes[size]} />
        <div className={`flex items-baseline ${textSizes[size]}`}>
          <span className="text-white font-black tracking-tight drop-shadow-sm">Live</span>
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black tracking-tight drop-shadow-[0_0_12px_rgba(234,179,8,0.3)]">
            Cricket
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 font-black tracking-tight select-none ${className}`}>
      <div
        className={`flex items-center justify-center rounded-lg font-black bg-brand-600 text-white shadow-sm shadow-brand-600/30 ${
          iconSizes[size]
        }`}
      >
        ⚡
      </div>
      <div className={`flex items-baseline ${textSizes[size]}`}>
        <span className="text-surface-text font-black">Live</span>
        <span className="text-brand-600 font-extrabold">Cricket</span>
      </div>
    </div>
  );
}

export default Logo;
