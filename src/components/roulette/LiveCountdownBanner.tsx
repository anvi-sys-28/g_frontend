'use client';

import React from 'react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getNumberColor } from '@/lib/roulette/rouletteEngine';
import { Clock, ShieldAlert, Sparkles, Users } from 'lucide-react';

export function LiveCountdownBanner() {
  const liveRoundId = useRouletteStore((s) => s.liveRoundId);
  const livePhase = useRouletteStore((s) => s.livePhase);
  const liveTimeRemaining = useRouletteStore((s) => s.liveTimeRemaining);
  const livePhaseProgress = useRouletteStore((s) => s.livePhaseProgress);
  const winningNumber = useRouletteStore((s) => s.winningNumber);
  const spinResult = useRouletteStore((s) => s.spinResult);
  const activePlayersCount = useRouletteStore((s) => s.activePlayersCount);
  const roomBets = useRouletteStore((s) => s.roomBets);

  const winningColor = winningNumber !== null ? getNumberColor(winningNumber) : null;
  const didWin = (spinResult?.totalPayout || 0) > 0;

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-2 py-1 select-none z-20">
      <div className="relative overflow-hidden rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-black/90 via-neutral-950/95 to-black/90 backdrop-blur-md shadow-xl p-2.5 transition-all">
        {/* Animated Background Glow */}
        <div
          className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 ${
            livePhase === 'betting'
              ? 'bg-amber-400'
              : livePhase === 'spinning'
              ? 'bg-red-500'
              : 'bg-emerald-400'
          }`}
        />

        {/* Phase Header Line */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
          {/* Round Tag */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  livePhase === 'betting'
                    ? 'bg-emerald-400'
                    : livePhase === 'spinning'
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  livePhase === 'betting'
                    ? 'bg-emerald-500'
                    : livePhase === 'spinning'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#f5d27a]">
              Live Round #{liveRoundId || 101}
            </span>
          </div>

          {/* Active Online Players Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-300">
            <Users className="w-3 h-3 text-[#f5d27a]" />
            <span>{activePlayersCount || 24} Online</span>
          </div>
        </div>

        {/* Dynamic Phase Content */}
        {livePhase === 'betting' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF0A0] flex items-center justify-center text-black font-black text-xs shadow-md animate-pulse">
                <Clock className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                  BETTING OPEN
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-500/40">
                    {liveTimeRemaining.toFixed(1)}s
                  </span>
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  Place chips on numbers (Locks at 0s)
                </span>
              </div>
            </div>

            {/* Visual Circular Countdown Mini-Bar */}
            <div className="flex flex-col items-end">
              <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#f5d27a] transition-all duration-100 rounded-full"
                  style={{ width: `${Math.max(0, 100 - livePhaseProgress * 100)}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-neutral-400 mt-0.5">
                5s Window
              </span>
            </div>
          </div>
        )}

        {livePhase === 'spinning' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-md animate-pulse">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wide text-red-400 flex items-center gap-1.5">
                  BETS CLOSED • WHEEL SPINNING
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">
                  Ball decelerating into target pocket...
                </span>
              </div>
            </div>

            {/* Suspense Progress Bar */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-black text-red-300">
                {liveTimeRemaining.toFixed(1)}s
              </span>
              <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-red-500/30 mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-100 rounded-full"
                  style={{ width: `${livePhaseProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {livePhase === 'settled' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Winning Number Chip */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg border-2 ring-2 ring-[#f5d27a] animate-bounce ${
                  winningColor === 'red'
                    ? 'bg-gradient-to-b from-[#b81414] to-[#7f0a0a] border-red-400'
                    : winningColor === 'black'
                    ? 'bg-gradient-to-b from-[#222] to-[#111] border-neutral-600'
                    : 'bg-gradient-to-b from-[#0b6623] to-[#053d14] border-emerald-400'
                }`}
              >
                {winningNumber}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                  <span>WINNER:</span>
                  <span className="text-[#f5d27a] uppercase font-black">
                    {winningNumber} {winningColor}
                  </span>
                </span>
                <span className="text-[10px] font-bold">
                  {didWin ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Won +{spinResult?.totalPayout} Coins!
                    </span>
                  ) : (
                    <span className="text-neutral-400">
                      Next round in {Math.ceil(liveTimeRemaining)}s
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Countdown to Next Round */}
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">
                Next Round
              </span>
              <span className="text-xs font-mono font-black text-[#f5d27a]">
                0:0{Math.max(1, Math.ceil(liveTimeRemaining))}
              </span>
            </div>
          </div>
        )}

        {/* Live Multiplayer Ticker / Least-Chosen Feedback */}
        {roomBets && roomBets.length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar text-[9px] text-neutral-400 whitespace-nowrap">
            <span className="font-bold text-[#f5d27a] shrink-0">Live Room:</span>
            {roomBets.slice(0, 4).map((rb, idx) => (
              <span
                key={`${rb.playerId}-${idx}`}
                className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0"
              >
                <strong className="text-white font-semibold">{rb.playerName}:</strong> {rb.label} ({rb.amount})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
