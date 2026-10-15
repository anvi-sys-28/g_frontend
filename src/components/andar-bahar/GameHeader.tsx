'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Coins, Settings } from 'lucide-react';
import { useGameStore } from '@/lib/shared/useGameStore';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';

export function GameHeader() {
  const balance = useGameStore((s) => s.balance);
  const addBalance = useGameStore((s) => s.addBalance);
  const toggleSettings = useAndarBaharStore((s) => s.toggleSettings);

  return (
    <header className="relative z-30 flex items-center justify-between px-3 py-2.5 bg-gradient-to-b from-black/95 via-black/75 to-transparent select-none">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/casino"
          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-[#d4af37]/50 flex items-center justify-center text-[#f5d27a] hover:bg-[#d4af37]/20 active:scale-95 transition-all shadow-md"
          aria-label="Back to Casino"
        >
          <ChevronLeft className="w-5 h-5 text-[#f5d27a]" />
        </Link>

        <div className="h-6 w-px bg-white/15" />

        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-white drop-shadow">
            Live <span className="text-[#f5d27a]">Andar Bahar</span> Classic
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-500/30 rounded-full">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Right: Balance Pill & Settings */}
      <div className="flex items-center gap-1.5">
        {/* Coin Balance Pill */}
        <div className="flex items-center h-8 pl-2.5 pr-1 rounded-xl bg-black/70 backdrop-blur-md border border-[#d4af37]/50 shadow-md">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fff0a0] flex items-center justify-center shadow-sm">
              <Coins className="w-2.5 h-2.5 text-black font-bold" />
            </div>
            <span className="text-xs font-black tracking-tight text-white">
              {balance.toLocaleString()} <span className="text-[10px] text-[#f5d27a] font-semibold">Coins</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => addBalance(1000)}
            className="w-6 h-6 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black flex items-center justify-center hover:brightness-110 active:scale-90 transition-all font-black text-xs shadow-sm"
            title="Refill 1,000 Coins"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Settings Gear */}
        <button
          type="button"
          onClick={() => toggleSettings(true)}
          className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-[#d4af37]/50 flex items-center justify-center text-[#f5d27a] hover:bg-[#d4af37]/20 active:scale-95 transition-all shadow-md"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 text-[#f5d27a]" />
        </button>
      </div>
    </header>
  );
}
