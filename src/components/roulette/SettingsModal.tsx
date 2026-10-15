'use client';

import React from 'react';
import { X, Volume2, VolumeX, Zap, RotateCcw, ShieldCheck, HelpCircle } from 'lucide-react';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { PAYOUT_RATIOS } from '@/lib/roulette/rouletteEngine';

export function SettingsModal() {
  const settingsOpen = useRouletteStore((s) => s.settingsOpen);
  const toggleSettings = useRouletteStore((s) => s.toggleSettings);
  const isSoundMuted = useRouletteStore((s) => s.isSoundMuted);
  const toggleSound = useRouletteStore((s) => s.toggleSound);
  const fastSpin = useRouletteStore((s) => s.fastSpin);
  const setFastSpin = useRouletteStore((s) => s.setFastSpin);
  const wheelType = useRouletteStore((s) => s.wheelType);
  const setWheelType = useRouletteStore((s) => s.setWheelType);
  const resetBalance = useRouletteStore((s) => s.resetBalance);

  if (!settingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none text-white"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-950 border border-[#D4AF37]/50 p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-black text-white">Live Roulette Settings</h2>
              <span className="text-[10px] text-neutral-400">Game Preferences & Table Options</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleSettings(false)}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 text-xs">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-white/5">
            <div className="flex items-center gap-2.5">
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#f5d27a]" />
              )}
              <div>
                <span className="font-bold block text-white">Sound Effects & Haptics</span>
                <span className="text-[10px] text-neutral-400">Wheel spin, ball clatter, chips</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all ${
                !isSoundMuted
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {!isSoundMuted ? 'ON' : 'MUTED'}
            </button>
          </div>

          {/* Fast Spin */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold block text-white">Fast Spin Animation</span>
                <span className="text-[10px] text-neutral-400">2.5s quick spin instead of 6s live</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFastSpin(!fastSpin)}
              className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all ${
                fastSpin
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {fastSpin ? 'FAST' : 'REALISTIC'}
            </button>
          </div>

          {/* Wheel Type */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-white/5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold block text-white">Roulette Wheel Variant</span>
                <span className="text-[10px] text-neutral-400">
                  {wheelType === 'european' ? 'European Single Zero (2.70%)' : 'American Double Zero 00 (5.26%)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWheelType(wheelType === 'european' ? 'american' : 'european')}
              className="px-3 py-1.5 rounded-xl font-black text-[11px] bg-neutral-800 text-[#f5d27a] border border-white/10 hover:border-[#D4AF37]"
            >
              {wheelType === 'european' ? 'European' : 'American'}
            </button>
          </div>

          {/* Reset Balance */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-white/5">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-neutral-300" />
              <div>
                <span className="font-bold block text-white">Reset Bankroll</span>
                <span className="text-[10px] text-neutral-400">Restore starting 2,500 coins</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetBalance(2500);
                toggleSettings(false);
              }}
              className="px-3 py-1.5 rounded-xl font-black text-[11px] bg-red-950/60 text-red-300 border border-red-500/30 hover:bg-red-900/60"
            >
              Reset 2,500
            </button>
          </div>

          {/* Payout Reference Summary */}
          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-neutral-400 font-bold text-[10px] uppercase">
              <HelpCircle className="w-3.5 h-3.5 text-[#f5d27a]" />
              <span>Official Payout Reference</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-neutral-300">
              <div>Straight Up: <span className="font-bold text-[#f5d27a]">35:1</span></div>
              <div>Split: <span className="font-bold text-[#f5d27a]">17:1</span></div>
              <div>Street: <span className="font-bold text-[#f5d27a]">11:1</span></div>
              <div>Corner: <span className="font-bold text-[#f5d27a]">8:1</span></div>
              <div>Six Line: <span className="font-bold text-[#f5d27a]">5:1</span></div>
              <div>Column / Dozen: <span className="font-bold text-[#f5d27a]">2:1</span></div>
              <div>Red / Black: <span className="font-bold text-[#f5d27a]">1:1</span></div>
              <div>Even / Odd: <span className="font-bold text-[#f5d27a]">1:1</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
