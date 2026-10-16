'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getNumberColor } from '@/lib/roulette/rouletteEngine';

export function LastResultsCard() {
  const recentNumbers = useRouletteStore((s) => s.recentNumbers);
  const lastFive = recentNumbers.slice(0, 5);

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-row items-center py-1.5 px-3 rounded-full bg-black/80 backdrop-blur-md border border-[#D4AF37]/50 shadow-2xl shadow-black/80 select-none animate-in fade-in duration-300">
      {/* Crown Logo & Label */}
      <div className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[#D4AF37]/40 shrink-0">
        <Crown className="w-3.5 h-3.5 text-[#f5d27a] drop-shadow-[0_0_6px_rgba(245,210,122,0.6)]" />
        <span className="text-[10px] sm:text-xs font-serif tracking-wider font-semibold text-[#f5d27a]">
          Roulette
        </span>
      </div>

      {/* 5 Recent Numbers horizontally */}
      <div className="flex flex-row items-center gap-1 sm:gap-1.5">
        {lastFive.map((num, idx) => {
          const color = getNumberColor(num);
          let bgClass = 'bg-gradient-to-b from-[#b81414] to-[#7f0a0a] text-white border-red-500/30';
          if (color === 'black') {
            bgClass = 'bg-gradient-to-b from-[#252525] to-[#121212] text-white border-neutral-700';
          } else if (color === 'green') {
            bgClass = 'bg-gradient-to-b from-[#0b6623] to-[#053d14] text-white border-emerald-500/40';
          }

          return (
            <div
              key={`${num}-${idx}`}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[11px] sm:text-xs border shadow-md transition-all ${bgClass} ${
                idx === 0 ? 'ring-2 ring-[#f5d27a] scale-105 shadow-[0_0_10px_rgba(245,210,122,0.4)]' : 'opacity-90'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}
