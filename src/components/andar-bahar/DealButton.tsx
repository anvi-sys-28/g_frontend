'use client';

import React from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { useGameStore } from '@/lib/shared/useGameStore';

// Playing cards SVG icon
function CardsIcon({ className = 'w-5 h-5' }: { className?: string }) {
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
      <rect width="13" height="17" x="2" y="5" rx="2" />
      <path d="M17 19.5V7a2 2 0 0 0-2-2H8" />
      <path d="M21 16V4a2 2 0 0 0-2-2h-8" />
    </svg>
  );
}

export function DealButton() {
  const selectedChip = useAndarBaharStore((s) => s.selectedChip);
  const selectedSide = useAndarBaharStore((s) => s.selectedSide);
  const gameState = useAndarBaharStore((s) => s.gameState);
  const dealRound = useAndarBaharStore((s) => s.dealRound);
  const isLiveMode = useAndarBaharStore((s) => s.isLiveMode);
  const livePhase = useAndarBaharStore((s) => s.livePhase);
  const liveTimeRemaining = useAndarBaharStore((s) => s.liveTimeRemaining);
  const balance = useGameStore((s) => s.balance);

  const isDealing = gameState === 'dealing' || (isLiveMode && livePhase === 'dealing');
  const hasInsufficientBalance = balance < selectedChip;

  let buttonText = selectedSide
    ? `DEAL ANDAR BAHAR (${selectedChip} ON ${selectedSide})`
    : 'CHOOSE ANDAR OR BAHAR';

  if (isLiveMode) {
    if (livePhase === 'betting') {
      buttonText = selectedSide
        ? `LOCKS IN ${Math.ceil(liveTimeRemaining)}s • ${selectedChip} ON ${selectedSide}`
        : `CHOOSE ANDAR OR BAHAR (${Math.ceil(liveTimeRemaining)}s)`;
    } else if (livePhase === 'dealing') {
      buttonText = selectedSide
        ? `DEALING... (${selectedChip} ON ${selectedSide})`
        : `DEALING CARDS... (${liveTimeRemaining.toFixed(1)}s)`;
    } else {
      buttonText = 'ROUND SETTLED';
    }
  } else if (isDealing) {
    buttonText = 'Dealing Cards...';
  } else if (hasInsufficientBalance) {
    buttonText = `Out of Coins (${balance} < ${selectedChip})`;
  }

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 pt-2 pb-24 sm:pb-3 select-none">
      <button
        type="button"
        disabled={isDealing || hasInsufficientBalance || (isLiveMode && livePhase !== 'betting')}
        onClick={isLiveMode ? undefined : dealRound}
        className={`relative w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
          isDealing
            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 animate-pulse cursor-not-allowed'
            : hasInsufficientBalance
            ? 'bg-red-950/70 border border-red-500/40 text-red-300 cursor-not-allowed opacity-90'
            : isLiveMode && livePhase === 'betting'
            ? 'bg-gradient-to-r from-[#e5b842] via-[#ffd269] to-[#b3821a] border border-[#fff2b2] text-black shadow-[0_0_25px_rgba(229,184,66,0.5)] cursor-default'
            : 'bg-gradient-to-r from-[#e5b842] via-[#ffd269] to-[#b3821a] hover:brightness-110 border border-[#fff2b2] text-black shadow-[0_0_25px_rgba(229,184,66,0.5)] cursor-pointer'
        }`}
      >
        {/* Ornate Side Flourishes */}
        <span className="text-[#a16207] text-sm select-none">❖</span>

        <CardsIcon className={`w-4 h-4 stroke-[2.5] ${isDealing ? 'animate-spin text-neutral-400' : 'text-black'}`} />

        <span className="font-extrabold drop-shadow">
          {buttonText}
        </span>

        <span className="text-[#a16207] text-sm select-none">❖</span>
      </button>
    </div>
  );
}
