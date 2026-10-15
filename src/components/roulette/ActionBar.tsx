'use client';

import React from 'react';
import { Trash2, RotateCw } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';

// Stylized Roulette Disc Wheel SVG icon
function RouletteIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function ActionBar() {
  const bets = useRouletteStore((s) => s.bets);
  const clearAllBets = useRouletteStore((s) => s.clearAllBets);
  const repeatBets = useRouletteStore((s) => s.repeatBets);
  const spin = useRouletteStore((s) => s.spin);
  const spinState = useRouletteStore((s) => s.spinState);
  const lastRoundBets = useRouletteStore((s) => s.lastRoundBets);

  const totalBetCount = Object.keys(bets).length;
  const isSpinning = spinState === 'spinning';
  const hasLastBets = Object.keys(lastRoundBets).length > 0;

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 py-2 flex items-center justify-between gap-2 select-none">
      {/* CLEAR ALL Button */}
      <button
        type="button"
        onClick={clearAllBets}
        disabled={isSpinning || totalBetCount === 0}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-neutral-200 hover:text-white hover:border-[#D4AF37] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-black"
      >
        <Trash2 className="w-4 h-4 text-[#f5d27a]" />
        <span className="text-[11px] font-black tracking-wider uppercase">Clear All</span>
      </button>

      {/* Dominant Gold SPIN Button */}
      <button
        type="button"
        onClick={spin}
        disabled={isSpinning || totalBetCount === 0}
        className={`flex-1 max-w-[210px] py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
          isSpinning
            ? 'bg-[#333333] text-neutral-400 border border-neutral-600 animate-pulse cursor-not-allowed'
            : totalBetCount === 0
            ? 'bg-gradient-to-r from-[#997d3d] to-[#6b5220] text-black/60 border border-[#b89547]/40 cursor-not-allowed opacity-75'
            : 'bg-gradient-to-r from-[#F0C05A] via-[#E2A732] to-[#B37B14] hover:brightness-110 border border-[#FFF0B0] text-black shadow-[0_0_25px_rgba(226,167,50,0.55)] cursor-pointer'
        }`}
      >
        <RouletteIcon className={`w-5 h-5 stroke-[2.5] ${isSpinning ? 'animate-spin text-neutral-400' : 'text-black'}`} />
        <span>{isSpinning ? 'Spinning...' : 'SPIN'}</span>
      </button>

      {/* REPEAT Button */}
      <button
        type="button"
        onClick={repeatBets}
        disabled={isSpinning || !hasLastBets}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-neutral-200 hover:text-white hover:border-[#D4AF37] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-black"
      >
        <RotateCw className="w-4 h-4 text-[#f5d27a]" />
        <span className="text-[11px] font-black tracking-wider uppercase">Repeat</span>
      </button>
    </div>
  );
}
