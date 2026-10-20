'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/shared/AppShell';
import { GameHeader } from '@/components/andar-bahar/GameHeader';
import { RecentResultsBar } from '@/components/andar-bahar/RecentResultsBar';
import { SideSelector } from '@/components/andar-bahar/SideSelector';
import { ChipRow } from '@/components/andar-bahar/ChipRow';
import { DealButton } from '@/components/andar-bahar/DealButton';
import { LiveAndarBaharBanner } from '@/components/andar-bahar/LiveAndarBaharBanner';
import { WinnerBanner } from '@/components/andar-bahar/WinnerBanner';
import { AndarBaharStatsSheet } from '@/components/andar-bahar/AndarBaharStatsSheet';
import { AndarBaharSettingsModal } from '@/components/andar-bahar/AndarBaharSettingsModal';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { useGameStore } from '@/lib/shared/useGameStore';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { getExactProbabilities } from '@/lib/andar-bahar/andarBaharEngine';
import { Calculator, Sparkles, BookOpen, TrendingDown, Layers } from 'lucide-react';
import { LiveWinnersChatOverlay } from '@/components/casino/LiveWinnersChatOverlay';

// Dynamically import Three.js 3D Dealer Table with SSR disabled
const DealerTable3D = dynamic(
  () => import('@/components/andar-bahar/DealerTable3D').then((mod) => mod.DealerTable3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/85 space-y-2">
        <div className="w-10 h-10 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#f5d27a]">
          Loading 3D Dealer Table (60 FPS)...
        </span>
      </div>
    ),
  }
);

export default function AndarBaharPage() {
  const selectedSide = useAndarBaharStore((s) => s.selectedSide);
  const selectedChip = useAndarBaharStore((s) => s.selectedChip);
  const config = useAndarBaharStore((s) => s.config);
  const toggleStats = useAndarBaharStore((s) => s.toggleStats);
  const recentResults = useAndarBaharStore((s) => s.recentResults);
  const syncLiveTick = useAndarBaharStore((s) => s.syncLiveTick);
  const livePhase = useAndarBaharStore((s) => s.livePhase);
  const gameState = useAndarBaharStore((s) => s.gameState);
  const liveRoundId = useAndarBaharStore((s) => s.liveRoundId);
  const isResultTime = livePhase === 'settled' || gameState === 'round_settled';

  // Synchronous Live Andar Bahar Loop (100ms tick for sub-second precision countdown & phase syncing)
  React.useEffect(() => {
    syncLiveTick();
    const interval = setInterval(() => {
      syncLiveTick();
    }, 100);
    return () => clearInterval(interval);
  }, [syncLiveTick]);

  // Sync with user's authentic casino coins from database and localStorage
  React.useEffect(() => {
    try {
      const userCoins = localStorage.getItem('playin_user_coins');
      if (userCoins && !isNaN(Number(userCoins))) {
        const amt = Number(userCoins);
        useGameStore.getState().resetBalance(amt);
        useRouletteStore.getState().resetBalance(amt);
      }

      const storedId = localStorage.getItem('playin_user_id') || 'vip_player';
      fetch(`/api/casino/auth?userId=${encodeURIComponent(storedId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.coins !== undefined && data.user.coins !== null) {
            useGameStore.getState().resetBalance(data.user.coins);
            useRouletteStore.getState().resetBalance(data.user.coins);
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
          body: JSON.stringify({ userId: storedId, game: 'ANDAR_BAHAR' }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.andarBahar?.count !== undefined) {
              useAndarBaharStore.setState({ activePlayersCount: data.andarBahar.count });
            }
            if (data?.userCoins !== undefined && data.userCoins !== null) {
              const currentPhase = useAndarBaharStore.getState().livePhase;
              const selectedSide = useAndarBaharStore.getState().selectedSide;
              if (currentPhase === 'betting' && selectedSide === null) {
                const curBal = useGameStore.getState().balance;
                if (curBal !== data.userCoins) {
                  useGameStore.getState().resetBalance(data.userCoins);
                  useRouletteStore.getState().resetBalance(data.userCoins);
                  try {
                    localStorage.setItem('playin_user_coins', String(data.userCoins));
                    localStorage.setItem('playin_coins', String(data.userCoins));
                  } catch {}
                }
              }
            }
          })
          .catch(() => {});
      };

      pingPresence();
      const pInterval = setInterval(pingPresence, 5000);
      return () => clearInterval(pInterval);
    } catch {}
  }, []);

  // Exact mathematical probability
  const exact = getExactProbabilities(config.firstSideRule);
  const winProb = selectedSide === 'BAHAR' ? exact.baharProbability : exact.andarProbability;
  const evPercent = (winProb * config.payoutMultiplier - 1) * 100;

  // Streak detection for Gambler's Fallacy
  let streakCount = 0;
  let streakSide: 'ANDAR' | 'BAHAR' | null = null;
  for (const r of recentResults) {
    if (!streakSide) {
      streakSide = r.winningSide;
      streakCount = 1;
    } else if (r.winningSide === streakSide) {
      streakCount++;
    } else {
      break;
    }
  }

  // Desktop Side Column for Probability Playground
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
              Module 2: Negative Hypergeometric
            </span>
          </div>
        </div>

        {/* Current Table Expected Value Summary */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
            Mathematical Edge ({config.firstSideRule === 'andar_first' ? 'Andar First Rule' : 'Random Toss'})
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
              <span className="text-[10px] text-neutral-400 block font-bold">Selected Side</span>
              <span className="font-black text-sm text-[#f5d27a]">
                {selectedSide}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
              <span className="text-[10px] text-neutral-400 block font-bold">Win Probability</span>
              <span className="font-black text-sm text-white">
                {(winProb * 100).toFixed(2)}%
              </span>
            </div>
            <div className="col-span-2 p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-bold">House Edge / Expected Value:</span>
              <span
                className={`font-black text-xs ${
                  evPercent < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {evPercent > 0 ? `+${evPercent.toFixed(2)}%` : `${evPercent.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Mathematical Proof Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[#f5d27a] font-bold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>Exact Distribution Formula</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-snug">
            Because cards are drawn <em>without replacement</em> from 51 remaining cards (with 3 matching ranks):
          </p>
          <div className="p-2 rounded-xl bg-black/70 border border-amber-500/20 text-center font-mono text-[11px] text-[#f5d27a]">
            P(Step k) = (51 - k)(50 - k) / 41,650
          </div>
          <span className="text-[10px] text-neutral-400 block">
            Expected cards dealt: <strong className="text-white">&mu; = 13.00 cards</strong>
          </span>
        </div>

        {/* Gambler's Fallacy Notice */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-red-500/25 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
            <TrendingDown className="w-4 h-4" />
            <span>Gambler&apos;s Fallacy Tracker</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-tight">
            {streakCount >= 3
              ? `A streak of ${streakCount} consecutive ${streakSide} wins does not make the other side 'due'. Each round is an independent shuffle of 52 cards.`
              : `Each round is independently shuffled. Past results have 0 influence on the next deal.`}
          </p>
        </div>
      </div>

      {/* Button to Open Full Probability Stats Sheet */}
      <button
        type="button"
        onClick={() => toggleStats(true)}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#f5d27a] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-3"
      >
        <Sparkles className="w-4 h-4" />
        <span>Open 100k Simulator & KaTeX</span>
      </button>
    </div>
  );

  return (
    <AppShell sideColumn={desktopSideColumn}>
      {/* 1. Gold-bordered Header */}
      <GameHeader />

      {/* 2. Floating Winner Banner & Confetti */}
      <WinnerBanner />

      {/* 3. Hero 3D Dealer Table (~45% of Screen Height) */}
      <div className="relative w-full h-[42vh] sm:h-[370px] bg-transparent shrink-0 overflow-hidden">
        <DealerTable3D />

        {/* Live Winners Chat Overlay on the video scene (Only at result time till betting opens) */}
        <LiveWinnersChatOverlay game="ANDAR_BAHAR" isResultTime={isResultTime} roundId={liveRoundId} />
      </div>

      {/* Synchronized Live Round Countdown & Status Banner */}
      <LiveAndarBaharBanner />

      {/* 4. Recent Results Bar */}
      <RecentResultsBar />

      {/* 5. Choose Side: ANDAR / BAHAR */}
      <SideSelector />

      {/* 6. Select Bet Amount (Chips) */}
      <ChipRow />

      {/* 7. Deal Button */}
      <DealButton />

      {/* Probability Lab Bottom Sheet / Full Modal */}
      <AndarBaharStatsSheet />

      {/* Settings Modal */}
      <AndarBaharSettingsModal />
    </AppShell>
  );
}
