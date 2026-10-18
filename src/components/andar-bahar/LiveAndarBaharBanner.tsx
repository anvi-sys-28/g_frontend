'use client';

import React from 'react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { Clock, ShieldAlert, Sparkles, Users } from 'lucide-react';

export function LiveAndarBaharBanner() {
  const liveRoundId = useAndarBaharStore((s) => s.liveRoundId);
  const livePhase = useAndarBaharStore((s) => s.livePhase);
  const liveTimeRemaining = useAndarBaharStore((s) => s.liveTimeRemaining);
  const livePhaseProgress = useAndarBaharStore((s) => s.livePhaseProgress);
  const roundResult = useAndarBaharStore((s) => s.roundResult);
  const activePlayersCount = useAndarBaharStore((s) => s.activePlayersCount);
  const roomBets = useAndarBaharStore((s) => s.roomBets);
  const andarTotalWager = useAndarBaharStore((s) => s.andarTotalWager);
  const baharTotalWager = useAndarBaharStore((s) => s.baharTotalWager);
  const andarCards = useAndarBaharStore((s) => s.andarCards);
  const baharCards = useAndarBaharStore((s) => s.baharCards);

  const winningSide = roundResult?.winningSide;
  const didWin = roundResult?.won;

  return (
    <div className="relative w-full max-w-[430px] mx-auto px-2 py-1 select-none z-20">
      <div className="relative overflow-hidden rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-black/90 via-neutral-950/95 to-black/90 backdrop-blur-md shadow-xl p-2.5 transition-all">
        {/* Ambient Glow */}
        <div
          className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 ${
            livePhase === 'betting'
              ? 'bg-amber-400'
              : livePhase === 'dealing'
              ? 'bg-red-500'
              : 'bg-emerald-400'
          }`}
        />

        {/* Phase Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  livePhase === 'betting'
                    ? 'bg-emerald-400'
                    : livePhase === 'dealing'
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  livePhase === 'betting'
                    ? 'bg-emerald-500'
                    : livePhase === 'dealing'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#f5d27a]">
              Live Andar Bahar #{liveRoundId || 201}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-300">
            <Users className="w-3 h-3 text-[#f5d27a]" />
            <span>{activePlayersCount || 1} Online</span>
          </div>
        </div>

        {/* Phase 1: BETTING (5s) */}
        {livePhase === 'betting' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF0A0] flex items-center justify-center text-black font-black text-xs shadow-md animate-pulse">
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
                  Select ANDAR or BAHAR (Locks in 0s)
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#f5d27a] transition-all duration-100 rounded-full"
                  style={{ width: `${Math.max(0, 100 - livePhaseProgress * 100)}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-neutral-400 mt-0.5">5s Window</span>
            </div>
          </div>
        )}

        {/* Phase 2: DEALING (10s suspense) */}
        {livePhase === 'dealing' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-md animate-pulse">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wide text-red-400 flex items-center gap-1.5">
                  BETS CLOSED • DEALING CARDS
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">
                  Andar: {andarCards.length} cards | Bahar: {baharCards.length} cards
                </span>
              </div>
            </div>

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

        {/* Phase 3: SETTLED (5s) */}
        {livePhase === 'settled' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg border-2 ring-2 ring-[#f5d27a] animate-bounce ${
                  winningSide === 'ANDAR'
                    ? 'bg-gradient-to-b from-[#b81414] to-[#7f0a0a] border-red-400'
                    : 'bg-gradient-to-b from-[#b37b14] to-[#7a4e04] border-amber-400'
                }`}
              >
                {winningSide === 'ANDAR' ? 'A' : 'B'}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                  <span>WINNER:</span>
                  <span className="text-[#f5d27a] uppercase font-black">
                    {winningSide}
                  </span>
                </span>
                <span className="text-[10px] font-bold">
                  {didWin ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Won +{roundResult?.payout} Coins!
                    </span>
                  ) : (
                    <span className="text-neutral-400">
                      Next round in {Math.ceil(liveTimeRemaining)}s
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">
                Next Deal
              </span>
              <span className="text-xs font-mono font-black text-[#f5d27a]">
                0:0{Math.max(1, Math.ceil(liveTimeRemaining))}
              </span>
            </div>
          </div>
        )}

        {/* Live Wager Distribution Bar */}
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-1">
            <span className="font-bold text-red-400">Andar Pool:</span>
            <span className="text-white font-mono font-bold">{andarTotalWager} Coins</span>
          </div>
          <div className="text-neutral-500 font-bold">•</div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-amber-400">Bahar Pool:</span>
            <span className="text-white font-mono font-bold">{baharTotalWager} Coins</span>
          </div>
        </div>

        {/* Live Multiplayer Ticker */}
        <div className="mt-1 flex items-center gap-1 overflow-x-auto no-scrollbar text-[8.5px] text-neutral-400 whitespace-nowrap">
          <span className="font-bold text-[#f5d27a] shrink-0">Live Bets:</span>
          {roomBets && roomBets.length > 0 ? (
            roomBets.slice(0, 4).map((rb, idx) => (
              <span
                key={`${rb.playerId}-${idx}`}
                className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0"
              >
                <strong className="text-white font-semibold">{rb.playerName}:</strong> {rb.side} ({rb.amount})
              </span>
            ))
          ) : (
            <span className="text-neutral-500 italic">
              Round #{liveRoundId || 201} active • Choose ANDAR or BAHAR to place bet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
