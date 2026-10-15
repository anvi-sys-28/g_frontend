'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useGameStore } from '@/lib/shared/useGameStore';

// Custom 3D Wheel SVG Icon
function RouletteWheelIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    </svg>
  );
}

// Custom Playing Cards SVG Icon
function PlayingCardsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="12" height="16" x="3" y="5" rx="2" />
      <path d="M7 3h10a2 2 0 0 1 2 2v14" />
      <path d="m9 11 2-2 2 2" />
      <path d="m11 9v6" />
    </svg>
  );
}

export function GameBottomTabs() {
  const pathname = usePathname();
  const toggleAccountModal = useGameStore((s) => s.toggleAccountModal);

  const isRoulette = pathname.startsWith('/roulette');
  const isAndarBahar = pathname.startsWith('/andar-bahar');

  return (
    <nav className="relative z-30 w-full px-3 py-1.5 bg-gradient-to-t from-black via-black/95 to-transparent select-none">
      <div className="flex items-center justify-around h-14 rounded-2xl bg-black/85 backdrop-blur-xl border border-[#d4af37]/50 shadow-[0_4px_25px_rgba(0,0,0,0.9)] px-2">
        {/* Tab 1: Roulette */}
        <Link
          href="/roulette"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            isRoulette
              ? 'text-[#f5d27a] scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isRoulette
                ? 'bg-amber-500/15 ring-1 ring-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : ''
            }`}
          >
            <RouletteWheelIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[10px] font-black tracking-tight mt-0.5 ${
              isRoulette ? 'text-[#f5d27a]' : 'text-neutral-400'
            }`}
          >
            Roulette
          </span>
        </Link>

        {/* Tab 2: Andar Bahar (active tab with red glow and red label when on /andar-bahar) */}
        <Link
          href="/andar-bahar"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            isAndarBahar
              ? 'text-red-400 scale-105'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isAndarBahar
                ? 'bg-red-500/20 ring-1 ring-red-500/70 shadow-[0_0_14px_rgba(239,68,68,0.6)]'
                : ''
            }`}
          >
            <PlayingCardsIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[10px] font-black tracking-tight mt-0.5 ${
              isAndarBahar ? 'text-red-400 font-extrabold drop-shadow' : 'text-neutral-400'
            }`}
          >
            Andar Bahar
          </span>
        </Link>

        {/* Tab 3: Account (user icon) */}
        <button
          type="button"
          onClick={() => toggleAccountModal(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-neutral-200 active:scale-95 transition-all rounded-xl"
        >
          <div className="p-1 rounded-xl hover:bg-white/5 transition-all">
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-black tracking-tight mt-0.5 text-neutral-400">
            Account
          </span>
        </button>
      </div>
    </nav>
  );
}
