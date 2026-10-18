/**
 * Live Synchronized Andar Bahar Engine
 * 
 * Features:
 * 1. Synchronized Wall-Clock Live Rounds (all clients see exact same phase, timer, and cards in sync).
 * 2. 5-second active betting window -> Automatic bet lock ("BETS CLOSED").
 * 3. 10.0-second suspenseful, pacing card dealing sequence between Andar and Bahar.
 * 4. 5.0-second celebratory winner reveal & payout settlement.
 * 5. House Advantage Algorithm: "Least Chosen Side"
 *    - Tallies total bets/coins on ANDAR vs BAHAR across all players.
 *    - Guarantees the winning card lands on the least chosen or unchosen side!
 */

import {
  BetSide,
  Card,
  DealtCardStep,
  createDeck,
  RANKS,
  SUITS,
} from './andarBaharEngine';

export interface RoomAndarBaharBet {
  playerId: string;
  playerName: string;
  avatarColor: string;
  side: BetSide;
  amount: number;
}

export interface LiveAndarBaharState {
  roundId: number;
  phase: 'betting' | 'dealing' | 'settled';
  timeRemaining: number;       // Seconds remaining in current phase (e.g. 4.2s)
  phaseProgress: number;       // 0.0 to 1.0 (exact progress through phase)
  elapsedInPhase: number;      // Seconds elapsed in current phase
  bettingDuration: number;     // 5.0 seconds
  dealingDuration: number;     // 10.0 seconds
  settledDuration: number;     // 5.0 seconds
  totalCycleDuration: number;  // 20.0 seconds
  openingCard: Card;
  dealtSteps: DealtCardStep[];
  currentStepIndex: number;    // Index of cards dealt so far based on phaseProgress
  andarCards: Card[];
  baharCards: Card[];
  winningSide: BetSide;
  matchingCard: Card;
  andarTotalWager: number;
  baharTotalWager: number;
  andarBetCount: number;
  baharBetCount: number;
  leastChosenSide: BetSide;
  roomBets: RoomAndarBaharBet[];
  activePlayersCount: number;
}

export const LIVE_AB_TIMING = {
  BETTING_MS: 5000,    // 5.0s betting window
  DEALING_MS: 10000,   // 10.0s suspenseful card dealing
  SETTLED_MS: 5000,    // 5.0s payout & celebration
  TOTAL_CYCLE_MS: 20000, // 20.0s total cycle
};

/**
 * Deterministic pseudo-random number generator seeded by roundId and salt
 */
function seededRandom(seed: number, salt: number = 0): number {
  const x = Math.sin(seed * 9301 + salt * 49297 + 233280) * 10000;
  return x - Math.floor(x);
}

/**
 * Deterministic card shuffle seeded by roundId
 */
function getSeededDeck(seed: number): Card[] {
  const deck = createDeck();
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const rand = seededRandom(seed, i);
    const j = Math.floor(rand * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Real room bets for Andar Bahar from active players
 */
export function getSimulatedAndarBaharRoomBets(_roundId: number): RoomAndarBaharBet[] {
  // Returns empty by default; populated by real bets from active sessions
  return [];
}

/**
 * Computes the least-chosen side and constructs the suspenseful deal deck
 */
export function computeAndarBaharOutcome(
  roundId: number,
  allBets: { side: BetSide; amount: number }[]
): {
  winningSide: BetSide;
  leastChosenSide: BetSide;
  openingCard: Card;
  matchingCard: Card;
  dealtSteps: DealtCardStep[];
  andarTotalWager: number;
  baharTotalWager: number;
  andarBetCount: number;
  baharBetCount: number;
} {
  let andarTotalWager = 0;
  let baharTotalWager = 0;
  let andarBetCount = 0;
  let baharBetCount = 0;

  for (const b of allBets) {
    if (b.side === 'ANDAR') {
      andarTotalWager += b.amount;
      andarBetCount++;
    } else {
      baharTotalWager += b.amount;
      baharBetCount++;
    }
  }

  // Determine least chosen side:
  // If ANDAR has more wager/bets -> BAHAR is least chosen!
  // If BAHAR has more wager/bets -> ANDAR is least chosen!
  // If equal -> deterministic seed
  let leastChosenSide: BetSide;
  if (andarTotalWager > baharTotalWager) {
    leastChosenSide = 'BAHAR';
  } else if (baharTotalWager > andarTotalWager) {
    leastChosenSide = 'ANDAR';
  } else if (andarBetCount > baharBetCount) {
    leastChosenSide = 'BAHAR';
  } else if (baharBetCount > andarBetCount) {
    leastChosenSide = 'ANDAR';
  } else {
    leastChosenSide = roundId % 2 === 0 ? 'ANDAR' : 'BAHAR';
  }

  const winningSide = leastChosenSide;

  // Generate deterministic deck
  const deck = getSeededDeck(roundId);
  const openingCard = deck[0];

  // We want a suspenseful deal sequence: 6 to 10 cards dealt before match hits!
  // In Andar Bahar:
  // If first card is dealt to ANDAR:
  // Steps 1, 3, 5, 7, 9 go to ANDAR.
  // Steps 2, 4, 6, 8, 10 go to BAHAR.
  const firstSide: BetSide = 'ANDAR';
  const otherSide: BetSide = 'BAHAR';

  // Target step count: choose an odd step for ANDAR (e.g. 5, 7) or even step for BAHAR (e.g. 6, 8)
  const targetStep = winningSide === 'ANDAR'
    ? 5 + (Math.floor(seededRandom(roundId, 77) * 2) * 2) // 5 or 7
    : 6 + (Math.floor(seededRandom(roundId, 88) * 2) * 2); // 6 or 8

  // Collect non-matching cards and 1 matching card from the deck
  const matchingCardsPool: Card[] = [];
  const nonMatchingPool: Card[] = [];

  for (let i = 1; i < deck.length; i++) {
    if (deck[i].rank === openingCard.rank) {
      matchingCardsPool.push(deck[i]);
    } else {
      nonMatchingPool.push(deck[i]);
    }
  }

  const matchingCard = matchingCardsPool[0] || {
    id: `${openingCard.rank}_♠`,
    rank: openingCard.rank,
    suit: '♠',
    color: 'black',
  };

  const dealtSteps: DealtCardStep[] = [];
  for (let i = 1; i <= targetStep; i++) {
    const side = i % 2 === 1 ? firstSide : otherSide;
    const isMatch = i === targetStep;
    const card = isMatch ? matchingCard : nonMatchingPool[i - 1];

    dealtSteps.push({
      stepNumber: i,
      side,
      card,
      isMatch,
    });
  }

  return {
    winningSide,
    leastChosenSide,
    openingCard,
    matchingCard,
    dealtSteps,
    andarTotalWager,
    baharTotalWager,
    andarBetCount,
    baharBetCount,
  };
}

/**
 * Computes the synchronized state of the live Andar Bahar cycle for any timestamp
 */
export function getLiveAndarBaharState(
  nowMs: number = Date.now(),
  localPlayerBet?: { side: BetSide; amount: number },
  roomBetsInput?: RoomAndarBaharBet[]
): LiveAndarBaharState {
  const roundId = Math.floor(nowMs / LIVE_AB_TIMING.TOTAL_CYCLE_MS);
  const cycleOffset = nowMs % LIVE_AB_TIMING.TOTAL_CYCLE_MS;

  let phase: 'betting' | 'dealing' | 'settled';
  let timeRemainingMs = 0;
  let elapsedInPhaseMs = 0;
  let phaseTotalMs = 0;

  if (cycleOffset < LIVE_AB_TIMING.BETTING_MS) {
    // Phase 1: BETTING (5 seconds)
    phase = 'betting';
    elapsedInPhaseMs = cycleOffset;
    timeRemainingMs = LIVE_AB_TIMING.BETTING_MS - cycleOffset;
    phaseTotalMs = LIVE_AB_TIMING.BETTING_MS;
  } else if (cycleOffset < LIVE_AB_TIMING.BETTING_MS + LIVE_AB_TIMING.DEALING_MS) {
    // Phase 2: DEALING (10 seconds)
    phase = 'dealing';
    elapsedInPhaseMs = cycleOffset - LIVE_AB_TIMING.BETTING_MS;
    timeRemainingMs = LIVE_AB_TIMING.BETTING_MS + LIVE_AB_TIMING.DEALING_MS - cycleOffset;
    phaseTotalMs = LIVE_AB_TIMING.DEALING_MS;
  } else {
    // Phase 3: SETTLED (5 seconds)
    phase = 'settled';
    elapsedInPhaseMs = cycleOffset - (LIVE_AB_TIMING.BETTING_MS + LIVE_AB_TIMING.DEALING_MS);
    timeRemainingMs = LIVE_AB_TIMING.TOTAL_CYCLE_MS - cycleOffset;
    phaseTotalMs = LIVE_AB_TIMING.SETTLED_MS;
  }

  const phaseProgress = Math.min(Math.max(elapsedInPhaseMs / phaseTotalMs, 0), 1.0);

  // Combine room bets + local player bet
  const roomBets = roomBetsInput || [];
  const allBets = [...roomBets.map((b) => ({ side: b.side, amount: b.amount }))];
  if (localPlayerBet && localPlayerBet.amount > 0) {
    allBets.push(localPlayerBet);
  }

  const outcome = computeAndarBaharOutcome(roundId, allBets);

  // During dealing, calculate how many cards have been dealt according to phaseProgress
  let currentStepIndex = 0;
  const andarCards: Card[] = [];
  const baharCards: Card[] = [];

  if (phase === 'betting') {
    currentStepIndex = 0;
  } else if (phase === 'dealing') {
    // Paced dealing: cards appear gradually over the 10 seconds
    const totalCards = outcome.dealtSteps.length;
    // Leave the last 1.5s for the winning match celebration
    const dealWindowProgress = Math.min(phaseProgress / 0.85, 1.0);
    currentStepIndex = Math.min(Math.floor(dealWindowProgress * totalCards) + 1, totalCards);

    for (let i = 0; i < currentStepIndex; i++) {
      const step = outcome.dealtSteps[i];
      if (step.side === 'ANDAR') {
        andarCards.push(step.card);
      } else {
        baharCards.push(step.card);
      }
    }
  } else {
    // Settled: all cards dealt
    currentStepIndex = outcome.dealtSteps.length;
    for (const step of outcome.dealtSteps) {
      if (step.side === 'ANDAR') {
        andarCards.push(step.card);
      } else {
        baharCards.push(step.card);
      }
    }
  }

  return {
    roundId,
    phase,
    timeRemaining: Math.max(0, parseFloat((timeRemainingMs / 1000).toFixed(1))),
    phaseProgress,
    elapsedInPhase: parseFloat((elapsedInPhaseMs / 1000).toFixed(2)),
    bettingDuration: LIVE_AB_TIMING.BETTING_MS / 1000,
    dealingDuration: LIVE_AB_TIMING.DEALING_MS / 1000,
    settledDuration: LIVE_AB_TIMING.SETTLED_MS / 1000,
    totalCycleDuration: LIVE_AB_TIMING.TOTAL_CYCLE_MS / 1000,
    openingCard: outcome.openingCard,
    dealtSteps: outcome.dealtSteps,
    currentStepIndex,
    andarCards,
    baharCards,
    winningSide: outcome.winningSide,
    matchingCard: outcome.matchingCard,
    andarTotalWager: outcome.andarTotalWager,
    baharTotalWager: outcome.baharTotalWager,
    andarBetCount: outcome.andarBetCount,
    baharBetCount: outcome.baharBetCount,
    leastChosenSide: outcome.leastChosenSide,
    roomBets,
    activePlayersCount: Math.max(1, roomBets.length + (localPlayerBet ? 1 : 0)),
  };
}
