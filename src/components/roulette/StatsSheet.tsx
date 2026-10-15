'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingDown,
  Calculator,
  LineChart as LineChartIcon,
  Play,
  Award,
  Sparkles,
  HelpCircle,
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
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import {
  calculateBetProbability,
  calculateTableSummary,
  runSimulation,
  analyzeStreak,
  SimulationStrategy,
  SimulationResult,
  getNumberColor,
} from '@/lib/roulette/rouletteEngine';
import { KaTeXMath } from './KaTeXMath';

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

export function StatsSheet() {
  const statsOpen = useRouletteStore((s) => s.statsOpen);
  const toggleStats = useRouletteStore((s) => s.toggleStats);
  const bets = useRouletteStore((s) => s.bets);
  const wheelType = useRouletteStore((s) => s.wheelType);
  const setWheelType = useRouletteStore((s) => s.setWheelType);
  const recentNumbers = useRouletteStore((s) => s.recentNumbers);
  const predictMode = useRouletteStore((s) => s.predictMode);
  const setPredictMode = useRouletteStore((s) => s.setPredictMode);
  const userPrediction = useRouletteStore((s) => s.userPrediction);
  const setUserPrediction = useRouletteStore((s) => s.setUserPrediction);
  const playerXp = useRouletteStore((s) => s.playerXp);
  const playerLevel = useRouletteStore((s) => s.playerLevel);

  const [activeTab, setActiveTab] = useState<'bets' | 'charts' | 'monte-carlo' | 'math'>('bets');
  const [showMathFormulas, setShowMathFormulas] = useState(true);

  // Monte Carlo simulation state
  const [simStrategy, setSimStrategy] = useState<SimulationStrategy>('flat_red');
  const [simSpins, setSimSpins] = useState<number>(1000);
  const [simResult, setSimResult] = useState<SimulationResult | null>(() =>
    runSimulation('flat_red', 1000, 2500, 50, 'european')
  );

  const activeBetsList = useMemo(() => Object.values(bets), [bets]);
  const tableSummary = useMemo(
    () => calculateTableSummary(activeBetsList, wheelType),
    [activeBetsList, wheelType]
  );
  const streakAnalysis = useMemo(() => analyzeStreak(recentNumbers), [recentNumbers]);

  // Observed Frequencies from spin history
  const observedStats = useMemo(() => {
    let red = 0;
    let black = 0;
    let green = 0;
    let even = 0;
    let odd = 0;

    recentNumbers.forEach((n) => {
      const c = getNumberColor(n);
      if (c === 'red') red++;
      else if (c === 'black') black++;
      else green++;

      if (n !== 0) {
        if (n % 2 === 0) even++;
        else odd++;
      }
    });

    const total = recentNumbers.length || 1;
    return {
      total,
      redPct: (red / total) * 100,
      blackPct: (black / total) * 100,
      greenPct: (green / total) * 100,
      evenPct: (even / total) * 100,
      oddPct: (odd / total) * 100,
    };
  }, [recentNumbers]);

  const handleRunSimulation = () => {
    const res = runSimulation(simStrategy, simSpins, 2500, 50, wheelType);
    setSimResult(res);
  };

  if (!statsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none text-white"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-neutral-950 border border-[#D4AF37]/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#f5d27a] text-black flex items-center justify-center shadow-md">
              <Calculator className="w-4 h-4 font-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Probability Playground Lab
              </h2>
              <span className="text-[10px] text-[#f5d27a] font-bold">
                Module 1: University Roulette Mathematics & Expected Value
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wheel Toggle: European vs American */}
            <div className="flex items-center bg-black/60 rounded-xl p-0.5 border border-white/10 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setWheelType('european')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  wheelType === 'european'
                    ? 'bg-[#D4AF37] text-black font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                EU (2.70%)
              </button>
              <button
                type="button"
                onClick={() => setWheelType('american')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  wheelType === 'american'
                    ? 'bg-[#D4AF37] text-black font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                US (5.26%)
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
            { id: 'bets', label: 'Placed Bets & EV' },
            { id: 'charts', label: 'Frequency Charts' },
            { id: 'monte-carlo', label: 'Monte Carlo Simulation' },
            { id: 'math', label: 'Formulas & Gambler Fallacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#f5d27a]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: PLACED BETS & EV */}
          {activeTab === 'bets' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Total Wager
                  </span>
                  <span className="text-base font-black text-white">
                    {tableSummary.totalWager} Coins
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Table Coverage
                  </span>
                  <span className="text-base font-black text-[#f5d27a]">
                    {tableSummary.coveragePercent} ({tableSummary.totalUniqueNumbersCovered}/
                    {wheelType === 'european' ? '37' : '38'})
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    Total Expected Value
                  </span>
                  <span
                    className={`text-base font-black ${
                      tableSummary.totalExpectedValue < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {tableSummary.totalExpectedValue.toFixed(2)} Coins
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                    House Edge
                  </span>
                  <span className="text-base font-black text-amber-400">
                    {tableSummary.houseEdgePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Predict Mode (Interactive Student Gamification) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-[#D4AF37]/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f5d27a]" />
                    <span className="font-black text-xs text-[#f5d27a] uppercase tracking-wider">
                      Student Predict Mode (Earn XP)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-400">
                      Level {playerLevel} ({playerXp} XP)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPredictMode(!predictMode)}
                      className={`px-2.5 py-1 rounded-lg font-black text-[10px] transition-all ${
                        predictMode
                          ? 'bg-[#D4AF37] text-black shadow-sm'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {predictMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {predictMode && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
                    <p className="text-[11px] text-neutral-300">
                      Estimate your win probability before the wheel spins. The closer you are to
                      the theoretical probability \(P(E)\), the more XP you earn!
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={userPrediction}
                        onChange={(e) => setUserPrediction(Number(e.target.value))}
                        className="flex-1 accent-[#D4AF37] cursor-pointer"
                      />
                      <span className="w-12 text-center font-black text-xs bg-black px-2 py-1 rounded-md border border-[#D4AF37]/40 text-[#f5d27a]">
                        {userPrediction}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bets Table Breakdown */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                  Active Bets Breakdown ({activeBetsList.length})
                </h3>
                {activeBetsList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 text-center text-neutral-400">
                    No bets placed yet. Tap any cell or outside bet on the green felt to analyze
                    probabilities in real time!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-bold uppercase text-[9px]">
                        <tr>
                          <th className="p-2.5">Bet Type</th>
                          <th className="p-2.5">Wager</th>
                          <th className="p-2.5">Numbers</th>
                          <th className="p-2.5">Probability</th>
                          <th className="p-2.5">Payout</th>
                          <th className="p-2.5">EV (Expected Value)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeBetsList.map((bet) => {
                          const info = calculateBetProbability(bet, wheelType);
                          return (
                            <tr key={bet.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-2.5 font-black text-white">{bet.label}</td>
                              <td className="p-2.5 font-bold text-[#f5d27a]">
                                {bet.amount} Coins
                              </td>
                              <td className="p-2.5 text-neutral-300">
                                {info.coveredCount} / {info.totalPockets}
                              </td>
                              <td className="p-2.5 font-black text-emerald-400">
                                {info.probabilityPercent}
                              </td>
                              <td className="p-2.5 font-bold text-neutral-200">
                                {info.payoutOdds}
                              </td>
                              <td className="p-2.5 font-black text-red-400">
                                {info.expectedValueTotal.toFixed(2)} Coins
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FREQUENCY CHARTS */}
          {activeTab === 'charts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#f5d27a] mb-2">
                  Observed vs Theoretical Frequencies ({recentNumbers.length} Total Spins)
                </h3>
                <div className="h-60 w-full">
                  <Bar
                    data={{
                      labels: ['Red', 'Black', 'Green (0)', 'Even', 'Odd'],
                      datasets: [
                        {
                          label: 'Observed %',
                          data: [
                            observedStats.redPct,
                            observedStats.blackPct,
                            observedStats.greenPct,
                            observedStats.evenPct,
                            observedStats.oddPct,
                          ],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(115, 115, 115, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(168, 85, 247, 0.7)',
                          ],
                          borderWidth: 1,
                        },
                        {
                          label: 'Theoretical %',
                          data: [
                            (18 / 37) * 100,
                            (18 / 37) * 100,
                            (1 / 37) * 100,
                            (18 / 37) * 100,
                            (18 / 37) * 100,
                          ],
                          backgroundColor: 'rgba(212, 175, 55, 0.3)',
                          borderColor: '#D4AF37',
                          borderWidth: 1.5,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { color: '#888' },
                          grid: { color: 'rgba(255,255,255,0.05)' },
                        },
                        x: {
                          ticks: { color: '#ccc' },
                          grid: { display: false },
                        },
                      },
                      plugins: {
                        legend: { labels: { color: '#fff', font: { size: 10 } } },
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
                      Monte Carlo Strategy Simulator
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Simulate 1,000 to 10,000 spins instantly to observe Law of Large Numbers &
                      Martingale ruin!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={simStrategy}
                      onChange={(e) => setSimStrategy(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-black border border-white/15 text-white font-bold text-xs"
                    >
                      <option value="flat_red">Flat Bet (Red 50 Coins)</option>
                      <option value="martingale_red">Martingale (Doubling on Loss)</option>
                      <option value="flat_single">Straight Number (35:1)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSimSpins(simSpins === 1000 ? 10000 : 1000)}
                      className="px-2.5 py-1.5 rounded-xl bg-black border border-white/15 text-[#f5d27a] font-black text-xs"
                    >
                      {simSpins} Spins
                    </button>

                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#f5d27a] text-black font-black text-xs uppercase flex items-center gap-1 hover:brightness-110 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Run
                    </button>
                  </div>
                </div>

                {simResult && (
                  <div className="space-y-3 pt-2">
                    {/* Stat Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">End Balance</span>
                        <span
                          className={`font-black text-sm ${
                            simResult.endingBalance < simResult.startingBalance
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {Math.round(simResult.endingBalance)} Coins
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Peak Bankroll</span>
                        <span className="font-black text-sm text-emerald-400">
                          {Math.round(simResult.peakBalance)} Coins
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Lowest Dip</span>
                        <span className="font-black text-sm text-red-400">
                          {Math.round(simResult.lowestBalance)} Coins
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                        <span className="text-[9px] text-neutral-400 block font-bold">Ruin Status</span>
                        <span
                          className={`font-black text-sm ${
                            simResult.ruinSpin !== null ? 'text-red-500' : 'text-emerald-400'
                          }`}
                        >
                          {simResult.ruinSpin !== null
                            ? `Ruined at Spin #${simResult.ruinSpin}`
                            : 'Survived'}
                        </span>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-60 w-full pt-1">
                      <Line
                        data={{
                          labels: simResult.history.map((h) => `#${h.spinIndex}`),
                          datasets: [
                            {
                              label: 'Bankroll Path',
                              data: simResult.history.map((h) => h.balance),
                              borderColor: '#D4AF37',
                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                              fill: true,
                              pointRadius: 0,
                              borderWidth: 1.5,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
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

          {/* TAB 4: FORMULAS & GAMBLER'S FALLACY */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              {/* Gambler's Fallacy Notice */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                    Gambler&apos;s Fallacy Detection & Independent Trials
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {streakAnalysis.explanation}
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-[#f5d27a]">
                  Conditional Probability:
                  <div className="mt-1">
                    <KaTeXMath
                      math="P(E_{t+1} = \text{Red} \mid E_t = \text{Red}, \dots, E_{t-k} = \text{Red}) = P(E_{t+1} = \text{Red}) = \frac{18}{37} \approx 48.65\%"
                      displayMode
                    />
                  </div>
                </div>
              </div>

              {/* KaTeX Collapsible Mathematics */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowMathFormulas(!showMathFormulas)}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-[#f5d27a]">
                    Roulette Probability & Expected Value Proofs
                  </span>
                  {showMathFormulas ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>

                {showMathFormulas && (
                  <div className="space-y-3 text-[11px] text-neutral-300 pt-2 border-t border-white/10">
                    <div>
                      <h4 className="font-bold text-white mb-1">1. Probability of an Event:</h4>
                      <KaTeXMath
                        math="P(A) = \frac{|A|}{|\Omega|} = \frac{k}{37} \quad (\text{European Wheel})"
                        displayMode
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-1">2. Expected Value:</h4>
                      <p className="text-neutral-400 text-[10px] mb-1">
                        For any wager with stake S, win probability p, and payout multiplier r:
                      </p>
                      <KaTeXMath
                        math="\mathbb{E}[X] = p \cdot (S \cdot r) - (1 - p) \cdot S = S \cdot [p(r + 1) - 1]"
                        displayMode
                      />
                      <p className="text-neutral-400 text-[10px] mt-1">
                        For European Straight bet (p = 1/37, r = 35):
                      </p>
                      <KaTeXMath
                        math="\mathbb{E}[X] = S \cdot \left[\frac{1}{37} \cdot 36 - 1\right] = -\frac{1}{37} \cdot S \approx -0.027027 \cdot S"
                        displayMode
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-1">3. House Edge:</h4>
                      <KaTeXMath
                        math="\text{HE} = -\frac{\mathbb{E}[X]}{S} = \frac{1}{37} \approx 2.70\% \quad (\text{US 00 Wheel: } \frac{2}{38} \approx 5.26\%)"
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
