'use client';

import React from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';

interface ChipConfig {
  value: number;
  label: string;
  bgGradient: string;
  borderColor: string;
  stripeColor: string;
  glowColor: string;
}

const CHIPS: ChipConfig[] = [
  {
    value: 50,
    label: '50',
    bgGradient: 'from-[#262626] via-[#1a1a1a] to-[#0d0d0d]',
    borderColor: 'border-neutral-500',
    stripeColor: 'border-neutral-400',
    glowColor: 'shadow-neutral-500/40',
  },
  {
    value: 100,
    label: '100',
    bgGradient: 'from-[#f59e0b] via-[#d97706] to-[#92400e]',
    borderColor: 'border-[#fde047]',
    stripeColor: 'border-amber-200',
    glowColor: 'shadow-[0_0_15px_rgba(250,204,21,0.7)]',
  },
  {
    value: 250,
    label: '250',
    bgGradient: 'from-[#dc2626] via-[#b91c1c] to-[#7f1d1d]',
    borderColor: 'border-[#f87171]',
    stripeColor: 'border-red-200',
    glowColor: 'shadow-red-500/40',
  },
  {
    value: 500,
    label: '500',
    bgGradient: 'from-[#16a34a] via-[#15803d] to-[#14532d]',
    borderColor: 'border-[#4ade80]',
    stripeColor: 'border-emerald-200',
    glowColor: 'shadow-emerald-500/40',
  },
  {
    value: 1000,
    label: '1000',
    bgGradient: 'from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]',
    borderColor: 'border-[#60a5fa]',
    stripeColor: 'border-blue-200',
    glowColor: 'shadow-blue-500/40',
  },
];

export function ChipRow() {
  const selectedChip = useAndarBaharStore((s) => s.selectedChip);
  const setSelectedChip = useAndarBaharStore((s) => s.setSelectedChip);
  const gameState = useAndarBaharStore((s) => s.gameState);
  const isLiveMode = useAndarBaharStore((s) => s.isLiveMode);
  const livePhase = useAndarBaharStore((s) => s.livePhase);

  const disabled = gameState === 'dealing' || (isLiveMode && livePhase !== 'betting');

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 py-1.5 select-none">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
          Select Bet Amount (Coins)
        </span>
        <span className="text-[10px] font-black text-[#f5d27a]">
          Wager: {selectedChip} Coins
        </span>
      </div>

      {/* Row of 5 Chips */}
      <div className="flex items-center justify-between px-2 py-1 bg-black/50 backdrop-blur-md rounded-2xl border border-white/5">
        {CHIPS.map((chip) => {
          const isSelected = selectedChip === chip.value;

          return (
            <button
              key={chip.value}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedChip(chip.value)}
              className={`relative rounded-full flex items-center justify-center font-black transition-all transform active:scale-90 disabled:opacity-40 ${
                isSelected
                  ? `w-12 h-12 scale-110 z-10 ${chip.glowColor} ring-2 ring-[#f5d27a]`
                  : 'w-10 h-10 opacity-75 hover:opacity-100 hover:scale-105'
              }`}
            >
              <div
                className={`w-full h-full rounded-full bg-gradient-to-b ${chip.bgGradient} border-2 ${chip.borderColor} flex items-center justify-center shadow-lg relative overflow-hidden`}
              >
                {/* Edge stripes pattern */}
                <div
                  className={`absolute inset-0.5 rounded-full border border-dashed ${chip.stripeColor} opacity-70 pointer-events-none`}
                />

                {/* Inner center circle */}
                <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center border border-white/20">
                  <span className="text-[10px] font-black tracking-tight text-white drop-shadow">
                    {chip.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
