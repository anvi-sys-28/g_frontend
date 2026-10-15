'use client';

import React from 'react';
import { X, Settings, Volume2, FastForward, Sliders, RotateCcw } from 'lucide-react';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { useGameStore } from '@/lib/shared/useGameStore';

export function AndarBaharSettingsModal() {
  const settingsOpen = useAndarBaharStore((s) => s.settingsOpen);
  const toggleSettings = useAndarBaharStore((s) => s.toggleSettings);
  const config = useAndarBaharStore((s) => s.config);
  const setFirstSideRule = useAndarBaharStore((s) => s.setFirstSideRule);
  const setPayoutMultiplier = useAndarBaharStore((s) => s.setPayoutMultiplier);
  const skipAnimation = useAndarBaharStore((s) => s.skipAnimation);
  const setSkipAnimation = useAndarBaharStore((s) => s.setSkipAnimation);
  const resetBalance = useGameStore((s) => s.resetBalance);

  if (!settingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleSettings(false);
      }}
    >
      <div className="relative w-full max-w-sm bg-[#0e0e11] border border-[#d4af37]/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f5d27a] text-black flex items-center justify-center">
              <Settings className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Game Settings</h3>
              <span className="text-[10px] text-[#f5d27a] font-semibold">
                Rules & Table Simulation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleSettings(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Setting 1: First Deal Rule */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-neutral-300 block">
            First Card Deal Rule
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFirstSideRule('andar_first')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.firstSideRule === 'andar_first'
                  ? 'bg-amber-950/40 border-[#d4af37] text-white'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-black block">Andar First</span>
              <span className="text-[9px] text-amber-300 font-mono block mt-0.5">
                51.50% vs 48.50%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFirstSideRule('random')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.firstSideRule === 'random'
                  ? 'bg-amber-950/40 border-[#d4af37] text-white'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-black block">Random Toss</span>
              <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                Exact 50.00% / 50.00%
              </span>
            </button>
          </div>
        </div>

        {/* Setting 2: Payout Multiplier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-300">
              Payout Multiplier
            </label>
            <span className="text-xs font-black text-[#f5d27a]">
              {config.payoutMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1.90, 1.95, 2.00].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setPayoutMultiplier(mult)}
                className={`py-2 rounded-xl border text-xs font-black transition-all ${
                  Math.abs(config.payoutMultiplier - mult) < 0.01
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black border-[#fff0a0]'
                    : 'bg-black/40 border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                {mult.toFixed(2)}x
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Fast Animation Mode */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/60 border border-white/5">
          <div className="flex items-center gap-2.5">
            <FastForward className="w-4 h-4 text-[#f5d27a]" />
            <div>
              <span className="text-xs font-black text-white block">Skip Animation</span>
              <span className="text-[10px] text-neutral-400">Instantly resolve card deals</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSkipAnimation(!skipAnimation)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              skipAnimation ? 'bg-[#d4af37]' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                skipAnimation ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Reset Balance */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              resetBalance(2500);
              toggleSettings(false);
            }}
            className="w-full py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Wallet to 2,500 Coins</span>
          </button>
        </div>
      </div>
    </div>
  );
}
