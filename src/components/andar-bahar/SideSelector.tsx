'use client';

import React from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';

export function SideSelector() {
  const selectedSide = useAndarBaharStore((s) => s.selectedSide);
  const setSelectedSide = useAndarBaharStore((s) => s.setSelectedSide);
  const gameState = useAndarBaharStore((s) => s.gameState);
  const config = useAndarBaharStore((s) => s.config);
  const isLiveMode = useAndarBaharStore((s) => s.isLiveMode);
  const livePhase = useAndarBaharStore((s) => s.livePhase);

  const disabled = gameState === 'dealing' || (isLiveMode && livePhase !== 'betting');
  const multiplierText = `(${config.payoutMultiplier}x)`;

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 py-1.5 select-none">
      {/* "CHOOSE SIDE" Heading with Gold Ornamental Lines */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#f5d27a] drop-shadow">
          Choose Side
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#d4af37]" />
      </div>

      {/* Two Large Side Buttons: ANDAR & BAHAR */}
      <div className="grid grid-cols-2 gap-3">
        {/* ANDAR Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelectedSide('ANDAR')}
          className={`relative rounded-2xl p-3.5 flex flex-col items-center justify-center transition-all transform active:scale-95 disabled:opacity-50 ${
            selectedSide === 'ANDAR'
              ? 'bg-gradient-to-b from-[#b81414] via-[#940d0d] to-[#600808] border-2 border-[#f5d27a] shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-[1.02]'
              : 'bg-black/60 backdrop-blur-md border border-[#d4af37]/40 hover:border-[#d4af37] opacity-80'
          }`}
        >
          {/* Gold Corner Filigree */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#f5d27a]/60 pointer-events-none" />

          {/* Spade Icon (♠) */}
          <span className="text-2xl text-[#f5d27a] leading-none mb-0.5">♠</span>

          {/* Title */}
          <span className="text-base font-serif font-black tracking-wider text-white drop-shadow">
            ANDAR
          </span>

          {/* Multiplier */}
          <span className="text-[11px] font-bold text-[#f5d27a] mt-0.5">
            {multiplierText}
          </span>
        </button>

        {/* BAHAR Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelectedSide('BAHAR')}
          className={`relative rounded-2xl p-3.5 flex flex-col items-center justify-center transition-all transform active:scale-95 disabled:opacity-50 ${
            selectedSide === 'BAHAR'
              ? 'bg-gradient-to-b from-[#b81414] via-[#940d0d] to-[#600808] border-2 border-[#f5d27a] shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-[1.02]'
              : 'bg-black/60 backdrop-blur-md border border-[#d4af37]/40 hover:border-[#d4af37] opacity-80'
          }`}
        >
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#f5d27a]/60 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#f5d27a]/60 pointer-events-none" />

          {/* Club Icon (♣) */}
          <span className="text-2xl text-[#f5d27a] leading-none mb-0.5">♣</span>

          {/* Title */}
          <span className="text-base font-serif font-black tracking-wider text-white drop-shadow">
            BAHAR
          </span>

          {/* Multiplier */}
          <span className="text-[11px] font-bold text-[#f5d27a] mt-0.5">
            {multiplierText}
          </span>
        </button>
      </div>
    </div>
  );
}
