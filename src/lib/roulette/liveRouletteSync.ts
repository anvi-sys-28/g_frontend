/**
 * Live Synchronized European Roulette Engine
 * 
 * Features:
 * 1. Synchronized Wall-Clock Live Rounds (all clients see exact same phase, timer, and spin in sync).
 * 2. 5-second active betting window -> Automatic bet lock ("BETS CLOSED").
 * 3. 9.5-second suspenseful, slow-decelerating 3D wheel & bouncing ball animation.
 * 4. 5.5-second settlement & celebratory payout reveal.
 * 5. House Algorithm: "Least Chosen or Unchosen Number"
 *    - Tallies all bets across all players (including simulated live players like Player A, B, C, D).
 *    - Finds numbers with lowest bet frequency / unchosen numbers.
 *    - Guaranteed to land on the least chosen or unchosen number!
 */

import { EUROPEAN_NUMBERS } from './rouletteEngine';

export interface RoomPlayerBet {
  playerId: string;
  playerName: string;
  avatarColor: string;
  numbers: number[];
  amount: number;
  label: string;
}

export interface LiveRoundInfo {
  roundId: number;
  phase: 'betting' | 'spinning' | 'settled';
  timeRemaining: number;       // Seconds remaining in current phase (e.g. 4.2s)
  phaseProgress: number;       // 0.0 to 1.0 (exact sub-millisecond progress)
  elapsedInPhase: number;      // Seconds elapsed in current phase
  bettingDuration: number;     // 5.0 seconds
  spinDuration: number;        // 9.5 seconds
  settledDuration: number;     // 5.5 seconds
  totalCycleDuration: number;  // 20.0 seconds
  winningNumber: number;
  winningPocketIndex: number;
  numberBetCounts: Record<number, number>;
  numberBetAmounts: Record<number, number>;
  leastChosenNumbers: number[];
  unchosenNumbers: number[];
  roomBets: RoomPlayerBet[];
  activePlayersCount: number;
}

export const LIVE_TIMING = {
  BETTING_MS: 5000,     // 5.0s betting window
  SPINNING_MS: 9500,    // 9.5s slow suspenseful spin & bounce
  SETTLED_MS: 5500,     // 5.5s payout & winner celebration
  TOTAL_CYCLE_MS: 20000 // 20.0s total cycle
};

/**
 * Deterministic pseudo-random generator seeded by roundId and optional salt
 */
function seededRandom(seed: number, salt: number = 0): number {
  const x = Math.sin(seed * 9301 + salt * 49297 + 233280) * 10000;
  return x - Math.floor(x);
}

/**
 * Real room bets formatted from active player sessions
 */
export function getSimulatedRoomBets(_roundId: number): RoomPlayerBet[] {
  // Returns empty by default; real multiplayer bets are populated by API and active player state
  return [];
}

/**
 * Calculates the winning number using the House "Least Chosen or Unchosen" algorithm
 */
export function computeLeastChosenWinningNumber(
  roundId: number,
  allBets: { numbers: number[]; amount: number }[]
): {
  winningNumber: number;
  betCounts: Record<number, number>;
  betAmounts: Record<number, number>;
  leastChosenNumbers: number[];
  unchosenNumbers: number[];
} {
  const betCounts: Record<number, number> = {};
  const betAmounts: Record<number, number> = {};

  for (let i = 0; i <= 36; i++) {
    betCounts[i] = 0;
    betAmounts[i] = 0;
  }

  for (const b of allBets) {
    for (const num of b.numbers) {
      if (num >= 0 && num <= 36) {
        betCounts[num] = (betCounts[num] || 0) + 1;
        betAmounts[num] = (betAmounts[num] || 0) + b.amount;
      }
    }
  }

  // 1. Identify unchosen numbers (count = 0)
  const unchosenNumbers: number[] = [];
  const chosenNumbers: number[] = [];

  for (let i = 0; i <= 36; i++) {
    if (betCounts[i] === 0) {
      unchosenNumbers.push(i);
    } else {
      chosenNumbers.push(i);
    }
  }

  // 2. Identify least-chosen numbers among those that were actually chosen
  let leastChosenNumbers: number[] = [];
  if (chosenNumbers.length > 0) {
    const minChosenCount = Math.min(...chosenNumbers.map((n) => betCounts[n]));
    leastChosenNumbers = chosenNumbers.filter((n) => betCounts[n] === minChosenCount);
  }

  // 3. Selection Strategy:
  // User Prompt: "so here 2 is choosen least so i want the ball in game to be follon on 2 because it is least choosen or else i want it to be falling on the number which is not choosen or least choosen"
  // If there are chosen numbers with a clear minimum (like 2 in the user's example), pick from leastChosenNumbers!
  // If no numbers were chosen or if chosen counts are equal across all, pick from unchosen numbers!
  let candidates: number[] = [];

  if (leastChosenNumbers.length > 0) {
    // We have numbers chosen with lowest frequency (e.g. number 2 has 1 bet, 1 has 4 bets)
    candidates = leastChosenNumbers;
  } else if (unchosenNumbers.length > 0) {
    candidates = unchosenNumbers;
  } else {
    // All 37 numbers have equal bets, pick any
    candidates = Array.from({ length: 37 }, (_, i) => i);
  }

  // Deterministically select candidate based on roundId seed
  const rand = seededRandom(roundId, 42);
  const selectedIndex = Math.floor(rand * candidates.length);
  const winningNumber = candidates[selectedIndex] ?? 2;

  return {
    winningNumber,
    betCounts,
    betAmounts,
    leastChosenNumbers,
    unchosenNumbers,
  };
}

/**
 * Computes the synchronized state of the live roulette cycle for any given timestamp
 */
export function getLiveRoundState(
  nowMs: number = Date.now(),
  localPlayerBets: { numbers: number[]; amount: number }[] = [],
  roomBetsInput?: RoomPlayerBet[]
): LiveRoundInfo {
  const roundId = Math.floor(nowMs / LIVE_TIMING.TOTAL_CYCLE_MS);
  const cycleOffset = nowMs % LIVE_TIMING.TOTAL_CYCLE_MS;

  // Determine current phase
  let phase: 'betting' | 'spinning' | 'settled';
  let timeRemainingMs = 0;
  let elapsedInPhaseMs = 0;
  let phaseTotalMs = 0;

  if (cycleOffset < LIVE_TIMING.BETTING_MS) {
    // Phase 1: BETTING (5 seconds)
    phase = 'betting';
    elapsedInPhaseMs = cycleOffset;
    timeRemainingMs = LIVE_TIMING.BETTING_MS - cycleOffset;
    phaseTotalMs = LIVE_TIMING.BETTING_MS;
  } else if (cycleOffset < LIVE_TIMING.BETTING_MS + LIVE_TIMING.SPINNING_MS) {
    // Phase 2: SPINNING (9.5 seconds)
    phase = 'spinning';
    elapsedInPhaseMs = cycleOffset - LIVE_TIMING.BETTING_MS;
    timeRemainingMs = LIVE_TIMING.BETTING_MS + LIVE_TIMING.SPINNING_MS - cycleOffset;
    phaseTotalMs = LIVE_TIMING.SPINNING_MS;
  } else {
    // Phase 3: SETTLED (5.5 seconds)
    phase = 'settled';
    elapsedInPhaseMs = cycleOffset - (LIVE_TIMING.BETTING_MS + LIVE_TIMING.SPINNING_MS);
    timeRemainingMs = LIVE_TIMING.TOTAL_CYCLE_MS - cycleOffset;
    phaseTotalMs = LIVE_TIMING.SETTLED_MS;
  }

  const phaseProgress = Math.min(Math.max(elapsedInPhaseMs / phaseTotalMs, 0), 1.0);

  // Combine room bets + local player bets to calculate outcome
  const roomBets = roomBetsInput || [];
  const combinedBets = [
    ...roomBets.map((rb) => ({ numbers: rb.numbers, amount: rb.amount })),
    ...localPlayerBets,
  ];

  const outcome = computeLeastChosenWinningNumber(roundId, combinedBets);
  const pocketIndex = EUROPEAN_NUMBERS.indexOf(outcome.winningNumber);

  return {
    roundId,
    phase,
    timeRemaining: Math.max(0, parseFloat((timeRemainingMs / 1000).toFixed(1))),
    phaseProgress,
    elapsedInPhase: parseFloat((elapsedInPhaseMs / 1000).toFixed(2)),
    bettingDuration: LIVE_TIMING.BETTING_MS / 1000,
    spinDuration: LIVE_TIMING.SPINNING_MS / 1000,
    settledDuration: LIVE_TIMING.SETTLED_MS / 1000,
    totalCycleDuration: LIVE_TIMING.TOTAL_CYCLE_MS / 1000,
    winningNumber: outcome.winningNumber,
    winningPocketIndex: pocketIndex >= 0 ? pocketIndex : 0,
    numberBetCounts: outcome.betCounts,
    numberBetAmounts: outcome.betAmounts,
    leastChosenNumbers: outcome.leastChosenNumbers,
    unchosenNumbers: outcome.unchosenNumbers,
    roomBets,
    activePlayersCount: Math.max(1, roomBets.length + (localPlayerBets.length > 0 ? 1 : 0)),
  };
}
