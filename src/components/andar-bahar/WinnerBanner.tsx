'use client';

import React, { useEffect, useState } from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import confetti from 'canvas-confetti';

export function WinnerBanner() {
  const gameState = useAndarBaharStore((s) => s.gameState);
  const roundResult = useAndarBaharStore((s) => s.roundResult);
  const firstSideNotice = useAndarBaharStore((s) => s.firstSideNotice);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (gameState === 'round_settled' && roundResult) {
      setShowWinner(true);

      if (roundResult.won) {
        try {
          confetti({
            particleCount: 45,
            spread: 65,
            origin: { y: 0.5 },
            colors: ['#D4AF37', '#FFDF73', '#FF4D4D', '#FFFFFF'],
            disableForReducedMotion: true,
          });
        } catch {}
      }

      const timer = setTimeout(() => setShowWinner(false), 3800);
      return () => clearTimeout(timer);
    } else {
      setShowWinner(false);
    }
  }, [gameState, roundResult]);

  return (
    <>
      {/* First Deal Toast ("Andar deals first") */}
      {firstSideNotice && gameState === 'dealing' && (
        <div className="absolute top-16 inset-x-0 z-30 flex justify-center pointer-events-none select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-[#d4af37] text-[#f5d27a] font-serif font-black text-xs shadow-xl tracking-wider uppercase">
            ✦ {firstSideNotice} ✦
          </div>
        </div>
      )}

      {/* Winner Banner */}
      {showWinner && roundResult && (
        <div className="absolute top-20 inset-x-0 z-30 flex justify-center pointer-events-none select-none animate-in zoom-in-75 duration-300">
          <div className="flex flex-col items-center p-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.7)] text-center min-w-[260px]">
            {/* Crown & Winning Side */}
            <span className="text-xl mb-0.5">👑</span>
            <h3 className="text-lg font-serif font-black tracking-wider text-white">
              <span className="text-[#f5d27a]">{roundResult.winningSide}</span> WINS!
            </h3>

            {/* Matching Card Detail */}
            <span className="text-[11px] text-neutral-300 font-bold mt-0.5">
              Matched in {roundResult.totalCardsDealt} cards with{' '}
              <span className="text-[#f5d27a]">
                {roundResult.matchingCard.rank}{roundResult.matchingCard.suit}
              </span>
            </span>

            {/* Payout Announcement */}
            {roundResult.won ? (
              <div className="mt-1.5 flex flex-col items-center animate-bounce">
                <span className="text-sm font-black text-emerald-400 drop-shadow">
                  🎉 +{roundResult.payout?.toLocaleString()} COINS (1.95x)!
                </span>
                <span className="text-[10px] font-bold text-emerald-300">
                  (Profit: +{roundResult.netProfit?.toLocaleString()} Coins)
                </span>
              </div>
            ) : (roundResult.betAmount || 0) > 0 ? (
              <span className="text-xs font-bold text-red-400 mt-1 block">
                Lost {roundResult.betAmount} Coins
              </span>
            ) : (
              <span className="text-xs font-bold text-neutral-400 mt-1 block">
                No bet placed this round
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
