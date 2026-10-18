'use client';

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import {
  RED_NUMBERS,
  BLACK_NUMBERS,
  PlacedBet,
  areNumbersAdjacent,
  getStreetNumbers,
  getCornerNumbers,
  getSixLineNumbers,
} from '@/lib/roulette/rouletteEngine';

// Rows of numbers from left to right exactly matching standard European felt
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

function ChipMarker({ bet, isWinner }: { bet: PlacedBet; isWinner?: boolean }) {
  const visual = getChipVisual(bet.amount);
  const count = Object.values(bet.chips).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transform-gpu animate-in zoom-in-75 duration-150">
      <div
        className={`relative w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg shadow-black/80 font-black text-[9px] text-white ${visual.bg} ${visual.border} ring-2 ${
          isWinner ? 'ring-[#f5d27a] scale-110 drop-shadow-[0_0_10px_rgba(245,210,122,0.9)] animate-bounce' : visual.ring
        }`}
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
  const spinResult = useRouletteStore((s) => s.spinResult);
  const spinState = useRouletteStore((s) => s.spinState);
  const isLiveMode = useRouletteStore((s) => s.isLiveMode);
  const livePhase = useRouletteStore((s) => s.livePhase);

  // Table is locked when spinning, settled, or when in live mode outside betting window
  const isTableLocked = spinState === 'spinning' || spinState === 'settled' || (isLiveMode && livePhase !== 'betting');

  // Active betting mode: Standard (35:1), Splits (17:1), Corners (8:1), Streets (11:1), Six-Line (5:1)
  const [betMode, setBetMode] = useState<'standard' | 'splits' | 'corners' | 'streets' | 'six-line'>('standard');
  const [splitFirstNum, setSplitFirstNum] = useState<number | null>(null);

  const totalStake = Object.values(bets).reduce((acc, b) => acc + b.amount, 0);

  const isWinning = (num: number) => {
    return (spinState === 'settled' || (isLiveMode && livePhase === 'settled')) && winningNumber === num;
  };

  const isBetWinner = (betId: string) => {
    return (spinState === 'settled' || (isLiveMode && livePhase === 'settled')) && spinResult?.winningBets.some((wb) => wb.betId === betId);
  };

  const isOutsideWin = (type: string) => {
    if ((spinState !== 'settled' && (!isLiveMode || livePhase !== 'settled')) || winningNumber === null) return false;
    if (type === 'red') return RED_NUMBERS.has(winningNumber);
    if (type === 'black') return BLACK_NUMBERS.has(winningNumber);
    if (type === 'even') return winningNumber !== 0 && winningNumber % 2 === 0;
    if (type === 'odd') return winningNumber !== 0 && winningNumber % 2 !== 0;
    if (type === 'low') return winningNumber >= 1 && winningNumber <= 18;
    if (type === 'high') return winningNumber >= 19 && winningNumber <= 36;
    if (type === 'dozen_1') return winningNumber >= 1 && winningNumber <= 12;
    if (type === 'dozen_2') return winningNumber >= 13 && winningNumber <= 24;
    if (type === 'dozen_3') return winningNumber >= 25 && winningNumber <= 36;
    if (type === 'column_1') return ROW_3.includes(winningNumber);
    if (type === 'column_2') return ROW_2.includes(winningNumber);
    if (type === 'column_3') return ROW_1.includes(winningNumber);
    return false;
  };

  const handleCellClick = (num: number) => {
    if (isTableLocked) return;

    if (betMode === 'standard') {
      placeBet(`straight-${num}`, 'straight', `${num}`, [num]);
      return;
    }

    if (betMode === 'splits') {
      if (splitFirstNum === null) {
        setSplitFirstNum(num);
        return;
      }
      if (splitFirstNum === num) {
        setSplitFirstNum(null);
        return;
      }
      if (areNumbersAdjacent(splitFirstNum, num)) {
        const sorted = [splitFirstNum, num].sort((a, b) => a - b);
        placeBet(`split-${sorted[0]}-${sorted[1]}`, 'split', `${sorted[0]}/${sorted[1]}`, sorted);
        setSplitFirstNum(null);
      } else {
        setSplitFirstNum(num);
      }
      return;
    }

    if (betMode === 'corners') {
      const cornerNums = getCornerNumbers(num);
      if (cornerNums.length === 4) {
        placeBet(
          `corner-${cornerNums[0]}-${cornerNums[1]}-${cornerNums[2]}-${cornerNums[3]}`,
          'corner',
          `Corner ${cornerNums[0]}-${cornerNums[3]}`,
          cornerNums
        );
      }
      return;
    }

    if (betMode === 'streets') {
      const streetNums = getStreetNumbers(num);
      if (streetNums.length === 3) {
        placeBet(
          `street-${streetNums[0]}-${streetNums[2]}`,
          'street',
          `Street ${streetNums[0]}-${streetNums[2]}`,
          streetNums
        );
      }
      return;
    }

    if (betMode === 'six-line') {
      const lineNums = getSixLineNumbers(num);
      if (lineNums.length === 6) {
        placeBet(
          `line-${lineNums[0]}-${lineNums[5]}`,
          'line',
          `Line ${lineNums[0]}-${lineNums[5]}`,
          lineNums
        );
      }
      return;
    }
  };

  const renderCellChips = (num: number) => {
    const straightBet = bets[`straight-${num}`];
    const hSplitBet = bets[`split-${num}-${num + 3}`];
    const vSplitBet = num % 3 !== 0 ? bets[`split-${num}-${num + 1}`] : null;

    // Corner bet where num is the bottom-left number
    const cornerKey = Object.keys(bets).find((k) => k.startsWith(`corner-${num}-`));
    const cornerBet = cornerKey ? bets[cornerKey] : null;

    // Street bet where num is the first in street (Row 3)
    const streetKey = Object.keys(bets).find((k) => k.startsWith(`street-${num}-`));
    const streetBet = streetKey ? bets[streetKey] : null;

    // Six-line bet where num is the first in six-line (Row 3)
    const lineKey = Object.keys(bets).find((k) => k.startsWith(`line-${num}-`));
    const lineBet = lineKey ? bets[lineKey] : null;

    return (
      <>
        {straightBet && <ChipMarker bet={straightBet} isWinner={isBetWinner(straightBet.id)} />}

        {hSplitBet && (
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <ChipMarker bet={hSplitBet} isWinner={isBetWinner(hSplitBet.id)} />
          </div>
        )}

        {vSplitBet && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <ChipMarker bet={vSplitBet} isWinner={isBetWinner(vSplitBet.id)} />
          </div>
        )}

        {cornerBet && (
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <ChipMarker bet={cornerBet} isWinner={isBetWinner(cornerBet.id)} />
          </div>
        )}

        {streetBet && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
            <ChipMarker bet={streetBet} isWinner={isBetWinner(streetBet.id)} />
          </div>
        )}

        {lineBet && (
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
            <ChipMarker bet={lineBet} isWinner={isBetWinner(lineBet.id)} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-1.5 select-none text-white">
      {/* Bet Type Helper Pills & Total Stake Header */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Table Felt
          </span>
          {totalStake > 0 && (
            <span className="text-[9px] font-black text-[#f5d27a] bg-black/70 px-2 py-0.5 rounded-full border border-[#D4AF37]/50 shadow-sm animate-in fade-in">
              Bet: {totalStake.toLocaleString()} Coins
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(['standard', 'splits', 'corners', 'streets', 'six-line'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setBetMode(mode);
                setSplitFirstNum(null);
              }}
              className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider transition-all border ${
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
      <div className={`relative rounded-2xl p-1 bg-gradient-to-b from-[#0a4a2b] via-[#05331e] to-[#022013] border-2 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(4,66,34,0.5)] transition-all ${
        isTableLocked ? 'cursor-not-allowed select-none' : ''
      }`}>
        {/* Felt Texture Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/30 pointer-events-none" />

        {/* Lock Overlay when betting window is closed */}
        {isTableLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] rounded-2xl z-40 flex items-center justify-center pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-black/85 border border-red-500/60 text-red-300 text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-2xl flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400 stroke-[2.5]" />
              <span>Bets Closed • Wheel Spinning</span>
            </div>
          </div>
        )}

        {/* 1. Numbers Section (0 + 3 Rows x 12 Columns + 2:1 Columns) */}
        <div className="relative grid grid-cols-[38px_repeat(12,minmax(0,1fr))_34px] gap-[1.5px] bg-[#D4AF37]/30 p-[1.5px] rounded-xl overflow-hidden">
          {/* Green "0" Cell spanning 3 rows */}
          <button
            type="button"
            onClick={() => handleCellClick(0)}
            className={`row-span-3 relative flex items-center justify-center font-black text-lg bg-gradient-to-r from-[#0b6623] to-[#08521c] text-white hover:brightness-110 active:scale-[0.98] transition-all rounded-l-lg border border-white/20 shadow-inner ${
              isWinning(0) ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''
            } ${splitFirstNum === 0 ? 'ring-2 ring-[#f5d27a] bg-yellow-400/30' : ''}`}
          >
            <span>0</span>
            {bets['straight-0'] && <ChipMarker bet={bets['straight-0']} isWinner={isBetWinner('straight-0')} />}
            {bets['split-0-1'] && (
              <div className="absolute bottom-2 right-0 translate-x-1/2 z-30 pointer-events-none">
                <ChipMarker bet={bets['split-0-1']} isWinner={isBetWinner('split-0-1')} />
              </div>
            )}
            {bets['split-0-2'] && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-30 pointer-events-none">
                <ChipMarker bet={bets['split-0-2']} isWinner={isBetWinner('split-0-2')} />
              </div>
            )}
            {bets['split-0-3'] && (
              <div className="absolute top-2 right-0 translate-x-1/2 z-30 pointer-events-none">
                <ChipMarker bet={bets['split-0-3']} isWinner={isBetWinner('split-0-3')} />
              </div>
            )}
          </button>

          {/* ROW 1: 3, 6, 9, ... 36 */}
          {ROW_1.map((num) => {
            const isRed = RED_NUMBERS.has(num);
            const win = isWinning(num);
            const isSelectedFirst = splitFirstNum === num;

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => handleCellClick(num)}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''} ${
                    isSelectedFirst ? 'ring-2 ring-[#f5d27a] bg-amber-400/40' : ''
                  }`}
                >
                  <span>{num}</span>
                </button>
                {renderCellChips(num)}
              </div>
            );
          })}

          {/* Row 1 Column Bet: "2:1" (covers ROW_1 numbers) */}
          <button
            type="button"
            onClick={() => placeBet('column_3', 'column_3', '2:1 Col 3', ROW_1)}
            className={`relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg ${
              isOutsideWin('column_3') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>2:1</span>
            {bets['column_3'] && <ChipMarker bet={bets['column_3']} isWinner={isBetWinner('column_3')} />}
          </button>

          {/* ROW 2: 2, 5, 8, ... 35 */}
          {ROW_2.map((num) => {
            const isRed = RED_NUMBERS.has(num);
            const win = isWinning(num);
            const isSelectedFirst = splitFirstNum === num;

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => handleCellClick(num)}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''} ${
                    isSelectedFirst ? 'ring-2 ring-[#f5d27a] bg-amber-400/40' : ''
                  }`}
                >
                  <span>{num}</span>
                </button>
                {renderCellChips(num)}
              </div>
            );
          })}

          {/* Row 2 Column Bet: "2:1" (covers ROW_2 numbers) */}
          <button
            type="button"
            onClick={() => placeBet('column_2', 'column_2', '2:1 Col 2', ROW_2)}
            className={`relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg ${
              isOutsideWin('column_2') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>2:1</span>
            {bets['column_2'] && <ChipMarker bet={bets['column_2']} isWinner={isBetWinner('column_2')} />}
          </button>

          {/* ROW 3: 1, 4, 7, ... 34 */}
          {ROW_3.map((num) => {
            const isRed = RED_NUMBERS.has(num);
            const win = isWinning(num);
            const isSelectedFirst = splitFirstNum === num;

            return (
              <div key={num} className="relative h-9">
                <button
                  type="button"
                  onClick={() => handleCellClick(num)}
                  className={`w-full h-full flex items-center justify-center font-black text-xs transition-all border border-white/10 hover:brightness-125 active:scale-[0.96] ${
                    isRed
                      ? 'bg-gradient-to-b from-[#b81414] to-[#800d0d] text-white'
                      : 'bg-gradient-to-b from-[#212121] to-[#121212] text-white'
                  } ${win ? 'animate-pulse ring-4 ring-yellow-400 bg-yellow-400/40 z-10' : ''} ${
                    isSelectedFirst ? 'ring-2 ring-[#f5d27a] bg-amber-400/40' : ''
                  }`}
                >
                  <span>{num}</span>
                </button>
                {renderCellChips(num)}
              </div>
            );
          })}

          {/* Row 3 Column Bet: "2:1" (covers ROW_3 numbers) */}
          <button
            type="button"
            onClick={() => placeBet('column_1', 'column_1', '2:1 Col 1', ROW_3)}
            className={`relative h-9 flex items-center justify-center font-black text-[10px] bg-gradient-to-r from-[#032a18] to-[#021f12] text-[#f5d27a] border border-white/20 hover:brightness-125 active:scale-[0.96] transition-all rounded-r-lg ${
              isOutsideWin('column_1') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>2:1</span>
            {bets['column_1'] && <ChipMarker bet={bets['column_1']} isWinner={isBetWinner('column_1')} />}
          </button>
        </div>

        {/* 2. Dozens Row (1-12, 13-24, 25-36) */}
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
            className={`relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('dozen_1') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>1 - 12</span>
            {bets['dozen_1'] && <ChipMarker bet={bets['dozen_1']} isWinner={isBetWinner('dozen_1')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('dozen_2') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>13 - 24</span>
            {bets['dozen_2'] && <ChipMarker bet={bets['dozen_2']} isWinner={isBetWinner('dozen_2')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-xs bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('dozen_3') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>25 - 36</span>
            {bets['dozen_3'] && <ChipMarker bet={bets['dozen_3']} isWinner={isBetWinner('dozen_3')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('low') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>1 - 18</span>
            {bets['low'] && <ChipMarker bet={bets['low']} isWinner={isBetWinner('low')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('even') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>EVEN</span>
            {bets['even'] && <ChipMarker bet={bets['even']} isWinner={isBetWinner('even')} />}
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
            className={`relative h-7 flex items-center justify-center bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('red') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-red-500 to-red-700 rotate-45 shadow-sm border border-red-400" />
            {bets['red'] && <ChipMarker bet={bets['red']} isWinner={isBetWinner('red')} />}
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
            className={`relative h-7 flex items-center justify-center bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('black') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-neutral-800 to-black rotate-45 shadow-sm border border-neutral-600" />
            {bets['black'] && <ChipMarker bet={bets['black']} isWinner={isBetWinner('black')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('odd') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
          >
            <span>ODD</span>
            {bets['odd'] && <ChipMarker bet={bets['odd']} isWinner={isBetWinner('odd')} />}
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
            className={`relative h-7 flex items-center justify-center font-black text-[11px] bg-gradient-to-b from-[#063b22] to-[#032616] border border-white/10 hover:brightness-125 active:scale-[0.98] transition-all rounded-sm ${
              isOutsideWin('high') ? 'ring-2 ring-yellow-400 bg-yellow-400/25 animate-pulse' : ''
            }`}
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
