/**
 * Pure Game Logic and Probability Calculations for Live 3D Roulette
 * Module 1 of "Probability Playground"
 */

export type WheelType = 'european' | 'american';

export const EUROPEAN_NUMBERS: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const AMERICAN_NUMBERS: (number | string)[] = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

export const BLACK_NUMBERS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
]);

export function getNumberColor(num: number | string): 'red' | 'black' | 'green' {
  if (num === 0 || num === '00' || num === '0') return 'green';
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (RED_NUMBERS.has(n)) return 'red';
  if (BLACK_NUMBERS.has(n)) return 'black';
  return 'green';
}

export type BetType =
  | 'straight'
  | 'split'
  | 'street'
  | 'corner'
  | 'line'
  | 'column_1'
  | 'column_2'
  | 'column_3'
  | 'dozen_1'
  | 'dozen_2'
  | 'dozen_3'
  | 'low'
  | 'high'
  | 'even'
  | 'odd'
  | 'red'
  | 'black';

export interface PlacedBet {
  id: string; // unique key, e.g. "straight-7", "split-1-2", "red"
  type: BetType;
  label: string;
  numbers: number[]; // numbers covered by this bet
  amount: number;
  chips: { [value: number]: number }; // breakdown of chips
}

export interface PayoutRule {
  ratio: number; // e.g. 35 for 35:1
  description: string;
}

export const PAYOUT_RATIOS: Record<BetType, PayoutRule> = {
  straight: { ratio: 35, description: '35:1 Straight Up' },
  split: { ratio: 17, description: '17:1 Split' },
  street: { ratio: 11, description: '11:1 Street' },
  corner: { ratio: 8, description: '8:1 Corner' },
  line: { ratio: 5, description: '5:1 Six Line' },
  column_1: { ratio: 2, description: '2:1 1st Column' },
  column_2: { ratio: 2, description: '2:1 2nd Column' },
  column_3: { ratio: 2, description: '2:1 3rd Column' },
  dozen_1: { ratio: 2, description: '2:1 1st Dozen (1-12)' },
  dozen_2: { ratio: 2, description: '2:1 2nd Dozen (13-24)' },
  dozen_3: { ratio: 2, description: '2:1 3rd Dozen (25-36)' },
  low: { ratio: 1, description: '1:1 Low (1-18)' },
  high: { ratio: 1, description: '1:1 High (19-36)' },
  even: { ratio: 1, description: '1:1 Even' },
  odd: { ratio: 1, description: '1:1 Odd' },
  red: { ratio: 1, description: '1:1 Red' },
  black: { ratio: 1, description: '1:1 Black' },
};

/**
 * Return cryptographically secure random winning number (0-36 for European)
 */
export function getRandomWinningNumber(wheelType: WheelType = 'european'): number {
  const max = wheelType === 'european' ? 37 : 38;
  const array = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Calculate the outcome and payout for a collection of placed bets given a winning number
 */
export interface SpinResult {
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
  isEven: boolean;
  isHigh: boolean;
  totalWager: number;
  totalPayout: number; // Includes returned bet stake on wins
  netProfit: number;   // totalPayout - totalWager
  winningBets: Array<{
    betId: string;
    type: BetType;
    label: string;
    wager: number;
    payout: number;
    profit: number;
  }>;
}

export function evaluateSpin(
  winningNumber: number,
  bets: PlacedBet[],
  wheelType: WheelType = 'european'
): SpinResult {
  const color = getNumberColor(winningNumber);
  const isZero = winningNumber === 0;
  const isEven = !isZero && winningNumber % 2 === 0;
  const isHigh = !isZero && winningNumber >= 19 && winningNumber <= 36;

  let totalWager = 0;
  let totalPayout = 0;
  const winningBets: SpinResult['winningBets'] = [];

  for (const bet of bets) {
    totalWager += bet.amount;
    const isWinner = bet.numbers.includes(winningNumber);

    if (isWinner) {
      const rule = PAYOUT_RATIOS[bet.type] || { ratio: 1 };
      const profit = bet.amount * rule.ratio;
      const payout = bet.amount + profit; // Return original bet + profit
      totalPayout += payout;

      winningBets.push({
        betId: bet.id,
        type: bet.type,
        label: bet.label,
        wager: bet.amount,
        payout,
        profit,
      });
    }
  }

  return {
    winningNumber,
    winningColor: color,
    isEven,
    isHigh,
    totalWager,
    totalPayout,
    netProfit: totalPayout - totalWager,
    winningBets,
  };
}

/**
 * Probability & Expected Value calculations
 */
export interface BetProbabilityInfo {
  type: BetType;
  label: string;
  coveredCount: number;
  totalPockets: number;
  probability: number;       // e.g. 18/37 = 0.486486
  probabilityPercent: string; // e.g. "48.65%"
  payoutOdds: string;        // e.g. "1:1"
  multiplier: number;        // e.g. 1
  expectedValueUnit: number; // EV per 1 unit bet, e.g. -0.0270
  expectedValueTotal: number;// EV for the bet's wager amount
  houseEdgePercent: number;  // 2.70%
}

export function calculateBetProbability(
  bet: PlacedBet,
  wheelType: WheelType = 'european'
): BetProbabilityInfo {
  const totalPockets = wheelType === 'european' ? 37 : 38;
  const coveredCount = bet.numbers.length;
  const prob = coveredCount / totalPockets;
  const rule = PAYOUT_RATIOS[bet.type] || { ratio: 1 };
  const ratio = rule.ratio;

  // EV = (prob * ratio) - ((1 - prob) * 1)
  const evUnit = (prob * ratio) - (1 - prob);
  const evTotal = evUnit * bet.amount;
  const houseEdge = wheelType === 'european' ? 2.7027 : 5.2632;

  return {
    type: bet.type,
    label: bet.label,
    coveredCount,
    totalPockets,
    probability: prob,
    probabilityPercent: `${(prob * 100).toFixed(2)}%`,
    payoutOdds: `${ratio}:1`,
    multiplier: ratio,
    expectedValueUnit: evUnit,
    expectedValueTotal: evTotal,
    houseEdgePercent: houseEdge,
  };
}

export interface TableSummaryStats {
  totalWager: number;
  totalUniqueNumbersCovered: number;
  coverageProbability: number;
  coveragePercent: string;
  totalExpectedValue: number;
  houseEdgePercent: number;
}

export function calculateTableSummary(
  bets: PlacedBet[],
  wheelType: WheelType = 'european'
): TableSummaryStats {
  const totalPockets = wheelType === 'european' ? 37 : 38;
  const coveredSet = new Set<number>();
  let totalWager = 0;
  let totalEV = 0;

  for (const bet of bets) {
    totalWager += bet.amount;
    bet.numbers.forEach((n) => coveredSet.add(n));
    const info = calculateBetProbability(bet, wheelType);
    totalEV += info.expectedValueTotal;
  }

  const coverageProb = coveredSet.size / totalPockets;

  return {
    totalWager,
    totalUniqueNumbersCovered: coveredSet.size,
    coverageProbability: coverageProb,
    coveragePercent: `${(coverageProb * 100).toFixed(2)}%`,
    totalExpectedValue: totalEV,
    houseEdgePercent: wheelType === 'european' ? 2.70 : 5.26,
  };
}

/**
 * Monte Carlo Simulation Engine
 * Runs 1,000 or 10,000 spins for different strategies without animation
 */
export type SimulationStrategy = 'flat_red' | 'martingale_red' | 'flat_single';

export interface SimulationStep {
  spinIndex: number;
  balance: number;
  netProfit: number;
}

export interface SimulationResult {
  strategy: SimulationStrategy;
  totalSpins: number;
  startingBalance: number;
  endingBalance: number;
  peakBalance: number;
  lowestBalance: number;
  ruinSpin: number | null; // index when bankroll hits 0, if ruined
  ruinRatePercent: number; // for multi-run
  history: SimulationStep[];
  meanEndingBalance: number;
  theoreticalEV: number;
}

export function runSimulation(
  strategy: SimulationStrategy,
  spins: number = 1000,
  initialBankroll: number = 2500,
  baseBet: number = 50,
  wheelType: WheelType = 'european'
): SimulationResult {
  const totalPockets = wheelType === 'european' ? 37 : 38;
  const redProbability = 18 / totalPockets;

  const history: SimulationStep[] = [{ spinIndex: 0, balance: initialBankroll, netProfit: 0 }];
  let balance = initialBankroll;
  let peak = initialBankroll;
  let lowest = initialBankroll;
  let ruinSpin: number | null = null;
  let currentBet = baseBet;

  // Single representative path
  for (let i = 1; i <= spins; i++) {
    if (balance <= 0) {
      if (ruinSpin === null) ruinSpin = i;
      history.push({ spinIndex: i, balance: 0, netProfit: -initialBankroll });
      continue;
    }

    const betAmount = Math.min(balance, currentBet);
    balance -= betAmount;

    // Simulate outcome
    const win = Math.random() < (strategy === 'flat_single' ? 1 / totalPockets : redProbability);

    if (win) {
      const payout = strategy === 'flat_single' ? betAmount * 36 : betAmount * 2;
      balance += payout;
      if (strategy === 'martingale_red') {
        currentBet = baseBet; // Reset on win
      }
    } else {
      if (strategy === 'martingale_red') {
        currentBet = Math.min(currentBet * 2, 50000); // Double on loss
      }
    }

    if (balance > peak) peak = balance;
    if (balance < lowest) lowest = balance;

    // Record every N steps to avoid giant arrays for 10000 spins
    const sampleRate = spins > 2000 ? 50 : 10;
    if (i % sampleRate === 0 || i === spins) {
      history.push({ spinIndex: i, balance, netProfit: balance - initialBankroll });
    }
  }

  // Theoretical EV calculation:
  // For European flat red: EV per spin = -baseBet * (1/37)
  const evPerSpin = strategy === 'flat_single' ? -baseBet * (1 / totalPockets) : -baseBet * (1 / totalPockets);
  const theoreticalEV = initialBankroll + (evPerSpin * spins);

  return {
    strategy,
    totalSpins: spins,
    startingBalance: initialBankroll,
    endingBalance: balance,
    peakBalance: peak,
    lowestBalance: lowest,
    ruinSpin,
    ruinRatePercent: ruinSpin !== null ? 100 : 0,
    history,
    meanEndingBalance: balance,
    theoreticalEV,
  };
}

/**
 * Gambler's Fallacy tracker:
 * Calculates streaks and proves independent conditional probability
 */
export interface StreakAnalysis {
  recentHistory: number[];
  currentRedStreak: number;
  currentBlackStreak: number;
  observedRedProb: number;
  theoreticalNextRedProb: number; // Always 18/37
  explanation: string;
}

export function analyzeStreak(history: number[]): StreakAnalysis {
  let redStreak = 0;
  let blackStreak = 0;

  for (const n of history) {
    const col = getNumberColor(n);
    if (col === 'red') {
      if (blackStreak > 0) break;
      redStreak++;
    } else if (col === 'black') {
      if (redStreak > 0) break;
      blackStreak++;
    } else {
      break;
    }
  }

  const redCount = history.filter((n) => getNumberColor(n) === 'red').length;
  const observedRedProb = history.length > 0 ? redCount / history.length : 18 / 37;

  let explanation = "Roulette spins are independent random trials. Past spins do not influence future outcomes.";
  if (redStreak >= 3) {
    explanation = `Notice: Even after ${redStreak} consecutive RED spins, the wheel has no memory! P(Next = RED) remains strictly 18/37 (48.65%). Betting BLACK now has no higher probability of winning.`;
  } else if (blackStreak >= 3) {
    explanation = `Notice: Even after ${blackStreak} consecutive BLACK spins, the probability of RED remains exactly 18/37 (48.65%). The "law of averages" does not compensate in the short run.`;
  }

  return {
    recentHistory: history.slice(0, 20),
    currentRedStreak: redStreak,
    currentBlackStreak: blackStreak,
    observedRedProb,
    theoreticalNextRedProb: 18 / 37,
    explanation,
  };
}
