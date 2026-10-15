'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Settings,
  Plus,
  Coins,
  BarChart3,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { useGameStore } from '@/lib/shared/useGameStore';

export function Header() {
  const balance = useRouletteStore((s) => s.balance);
  const isSoundMuted = useRouletteStore((s) => s.isSoundMuted);
  const toggleSound = useRouletteStore((s) => s.toggleSound);
  const toggleStats = useRouletteStore((s) => s.toggleStats);
  const toggleSettings = useRouletteStore((s) => s.toggleSettings);
  const toggleRequestCoinsModal = useGameStore((s) => s.toggleRequestCoinsModal);

  return (
    <header className="relative z-30 flex items-center justify-between px-3 py-2.5 bg-black/25 backdrop-blur-xs border-b border-[#D4AF37]/20">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/casino"
          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 flex items-center justify-center text-[#f5d27a] hover:bg-[#D4AF37]/20 active:scale-95 transition-all shadow-md shadow-black/60"
          aria-label="Back to Casino"
        >
          <ChevronLeft className="w-5 h-5 text-[#f5d27a]" />
        </Link>

        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-white drop-shadow">
            Live Roulette
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

      {/* Right: Balance Pill & Controls */}
      <div className="flex items-center gap-1.5">
        {/* Coin Balance Pill matching screenshot */}
        <div className="flex items-center h-8 pl-2.5 pr-1 rounded-xl bg-black/70 backdrop-blur-md border border-[#D4AF37]/50 shadow-md shadow-black/40">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF0A0] flex items-center justify-center shadow-sm">
              <Coins className="w-2.5 h-2.5 text-black font-bold" />
            </div>
            <span className="text-xs font-black tracking-tight text-white">
              {balance.toLocaleString()} <span className="text-[10px] text-[#f5d27a] font-semibold">Coins</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleRequestCoinsModal(true)}
            className="w-6 h-6 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#f5d27a] text-black flex items-center justify-center hover:brightness-110 active:scale-90 transition-all font-black text-xs shadow-sm cursor-pointer"
            title="Request Coins from Admin"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Stats Button */}
        <button
          type="button"
          onClick={() => toggleStats()}
          className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-[#D4AF37]/40 active:scale-95 transition-all shadow-md shadow-black/60"
          title="University Probability Lab & Stats"
        >
          <BarChart3 className="w-4 h-4 text-[#f5d27a]" />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-[#D4AF37]/40 active:scale-95 transition-all shadow-md shadow-black/60"
          title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isSoundMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#f5d27a]" />
          )}
        </button>

        {/* Settings Gear */}
        <button
          type="button"
          onClick={() => toggleSettings()}
          className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-300 hover:text-[#f5d27a] hover:border-[#D4AF37]/40 active:scale-95 transition-all shadow-md shadow-black/60"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 text-[#f5d27a]" />
        </button>
      </div>
    </header>
  );
}
