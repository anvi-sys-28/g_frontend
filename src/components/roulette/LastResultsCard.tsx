'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getNumberColor } from '@/lib/roulette/rouletteEngine';

export function LastResultsCard() {
  const recentNumbers = useRouletteStore((s) => s.recentNumbers);
  const lastFive = recentNumbers.slice(0, 5);

  return (
    <div className="absolute top-14 right-3 z-20 flex flex-col items-center py-2 px-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-[#D4AF37]/50 shadow-2xl shadow-black/80 select-none animate-in fade-in duration-300">
      {/* Crown Logo & Serif Title */}
      <div className="flex flex-col items-center mb-2 px-1">
        <Crown className="w-3.5 h-3.5 text-[#f5d27a] drop-shadow-[0_0_6px_rgba(245,210,122,0.6)]" />
        <span className="text-[9px] font-serif tracking-wider font-semibold text-[#f5d27a] mt-0.5">
          Roulette
        </span>
      </div>

      {/* 5 Recent Numbers (Newest on top) */}
      <div className="flex flex-col items-center gap-1.5">
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
              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border shadow-md transition-all ${bgClass} ${
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
