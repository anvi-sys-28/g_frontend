'use client';

import React from 'react';
import { Undo2, X } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';

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
    value: 10,
    label: '10',
    bgGradient: 'from-[#4b5563] via-[#374151] to-[#1f2937]',
    borderColor: 'border-[#9ca3af]',
    stripeColor: 'border-gray-300',
    glowColor: 'shadow-gray-500/30',
  },
  {
    value: 50,
    label: '50',
    bgGradient: 'from-[#dc2626] via-[#b91c1c] to-[#7f1d1d]',
    borderColor: 'border-[#f87171]',
    stripeColor: 'border-red-200',
    glowColor: 'shadow-red-500/40',
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
    bgGradient: 'from-[#16a34a] via-[#15803d] to-[#14532d]',
    borderColor: 'border-[#4ade80]',
    stripeColor: 'border-emerald-200',
    glowColor: 'shadow-emerald-500/40',
  },
  {
    value: 500,
    label: '500',
    bgGradient: 'from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]',
    borderColor: 'border-[#60a5fa]',
    stripeColor: 'border-blue-200',
    glowColor: 'shadow-blue-500/40',
  },
  {
    value: 1000,
    label: '1000',
    bgGradient: 'from-[#7c3aed] via-[#6d28d9] to-[#4c1d95]',
    borderColor: 'border-[#c084fc]',
    stripeColor: 'border-purple-200',
    glowColor: 'shadow-purple-500/40',
  },
];

export function ChipSelector() {
  const selectedChip = useRouletteStore((s) => s.selectedChip);
  const setSelectedChip = useRouletteStore((s) => s.setSelectedChip);
  const undoBet = useRouletteStore((s) => s.undoBet);
  const clearAllBets = useRouletteStore((s) => s.clearAllBets);
  const betHistoryStack = useRouletteStore((s) => s.betHistoryStack);
  const spinState = useRouletteStore((s) => s.spinState);
  const isLiveMode = useRouletteStore((s) => s.isLiveMode);
  const livePhase = useRouletteStore((s) => s.livePhase);

  const isSpinning = spinState === 'spinning';
  const isLocked = isSpinning || (isLiveMode && livePhase !== 'betting');
  const canUndo = betHistoryStack.length > 0 && !isLocked;

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-3 py-1 flex items-center justify-between select-none">
      {/* Undo Button */}
      <button
        type="button"
        onClick={undoBet}
        disabled={!canUndo}
        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 flex items-center justify-center text-[#f5d27a] hover:bg-[#D4AF37]/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-black"
        title="Undo Last Chip"
      >
        <Undo2 className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Chips 10, 50, 100, 250, 500, 1000 */}
      <div className={`flex items-center gap-1.5 sm:gap-2 transition-opacity ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        {CHIPS.map((chip) => {
          const isSelected = selectedChip === chip.value;

          return (
            <button
              key={chip.value}
              type="button"
              disabled={isLocked}
              onClick={() => setSelectedChip(chip.value)}
              className={`relative rounded-full flex items-center justify-center font-black transition-all transform active:scale-90 ${
                isSelected
                  ? `w-11 h-11 sm:w-12 sm:h-12 scale-110 z-10 ${chip.glowColor} ring-2 ring-[#f5d27a]`
                  : 'w-9 h-9 sm:w-10 sm:h-10 opacity-80 hover:opacity-100 hover:scale-105'
              }`}
            >
              {/* Outer Chip Body */}
              <div
                className={`w-full h-full rounded-full bg-gradient-to-b ${chip.bgGradient} border-2 ${chip.borderColor} flex items-center justify-center shadow-md relative overflow-hidden`}
              >
                {/* Edge Dashes Pattern */}
                <div
                  className={`absolute inset-0.5 rounded-full border border-dashed ${chip.stripeColor} opacity-70 pointer-events-none`}
                />

                {/* Inner Center Circle with Number */}
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                  <span className="text-[10px] sm:text-xs font-black tracking-tight text-white drop-shadow">
                    {chip.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Clear (X) Button */}
      <button
        type="button"
        onClick={clearAllBets}
        disabled={!canUndo}
        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 flex items-center justify-center text-[#f5d27a] hover:bg-[#D4AF37]/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-black"
        title="Clear All Bets"
      >
        <X className="w-5 h-5 stroke-[2.2]" />
      </button>
    </div>
  );
}
