'use client';

import React from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { History } from 'lucide-react';

export function RecentResultsBar() {
  const recentResults = useAndarBaharStore((s) => s.recentResults);
  const lastTen = recentResults.slice(0, 10);

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 py-1 select-none">
      <div className="flex items-center justify-between rounded-2xl p-2 bg-black/75 backdrop-blur-md border border-[#d4af37]/40 shadow-lg">
        {/* Label on Left */}
        <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 shrink-0">
          <History className="w-3.5 h-3.5 text-[#f5d27a]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#f5d27a]">
            Recent
          </span>
        </div>

        {/* 10 Playing Card Tiles (Newest First) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pl-2 py-0.5">
          {lastTen.map((entry, idx) => {
            const isRed = entry.card.color === 'red';
            const isAndarWin = entry.winningSide === 'ANDAR';

            return (
              <div
                key={`${entry.card.id}-${idx}`}
                className={`relative shrink-0 w-8 h-10 rounded-md bg-white border flex flex-col justify-between p-1 shadow-md transition-all ${
                  idx === 0 ? 'ring-2 ring-[#f5d27a] scale-105' : 'opacity-90'
                }`}
              >
                {/* Tiny Corner Indicator Dot: Red = Andar, Gold = Bahar */}
                <div
                  className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                    isAndarWin ? 'bg-red-600 ring-1 ring-red-400' : 'bg-amber-400 ring-1 ring-yellow-200'
                  }`}
                  title={isAndarWin ? 'Won by Andar' : 'Won by Bahar'}
                />

                {/* Rank Top-Left */}
                <span
                  className={`text-[9px] font-black leading-none ${
                    isRed ? 'text-red-700' : 'text-neutral-900'
                  }`}
                >
                  {entry.card.rank}
                </span>

                {/* Suit Centered */}
                <span
                  className={`text-xs self-center leading-none ${
                    isRed ? 'text-red-700' : 'text-neutral-900'
                  }`}
                >
                  {entry.card.suit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
