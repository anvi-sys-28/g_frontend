'use client';

import React from 'react';

export function PlayinExchangeLogo({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Top Golden Crest / Emblem */}
      <div className={`relative ${compact ? 'w-12 h-12 mb-1' : 'w-14 h-14 sm:w-18 sm:h-18 mb-1 sm:mb-2'} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Sunburst & Star Rays */}
          <circle cx="50" cy="50" r="44" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50" cy="50" r="39" stroke="#FFDF73" strokeWidth="1.2" opacity="0.8" />
          
          {/* Ornamental Gear / Casino Ring */}
          <circle cx="50" cy="50" r="34" stroke="url(#goldGradient)" strokeWidth="3" />
          <circle cx="50" cy="50" r="28" fill="#1A1508" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Crown & Playing Cards Fan (Behind Spade) */}
          <path
            d="M 36 28 L 44 20 L 50 26 L 56 20 L 64 28 L 62 34 L 38 34 Z"
            fill="url(#goldGradient)"
            opacity="0.85"
          />
          {/* Card corners */}
          <rect x="30" y="24" width="12" height="18" rx="1.5" transform="rotate(-20 30 24)" fill="#0F0C05" stroke="#D4AF37" strokeWidth="1" />
          <rect x="58" y="20" width="12" height="18" rx="1.5" transform="rotate(20 58 20)" fill="#0F0C05" stroke="#D4AF37" strokeWidth="1" />

          {/* Central Spade Emblem with 3D Gold Gradient */}
          <path
            d="M 50 32
               C 44.5 39 37.5 45 37.5 51
               C 37.5 56 41.5 59.5 46.5 59.5
               C 49 59.5 50.8 58.2 51.5 56.8
               L 50.8 65
               H 46
               V 67.5
               H 54
               V 65
               H 52.5
               L 51.8 56.8
               C 52.5 58.2 54.3 59.5 56.8 59.5
               C 61.8 59.5 65.8 56 65.8 51
               C 65.8 45 58.8 39 53.3 32
               Q 51.6 30 50 32 Z"
            fill="url(#goldGradient)"
            stroke="#FFEAA7"
            strokeWidth="0.8"
          />

          {/* Golden Gradient Definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2A3" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#AA771C" />
              <stop offset="100%" stopColor="#FFDF73" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Title with Gold Horizontal Accent Lines */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
        <div className={`h-[1px] flex-1 ${compact ? 'max-w-[35px]' : 'max-w-[45px] sm:max-w-[60px]'} bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#FFDF73]`} />
        <div className="flex flex-col items-center">
          <span className={`${compact ? 'text-sm' : 'text-base sm:text-xl md:text-2xl'} font-black tracking-widest text-white uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]`}>
            PLAYIN
          </span>
          <span className={`${compact ? 'text-[9px]' : 'text-[10px] sm:text-xs md:text-sm'} font-extrabold tracking-[0.25em] text-[#D4AF37] uppercase -mt-0.5 sm:-mt-1 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]`}>
            EXCHANGE
          </span>
        </div>
        <div className={`h-[1px] flex-1 ${compact ? 'max-w-[35px]' : 'max-w-[45px] sm:max-w-[60px]'} bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#FFDF73]`} />
      </div>
    </div>
  );
}

export default PlayinExchangeLogo;
