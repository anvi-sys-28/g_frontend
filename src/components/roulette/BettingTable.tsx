'use client';

import React, { useState } from 'react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import {
  RED_NUMBERS,
  PlacedBet,
  BetType,
} from '@/lib/roulette/rouletteEngine';

// Rows of numbers from left to right exactly matching the reference
const ROW_1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const ROW_2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const ROW_3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

// Get Chip Style based on total bet amount
function getChipVisual(amount: number) {
  if (amount >= 1000) return { bg: 'bg-[#5e17eb]', border: 'border-[#a77df5]', ring: 'ring-purple-400/50' };
  if (amount >= 500) return { bg: 'bg-[#155dfc]', border: 'border-[#60a5fa]', ring: 'ring-blue-400/50' };
  if (amount >= 250) return { bg: 'bg-[#15803d]', border: 'border-[#4ade80]', ring: 'ring-emerald-400/50' };
  if (amount >= 100) return { bg: 'bg-[#d97706]', border: 'border-[#fde047]', ring: 'ring-amber-400/60' };
  if (amount >= 50) return { bg: 'bg-[#b91c1c]', border: 'border-[#f87171]', ring: 'ring-red-400/50' };
  return { bg: 'bg-[#374151]', border: 'border-[#9ca3af]', ring: 'ring-gray-400/50' };
}

function ChipMarker({ bet }: { bet: PlacedBet }) {
  const visual = getChipVisual(bet.amount);
  const count = Object.values(bet.chips).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in zoom-in-75 duration-200">
      <div
        className={`relative w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg shadow-black/80 font-black text-[9px] text-white ${visual.bg} ${visual.border} ring-2 ${visual.ring}`}
      >
        {/* Chip inner dashed circle */}
        <div className="absolute inset-0.5 rounded-full border border-dashed border-white/60 pointer-events-none" />
        <span className="relative z-10 drop-shadow">
          {bet.amount >= 1000 ? `${bet.amount / 1000}k` : bet.amount}
        </span>

        {/* Stack counter badge if multiple chips */}
        {count > 1 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black/90 text-[#f5d27a] border border-[#f5d27a]/60 text-[8px] rounded-full flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

export function BettingTable() {
  const bets = useRouletteStore((s) => s.bets);
  const placeBet = useRouletteStore((s) => s.placeBet);
  const winningNumber = useRouletteStore((s) => s.winningNumber);
  const spinState = useRouletteStore((s) => s.spinState);

  // Active hover/tab inside bet mode (Straight, Split, Corner)
  const [betMode, setBetMode] = useState<'standard' | 'splits' | 'corners'>('standard');

  const handleStraightBet = (num: number) => {
    placeBet(`straight-${num}`, 'straight', `${num}`, [num]);
  };

  const isWinning = (num: number) => {
    return spinState === 'settled' && winningNumber === num;
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-1.5 select-none text-white">
      {/* Bet Type Helper Pills for Mobile Accessibility */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Table Felt
        </span>
        <div className="flex items-center gap-1">
          {(['standard', 'splits', 'corners'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBetMode(mode)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all border ${
                betMode === mode
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                  : 'bg-black/40 text-neutral-400 border-white/10 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Felt Container */}
      <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#0a4a2b] via-[#05331e] to-[#022013] border-2 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(4,66,34,0.5)]">
        {/* Felt Texture Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/30 pointer-events-none" />

        {/* 1. Numbers Section (0 + 3 Rows x 12 Columns + 2:1 Columns) */}
        <div className="relative grid grid-cols-[38px_repeat(12,minmax(0,1fr))_34px] gap-[1.5px] bg-[#D4AF37]/30 p-[1.5px] rounded-xl overflow-hidden">
          {/* Green "0" Cell spanning 3 rows */}
          <button
            type="button"
            onClick={() => handleStraightBet(0)}
            className={`row-span-3 relative flex items-center justify-center font-black text-lg bg-gradient-to-r from-[#0b6623] to-[#08521c] text-white hover:brightness-110 active:scale-[0.98] transition-all rounded-l-lg border border-white/20 shadow-inner ${
              isWinning(0) ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/30' : ''
            }`}
          >
            <span>0</span>
            {bets['straight-0'] && <ChipMarker bet={bets['straight-0']} />}
          </button>

          {/* ROW 1: 3, 6, 9, ... 36 */}
          {ROW_1.map((num, colIdx) => {
            const isRed = RED_NUMBERS.has(num);
            const betKey = `straight-${num}`;
            const bet = bets[betKey];
            const win = isWinning(num);

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => {
                    if (betMode === 'splits' && colIdx < 11) {
                      // Horizontal split with next col in row 1
                      const next = ROW_1[colIdx + 1];
                      placeBet(`split-${num}-${next}`, 'split', `${num}/${next}`, [num, next]);
                    } else if (betMode === 'corners' && colIdx < 11) {
                      // Corner with row 1 & row 2
                      const n2 = ROW_2[colIdx];
                      const n3 = ROW_1[colIdx + 1];
                      const n4 = ROW_2[colIdx + 1];
                      placeBet(`corner-${num}-${n2}-${n3}-${n4}`, 'corner', `Corner`, [num, n2, n3, n4]);
                    } else {
                      handleStraightBet(num);
                    }
                  }}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''}`}
                >
                  <span>{num}</span>
                </button>
                {bet && <ChipMarker bet={bet} />}
              </div>
            );
          })}

          {/* Row 1 Column Bet: "2:1" */}
          <button
            type="button"
            onClick={() => placeBet('column_3', 'column_3', '2:1 Col 3', ROW_1)}
            className="relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg"
          >
            <span>2:1</span>
            {bets['column_3'] && <ChipMarker bet={bets['column_3']} />}
          </button>

          {/* ROW 2: 2, 5, 8, ... 35 */}
          {ROW_2.map((num, colIdx) => {
            const isRed = RED_NUMBERS.has(num);
            const betKey = `straight-${num}`;
            const bet = bets[betKey];
            const win = isWinning(num);

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => {
                    if (betMode === 'splits' && colIdx < 11) {
                      const next = ROW_2[colIdx + 1];
                      placeBet(`split-${num}-${next}`, 'split', `${num}/${next}`, [num, next]);
                    } else if (betMode === 'corners' && colIdx < 11) {
                      const n2 = ROW_3[colIdx];
                      const n3 = ROW_2[colIdx + 1];
                      const n4 = ROW_3[colIdx + 1];
                      placeBet(`corner-${num}-${n2}-${n3}-${n4}`, 'corner', `Corner`, [num, n2, n3, n4]);
                    } else {
                      handleStraightBet(num);
                    }
                  }}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''}`}
                >
                  <span>{num}</span>
                </button>
                {bet && <ChipMarker bet={bet} />}
              </div>
            );
          })}

          {/* Row 2 Column Bet: "2:1" */}
          <button
            type="button"
            onClick={() => placeBet('column_2', 'column_2', '2:1 Col 2', ROW_2)}
            className="relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg"
          >
            <span>2:1</span>
            {bets['column_2'] && <ChipMarker bet={bets['column_2']} />}
          </button>

          {/* ROW 3: 1, 4, 7, ... 34 */}
          {ROW_3.map((num, colIdx) => {
            const isRed = RED_NUMBERS.has(num);
            const betKey = `straight-${num}`;
            const bet = bets[betKey];
            const win = isWinning(num);

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => {
                    if (betMode === 'splits' && colIdx < 11) {
                      const next = ROW_3[colIdx + 1];
                      placeBet(`split-${num}-${next}`, 'split', `${num}/${next}`, [num, next]);
                    } else {
                      handleStraightBet(num);
                    }
                  }}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''}`}
                >
                  <span>{num}</span>
                </button>
                {bet && <ChipMarker bet={bet} />}
              </div>
            );
          })}

          {/* Row 3 Column Bet: "2:1" */}
          <button
            type="button"
            onClick={() => placeBet('column_1', 'column_1', '2:1 Col 1', ROW_3)}
            className="relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg"
          >
            <span>2:1</span>
            {bets['column_1'] && <ChipMarker bet={bets['column_1']} />}
          </button>
        </div>

        {/* 2. Dozens Row (1-12, 13-24, 25-36) exactly below numbers */}
        <div className="grid grid-cols-[38px_repeat(3,1fr)_34px] gap-[1.5px] bg-[#D4AF37]/30 p-[1.5px] mt-[1.5px] rounded-lg">
          <div className="h-7" /> {/* Spacer aligned with 0 */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'dozen_1',
                'dozen_1',
                '1-12',
                Array.from({ length: 12 }, (_, i) => i + 1)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>1 - 12</span>
            {bets['dozen_1'] && <ChipMarker bet={bets['dozen_1']} />}
          </button>

          <button
            type="button"
            onClick={() =>
              placeBet(
                'dozen_2',
                'dozen_2',
                '13-24',
                Array.from({ length: 12 }, (_, i) => i + 13)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>13 - 24</span>
            {bets['dozen_2'] && <ChipMarker bet={bets['dozen_2']} />}
          </button>

          <button
            type="button"
            onClick={() =>
              placeBet(
                'dozen_3',
                'dozen_3',
                '25-36',
                Array.from({ length: 12 }, (_, i) => i + 25)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>25 - 36</span>
            {bets['dozen_3'] && <ChipMarker bet={bets['dozen_3']} />}
          </button>
          <div className="h-7" /> {/* Spacer aligned with 2:1 */}
        </div>

        {/* 3. Outside Bets Row (1-18, EVEN, Red Diamond, Black Diamond, ODD, 19-36) */}
        <div className="grid grid-cols-[38px_repeat(6,1fr)_34px] gap-[1.5px] bg-[#D4AF37]/30 p-[1.5px] mt-[1.5px] rounded-lg">
          <div className="h-7" /> {/* Spacer aligned with 0 */}
          {/* 1 - 18 */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'low',
                'low',
                '1-18',
                Array.from({ length: 18 }, (_, i) => i + 1)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>1 - 18</span>
            {bets['low'] && <ChipMarker bet={bets['low']} />}
          </button>

          {/* EVEN */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'even',
                'even',
                'EVEN',
                Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 === 0)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>EVEN</span>
            {bets['even'] && <ChipMarker bet={bets['even']} />}
          </button>

          {/* Red Diamond */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'red',
                'red',
                'RED',
                Array.from(RED_NUMBERS)
              )
            }
            className="relative h-7 flex items-center justify-center bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-red-500 to-red-700 rotate-45 shadow-sm border border-red-400" />
            {bets['red'] && <ChipMarker bet={bets['red']} />}
          </button>

          {/* Black Diamond */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'black',
                'black',
                'BLACK',
                Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => !RED_NUMBERS.has(n))
              )
            }
            className="relative h-7 flex items-center justify-center bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-neutral-800 to-black rotate-45 shadow-sm border border-neutral-600" />
            {bets['black'] && <ChipMarker bet={bets['black']} />}
          </button>

          {/* ODD */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'odd',
                'odd',
                'ODD',
                Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 !== 0)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>ODD</span>
            {bets['odd'] && <ChipMarker bet={bets['odd']} />}
          </button>

          {/* 19 - 36 */}
          <button
            type="button"
            onClick={() =>
              placeBet(
                'high',
                'high',
                '19-36',
                Array.from({ length: 18 }, (_, i) => i + 19)
              )
            }
            className="relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm"
          >
            <span>19 - 36</span>
            {bets['high'] && <ChipMarker bet={bets['high']} />}
          </button>
          <div className="h-7" /> {/* Spacer aligned with 2:1 */}
        </div>
      </div>
    </div>
  );
}
