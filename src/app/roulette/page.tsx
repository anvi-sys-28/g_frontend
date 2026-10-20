'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/shared/AppShell';
import { Header } from '@/components/roulette/Header';
import { LastResultsCard } from '@/components/roulette/LastResultsCard';
import { LiveCountdownBanner } from '@/components/roulette/LiveCountdownBanner';
import { BettingTable } from '@/components/roulette/BettingTable';
import { ChipSelector } from '@/components/roulette/ChipSelector';
import { ActionBar } from '@/components/roulette/ActionBar';
import { RecentResults } from '@/components/roulette/RecentResults';
import { WinningBadge } from '@/components/roulette/WinningBadge';
import { StatsSheet } from '@/components/roulette/StatsSheet';
import { SettingsModal } from '@/components/roulette/SettingsModal';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { useGameStore } from '@/lib/shared/useGameStore';
import {
  calculateTableSummary,
  analyzeStreak,
  EUROPEAN_NUMBERS,
} from '@/lib/roulette/rouletteEngine';
import { Calculator, Sparkles, TrendingDown, BookOpen } from 'lucide-react';
import { LiveWinnersChatOverlay } from '@/components/casino/LiveWinnersChatOverlay';

// Dynamically import Three.js 3D Wheel with SSR disabled
const RouletteWheel3D = dynamic(
  () => import('@/components/roulette/RouletteWheel3D').then((mod) => mod.RouletteWheel3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 space-y-2">
        <div className="w-10 h-10 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#f5d27a]">
          Loading 3D Roulette Engine (60 FPS)...
        </span>
      </div>
    ),
  }
);

export default function RoulettePage() {
  const bets = useRouletteStore((s) => s.bets);
  const wheelType = useRouletteStore((s) => s.wheelType);
  const recentNumbers = useRouletteStore((s) => s.recentNumbers);
  const toggleStats = useRouletteStore((s) => s.toggleStats);
  const syncLiveTick = useRouletteStore((s) => s.syncLiveTick);
  const livePhase = useRouletteStore((s) => s.livePhase);
  const spinState = useRouletteStore((s) => s.spinState);
  const liveRoundId = useRouletteStore((s) => s.liveRoundId);
  const isResultTime = livePhase === 'settled' || spinState === 'settled';

  const activeBetsList = Object.values(bets);
  const summary = calculateTableSummary(activeBetsList, wheelType);
  const streak = analyzeStreak(recentNumbers);

  // Synchronous Live Roulette Loop (100ms tick for sub-second precision countdown & phase syncing)
  useEffect(() => {
    syncLiveTick();
    const interval = setInterval(() => {
      syncLiveTick();
    }, 100);
    return () => clearInterval(interval);
  }, [syncLiveTick]);

  // Sync with user's authentic casino coins from database and localStorage
  useEffect(() => {
    try {
      const userCoins = localStorage.getItem('playin_user_coins');
      if (userCoins && !isNaN(Number(userCoins))) {
        const amt = Number(userCoins);
        useRouletteStore.getState().resetBalance(amt);
        useGameStore.getState().resetBalance(amt);
      }

      const storedId = localStorage.getItem('playin_user_id') || 'vip_player';
      fetch(`/api/casino/auth?userId=${encodeURIComponent(storedId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.coins !== undefined && data.user.coins !== null) {
            useRouletteStore.getState().resetBalance(data.user.coins);
            useGameStore.getState().resetBalance(data.user.coins);
            try {
              localStorage.setItem('playin_user_coins', String(data.user.coins));
            } catch {}
          }
        })
        .catch(() => {});

      // Authentic online presence heartbeat
      const pingPresence = () => {
        fetch('/api/casino/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: storedId, game: 'ROULETTE' }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.roulette?.count !== undefined) {
              useRouletteStore.setState({ activePlayersCount: data.roulette.count });
            }
          })
          .catch(() => {});
      };

      pingPresence();
      const pInterval = setInterval(pingPresence, 5000);
      return () => clearInterval(pInterval);
    } catch {}
    if (typeof window !== 'undefined') {
      (window as any).__useRouletteStore = useRouletteStore;
    }
  }, []);

  // Desktop Probability Playground Side Column
  const desktopSideColumn = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Side Column Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#f5d27a] text-black flex items-center justify-center shadow-lg font-black">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Probability Lab</h2>
            <span className="text-[11px] text-[#f5d27a] font-bold">
              Module 1: Roulette Distribution
            </span>
          </div>
        </div>

        {/* Real-Time Table Expected Value Summary */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
            Current Table Probabilities
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
              <span className="text-[10px] text-neutral-400 block font-bold">Total Bet</span>
              <span className="font-black text-sm text-white">
                {summary.totalWager} Coins
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
              <span className="text-[10px] text-neutral-400 block font-bold">Coverage</span>
              <span className="font-black text-sm text-[#f5d27a]">
                {summary.coveragePercent}
              </span>
            </div>
            <div className="col-span-2 p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-bold">Expected Value (EV):</span>
              <span
                className={`font-black text-xs ${
                  summary.totalExpectedValue < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {summary.totalExpectedValue.toFixed(2)} Coins
              </span>
            </div>
          </div>
        </div>

        {/* Gambler's Fallacy Notice */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-red-500/25 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
            <TrendingDown className="w-4 h-4" />
            <span>Gambler&apos;s Fallacy Tracker</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-tight">
            {streak.explanation}
          </p>
          <div className="text-[10px] text-amber-300 font-mono pt-1">
            P(Next = Red) = 18/37 (48.65%)
          </div>
        </div>

        {/* Quick Probability Rules */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[#f5d27a] font-bold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>The Mathematical House Edge</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-snug">
            The single green zero (0) ensures all standard bets in European Roulette carry a
            uniform house edge of{' '}
            <strong className="text-white">
              1/37 &approx; 2.7027%
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Bottom Button to Open Full Modal */}
      <button
        type="button"
        onClick={() => toggleStats(true)}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#f5d27a] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-3"
      >
        <Sparkles className="w-4 h-4" />
        <span>Open Advanced Simulator & KaTeX</span>
      </button>
    </div>
  );

  return (
    <AppShell sideColumn={desktopSideColumn}>
      {/* Top Header */}
      <Header />

      {/* Winning Badge Overlay */}
      <WinningBadge />

      {/* Hero 3D Scene (~40% of Screen Height) */}
      <div className="relative w-full h-[36vh] sm:h-[320px] bg-transparent shrink-0 overflow-hidden">
        <RouletteWheel3D />

        {/* Live Winners Chat Overlay on the video scene (Only at result time till betting opens) */}
        <LiveWinnersChatOverlay game="ROULETTE" isResultTime={isResultTime} roundId={liveRoundId} />

        {/* Last Results Glass Card on Top Right */}
        <LastResultsCard />
      </div>

      {/* Synchronized Live Round Countdown & Status Banner */}
      <LiveCountdownBanner />

      {/* Interactive Betting Table Felt (Landscape orientation) */}
      <div className="flex-1 flex flex-col justify-center py-1">
        <BettingTable />
      </div>

      {/* Controls: Chip Selector, Action Bar & Recent Results */}
      <div className="shrink-0 space-y-1 pb-24 sm:pb-2 bg-transparent">
        {/* Chip Selector Row */}
        <ChipSelector />

        {/* Action Row: Clear All, Dominant Gold SPIN, Repeat */}
        <ActionBar />

        {/* Recent Results Row */}
        <RecentResults />
      </div>

      {/* Full Screen / Bottom Sheet Probability Lab Modal */}
      <StatsSheet />

      {/* Settings Modal */}
      <SettingsModal />
    </AppShell>
  );
}
