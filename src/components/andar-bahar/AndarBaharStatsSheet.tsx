'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  Play,
  Sparkles,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { useGameStore } from '@/lib/shared/useGameStore';
import {
  getProbabilityAtStep,
  getExactProbabilities,
  runABSimulation,
  getNextCardMatchProbability,
  ABSimulationResult,
} from '@/lib/andar-bahar/andarBaharEngine';
import { KaTeXMath } from '../roulette/KaTeXMath';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AndarBaharStatsSheet() {
  const statsOpen = useAndarBaharStore((s) => s.statsOpen);
  const toggleStats = useAndarBaharStore((s) => s.toggleStats);
  const config = useAndarBaharStore((s) => s.config);
  const setFirstSideRule = useAndarBaharStore((s) => s.setFirstSideRule);
  const recentResults = useAndarBaharStore((s) => s.recentResults);
  const predictMode = useAndarBaharStore((s) => s.predictMode);
  const setPredictMode = useAndarBaharStore((s) => s.setPredictMode);
  const userPrediction = useAndarBaharStore((s) => s.userPrediction);
  const setUserPrediction = useAndarBaharStore((s) => s.setUserPrediction);

  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);

  const [activeTab, setActiveTab] = useState<'probabilities' | 'distribution' | 'monte-carlo' | 'sampling' | 'math'>('probabilities');
  const [showMath, setShowMath] = useState(true);

  // Sampling without replacement interactive demo
  const [drawnCardsCount, setDrawnCardsCount] = useState<number>(0);

  // Monte Carlo simulation state
  const [simRounds, setSimRounds] = useState<number>(10000);
  const [simResult, setSimResult] = useState<ABSimulationResult | null>(() =>
    runABSimulation(10000, 'ANDAR', 50, 2500, config.firstSideRule)
  );

  const exactProb = useMemo(() => getExactProbabilities(config.firstSideRule), [config.firstSideRule]);

  // Theoretical card distribution data for steps 1..30
  const distributionData = useMemo(() => {
    const labels: string[] = [];
    const probs: number[] = [];
    for (let k = 1; k <= 30; k++) {
      labels.push(`${k}`);
      probs.push(getProbabilityAtStep(k) * 100);
    }
    return { labels, probs };
  }, []);

  // Observed frequencies
  const observedStats = useMemo(() => {
    let andar = 0;
    let bahar = 0;
    recentResults.forEach((r) => {
      if (r.winningSide === 'ANDAR') andar++;
      else bahar++;
    });
    const total = recentResults.length || 1;
    return {
      total,
      andarRate: (andar / total) * 100,
      baharRate: (bahar / total) * 100,
    };
  }, [recentResults]);

  // Gambler's Fallacy Streak Analysis
  const streak = useMemo(() => {
    let count = 0;
    let side: 'ANDAR' | 'BAHAR' | null = null;
    for (const r of recentResults) {
      if (!side) {
        side = r.winningSide;
        count = 1;
      } else if (r.winningSide === side) {
        count++;
      } else {
        break;
      }
    }
    return { count, side };
  }, [recentResults]);

  const handleRunSim = () => {
    const res = runABSimulation(simRounds, 'ANDAR', 50, 2500, config.firstSideRule);
    setSimResult(res);
  };

  if (!statsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none text-white"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-neutral-950 border border-[#d4af37]/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f5d27a] text-black flex items-center justify-center shadow-md font-black">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Probability Playground Lab
              </h2>
              <span className="text-[10px] text-[#f5d27a] font-bold">
                Module 2: Negative Hypergeometric Law & Andar Bahar Edge
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* First Side Rule Toggle */}
            <div className="flex items-center bg-black/60 rounded-xl p-0.5 border border-white/10 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setFirstSideRule('random')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  config.firstSideRule === 'random'
                    ? 'bg-[#d4af37] text-black font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Fair 50/50 Deal (Random First Toss)"
              >
                Fair 50%
              </button>
              <button
                type="button"
                onClick={() => setFirstSideRule('andar_first')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  config.firstSideRule === 'andar_first'
                    ? 'bg-[#d4af37] text-black font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Traditional Rule (Andar Deals First: 51.5%)"
              >
                Andar 1st (51.5%)
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleStats(false)}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-black/40 px-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'probabilities', label: 'Exact Odds & EV' },
            { id: 'distribution', label: 'Cards Distribution (μ=13)' },
            { id: 'monte-carlo', label: 'Monte Carlo 100k' },
            { id: 'sampling', label: 'Sampling Without Replacement' },
            { id: 'math', label: 'Show The Math' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#d4af37] text-[#f5d27a]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: EXACT PROBABILITIES & EV */}
          {activeTab === 'probabilities' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Andar Win Prob
                  </span>
                  <span className="text-base font-black text-[#f5d27a]">
                    {(exactProb.andarProbability * 100).toFixed(2)}%
                  </span>
                  <span className="text-[9px] text-neutral-500 block">
                    {config.firstSideRule === 'andar_first' ? '10,725 / 20,825' : 'Fair 1/2'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Bahar Win Prob
                  </span>
                  <span className="text-base font-black text-white">
                    {(exactProb.baharProbability * 100).toFixed(2)}%
                  </span>
                  <span className="text-[9px] text-neutral-500 block">
                    {config.firstSideRule === 'andar_first' ? '10,100 / 20,825' : 'Fair 1/2'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    House Edge (1.95x)
                  </span>
                  <span className="text-base font-black text-amber-400">
                    {config.firstSideRule === 'random' ? '2.50%' : 'Andar: -0.43% | Bahar: +5.43%'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Expected Cards Dealt
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    13.0 Cards
                  </span>
                  <span className="text-[9px] text-neutral-500 block">
                    μ = (51+1)/(3+1)
                  </span>
                </div>
              </div>

              {/* Predict Mode */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-[#d4af37]/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f5d27a]" />
                    <span className="font-black text-xs text-[#f5d27a] uppercase tracking-wider">
                      Student Predict Mode (Earn Shared XP)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-400">
                      Level {level} ({xp} XP)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPredictMode(!predictMode)}
                      className={`px-2.5 py-1 rounded-lg font-black text-[10px] transition-all ${
                        predictMode ? 'bg-[#d4af37] text-black shadow-sm' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {predictMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {predictMode && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
                    <p className="text-[11px] text-neutral-300">
                      Predict the probability of your side winning. Under random first-deal, both sides
                      are mathematically 50%.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={userPrediction}
                        onChange={(e) => setUserPrediction(Number(e.target.value))}
                        className="flex-1 accent-[#d4af37] cursor-pointer"
                      />
                      <span className="w-12 text-center font-black text-xs bg-black px-2 py-1 rounded-md border border-[#d4af37]/40 text-[#f5d27a]">
                        {userPrediction}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CARDS DEALT DISTRIBUTION */}
          {activeTab === 'distribution' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#f5d27a] mb-1">
                  Negative Hypergeometric Distribution P(k)
                </h3>
                <p className="text-[10px] text-neutral-400 mb-3">
                  Probability of the first matching card appearing at deal position k. Notice the
                  highest probability is card 1 (3/51 ≈ 5.88%), decreasing exponentially toward 0.
                </p>
                <div className="h-60 w-full">
                  <Bar
                    data={{
                      labels: distributionData.labels,
                      datasets: [
                        {
                          label: 'Probability %',
                          data: distributionData.probs,
                          backgroundColor: 'rgba(212, 175, 55, 0.7)',
                          borderColor: '#d4af37',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { color: '#888' },
                          grid: { color: 'rgba(255,255,255,0.05)' },
                        },
                        x: {
                          ticks: { color: '#ccc' },
                          grid: { display: false },
                        },
                      },
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTE CARLO SIMULATION */}
          {activeTab === 'monte-carlo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#f5d27a]">
                      Monte Carlo Law of Large Numbers
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Simulate 10,000 to 100,000 rounds to watch empirical win rates converge to 50%!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSimRounds(simRounds === 10000 ? 100000 : 10000)}
                      className="px-2.5 py-1.5 rounded-xl bg-black border border-white/15 text-[#f5d27a] font-black text-xs"
                    >
                      {simRounds.toLocaleString()} Rounds
                    </button>

                    <button
                      type="button"
                      onClick={handleRunSim}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black font-black text-xs uppercase flex items-center gap-1 hover:brightness-110 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Run
                    </button>
                  </div>
                </div>

                {simResult && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Andar Win Rate</span>
                        <span className="font-black text-sm text-[#f5d27a]">
                          {simResult.andarWinRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Bahar Win Rate</span>
                        <span className="font-black text-sm text-white">
                          {simResult.baharWinRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Avg Cards Dealt</span>
                        <span className="font-black text-sm text-emerald-400">
                          {simResult.averageCardsDealt.toFixed(1)} Cards
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Ending Balance</span>
                        <span
                          className={`font-black text-sm ${
                            simResult.finalBalance < 2500 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {simResult.finalBalance} Coins
                        </span>
                      </div>
                    </div>

                    <div className="h-60 w-full pt-1">
                      <Line
                        data={{
                          labels: simResult.historyConvergence.map((h) => `#${h.round}`),
                          datasets: [
                            {
                              label: 'Andar Win Rate %',
                              data: simResult.historyConvergence.map((h) => h.runningAndarRate),
                              borderColor: '#d4af37',
                              borderWidth: 2,
                              pointRadius: 0,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              min: 40,
                              max: 60,
                              ticks: { color: '#888' },
                              grid: { color: 'rgba(255,255,255,0.05)' },
                            },
                            x: {
                              ticks: { color: '#888', maxTicksLimit: 10 },
                              grid: { display: false },
                            },
                          },
                          plugins: {
                            legend: { display: false },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLING WITHOUT REPLACEMENT DEMO */}
          {activeTab === 'sampling' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#f5d27a]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#f5d27a]">
                    Sampling Without Replacement Demo
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Unlike roulette where each spin is <strong>independent</strong> (
                  <KaTeXMath math="P(\text{Red}) = \frac{18}{37}" /> always), cards in Andar Bahar
                  are drawn <strong>without replacement</strong>. Each non-matching card drawn
                  depletes the remaining pool, steadily increasing the probability of a match on the
                  very next draw!
                </p>

                {/* Interactive Card Puller */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-bold">Non-Matching Cards Drawn:</span>
                      <span className="text-lg font-black text-white">{drawnCardsCount} Cards</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-bold">Probability of Match on Next Card:</span>
                      <span className="text-xl font-black text-[#f5d27a]">
                        {getNextCardMatchProbability(drawnCardsCount).probabilityFraction} &approx;{' '}
                        {(getNextCardMatchProbability(drawnCardsCount).probability * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={drawnCardsCount >= 48}
                      onClick={() => setDrawnCardsCount((c) => Math.min(48, c + 1))}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black font-black text-xs active:scale-95 disabled:opacity-40"
                    >
                      Draw 1 Non-Matching Card (+1)
                    </button>
                    <button
                      type="button"
                      disabled={drawnCardsCount >= 44}
                      onClick={() => setDrawnCardsCount((c) => Math.min(48, c + 5))}
                      className="px-3 py-2 rounded-xl bg-neutral-800 text-white font-bold text-xs active:scale-95 disabled:opacity-40"
                    >
                      +5 Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawnCardsCount(0)}
                      className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-bold text-xs active:scale-95"
                    >
                      Reset Deck
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FORMULAS & GAMBLER'S FALLACY */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              {/* Gambler's Fallacy Notice */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                    Gambler&apos;s Fallacy in Andar Bahar
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {streak.count >= 3
                    ? `Notice: After ${streak.count} consecutive ${streak.side} rounds, the new round still reshuffles a full 52-card deck! Under the fair toss rule, P(Next = ${streak.side}) is strictly 50%. The cards have no memory of past rounds.`
                    : 'A new round always reshuffles a full 52-card deck, making each round independent. Past winning sides do not alter the 50% probability of the next round.'}
                </p>
              </div>

              {/* KaTeX Proofs */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowMath(!showMath)}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-[#f5d27a]">
                    Negative Hypergeometric Probability Proofs
                  </span>
                  {showMath ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {showMath && (
                  <div className="space-y-3 text-[11px] text-neutral-300 pt-2 border-t border-white/10">
                    <div>
                      <h4 className="font-bold text-white mb-1">1. Negative Hypergeometric Law:</h4>
                      <p className="text-neutral-400 text-[10px] mb-1">
                        Out of 51 remaining cards, 3 match the opening card rank. The probability the first match is at position k:
                      </p>
                      <KaTeXMath
                        math="P(K = k) = \frac{\binom{51 - k}{2}}{\binom{51}{3}} = \frac{3 \cdot (51 - k)(50 - k)}{51 \cdot 50 \cdot 49} = \frac{(51 - k)(50 - k)}{41650}"
                        displayMode
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-1">2. Expected Number of Dealt Cards:</h4>
                      <KaTeXMath
                        math="\mathbb{E}[K] = \frac{51 + 1}{3 + 1} = \frac{52}{4} = 13 \text{ cards}"
                        displayMode
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-1">3. Conditional Advantage under Andar-First:</h4>
                      <KaTeXMath
                        math="P(\text{Andar Wins}) = \sum_{m=1}^{25} P(2m - 1) = \frac{10725}{20825} \approx 51.5006\%"
                        displayMode
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
