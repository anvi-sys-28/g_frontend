'use client';

import React, { useEffect, useState } from 'react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getNumberColor } from '@/lib/roulette/rouletteEngine';
import confetti from 'canvas-confetti';

export function WinningBadge() {
  const spinState = useRouletteStore((s) => s.spinState);
  const spinResult = useRouletteStore((s) => s.spinResult);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (spinState === 'settled' && spinResult) {
      setVisible(true);

      // Trigger celebratory confetti if player won!
      if (spinResult.totalPayout > 0) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#FFDF73', '#FF4D4D', '#FFFFFF'],
          });
        } catch {}
      }

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [spinState, spinResult]);

  if (!visible || !spinResult) return null;

  const color = getNumberColor(spinResult.winningNumber);
  let bgClass = 'from-[#b81414] to-[#7f0a0a] border-red-400';
  if (color === 'black') {
    bgClass = 'from-[#282828] to-[#121212] border-neutral-600';
  } else if (color === 'green') {
    bgClass = 'from-[#0b6623] to-[#043d14] border-emerald-400';
  }

  const hasWon = spinResult.totalPayout > 0;

  return (
    <div className="absolute top-20 inset-x-0 z-30 flex flex-col items-center pointer-events-none select-none animate-in zoom-in-50 duration-300">
      <div className="flex flex-col items-center p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.6)]">
        {/* Large winning number circle */}
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-b ${bgClass} border-2 flex items-center justify-center font-black text-2xl text-white shadow-2xl ring-4 ring-[#f5d27a]`}
        >
          {spinResult.winningNumber}
        </div>

        <div className="text-center mt-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#f5d27a] block">
            {color.toUpperCase()} • {spinResult.winningNumber % 2 === 0 && spinResult.winningNumber !== 0 ? 'EVEN' : spinResult.winningNumber === 0 ? 'ZERO' : 'ODD'}
          </span>

          {hasWon ? (
            <div className="mt-1 flex flex-col items-center animate-bounce">
              <span className="text-sm font-black text-emerald-400 drop-shadow">
                + {spinResult.totalPayout.toLocaleString()} COINS WON!
              </span>
              <span className="text-[10px] font-bold text-neutral-300">
                (Net: +{spinResult.netProfit.toLocaleString()} Coins)
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-neutral-400 block mt-0.5">
              No winning bets this round
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
