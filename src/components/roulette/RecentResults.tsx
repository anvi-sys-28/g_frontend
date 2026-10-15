'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getNumberColor } from '@/lib/roulette/rouletteEngine';

export function RecentResults() {
  const recentNumbers = useRouletteStore((s) => s.recentNumbers);

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 pt-1 pb-3 select-none">
      {/* Container matching screenshot */}
      <div className="rounded-2xl p-2.5 bg-black/70 backdrop-blur-md border border-[#D4AF37]/30 shadow-lg shadow-black/80">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-[#f5d27a]" />
          <span className="text-xs font-bold tracking-wide text-[#f5d27a]">
            Recent Results
          </span>
        </div>

        {/* Horizontal Row of Numbers */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {recentNumbers.map((num, idx) => {
            const color = getNumberColor(num);
            let bgClass = 'bg-gradient-to-b from-[#b81414] to-[#7f0a0a] text-white border-red-500/40';
            if (color === 'black') {
              bgClass = 'bg-gradient-to-b from-[#282828] to-[#141414] text-white border-neutral-700';
            } else if (color === 'green') {
              bgClass = 'bg-gradient-to-b from-[#0b6623] to-[#053d14] text-white border-emerald-500/50';
            }

            return (
              <div
                key={`${num}-${idx}`}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border shadow-md transition-all ${bgClass} ${
                  idx === 0
                    ? 'ring-2 ring-[#f5d27a] scale-105 shadow-[0_0_12px_rgba(245,210,122,0.4)]'
                    : 'opacity-90'
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
