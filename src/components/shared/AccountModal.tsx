'use client';

import React from 'react';
import { X, Award, Coins, Sparkles, User, RefreshCw, Plus, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore, ALL_ACHIEVEMENTS } from '@/lib/shared/useGameStore';

export function AccountModal() {
  const accountModalOpen = useGameStore((s) => s.accountModalOpen);
  const toggleAccountModal = useGameStore((s) => s.toggleAccountModal);
  const balance = useGameStore((s) => s.balance);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const achievements = useGameStore((s) => s.achievements);
  const addBalance = useGameStore((s) => s.addBalance);
  const resetBalance = useGameStore((s) => s.resetBalance);

  if (!accountModalOpen) return null;

  // Level progress: XP % 100
  const currentLevelXp = xp % 100;
  const unlockedCount = Object.keys(achievements).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleAccountModal(false);
      }}
    >
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#0c0c0e] border border-[#d4af37]/40 rounded-3xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f5d27a] text-black flex items-center justify-center shadow-lg font-black">
              <User className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                Player Account
              </h2>
              <span className="text-[11px] text-[#f5d27a] font-semibold">
                Probability Playground Profile
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleAccountModal(false)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Balance Card */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#1a150c] to-[#0f0c07] border border-[#d4af37]/50 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Shared Coin Balance
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fff0a0] flex items-center justify-center shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-black font-bold" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  {balance.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#f5d27a]">Coins</span>
              </div>
            </div>

            {/* Quick Balance Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addBalance(1000)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1"
                title="Add 1,000 Coins"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+1k</span>
              </button>
              <button
                type="button"
                onClick={() => resetBalance(2500)}
                className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 hover:border-white/30 text-neutral-300 flex items-center justify-center active:scale-90 transition-all"
                title="Reset Balance to 2,500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Level & XP Progress Card */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-xs">
                  L{level}
                </div>
                <div>
                  <span className="text-xs font-black text-white">Level {level} Scholar</span>
                  <span className="text-[10px] text-neutral-400 block font-semibold">
                    {xp} Total Experience XP
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#f5d27a]">
                {currentLevelXp} / 100 XP
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d27a] transition-all duration-300 rounded-full"
                style={{ width: `${currentLevelXp}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 italic">
              Tip: Earn XP by playing Roulette, Andar Bahar, and predicting probabilities accurately in Predict Mode.
            </p>
          </div>

          {/* Achievements Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#f5d27a]">
                <Award className="w-4 h-4 text-[#f5d27a]" />
                <span>Achievements ({unlockedCount}/{ALL_ACHIEVEMENTS.length})</span>
              </div>
            </div>

            <div className="space-y-2">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const unlocked = Boolean(achievements[ach.id]);
                const unlockedDate = achievements[ach.id]
                  ? new Date(achievements[ach.id]).toLocaleDateString()
                  : null;

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      unlocked
                        ? 'bg-gradient-to-r from-amber-950/30 to-black/60 border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800/80 border border-white/10 flex items-center justify-center text-lg shrink-0">
                        {ach.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-white">{ach.title}</h4>
                          {unlocked && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400">{ach.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      {unlocked ? (
                        <span className="text-[9px] font-bold text-[#f5d27a] block">
                          {unlockedDate}
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-500 inline-block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 shrink-0 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Synced locally across both games</span>
          <button
            type="button"
            onClick={() => toggleAccountModal(false)}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
