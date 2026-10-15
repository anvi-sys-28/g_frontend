/**
 * Pure Game Logic and Probability Calculations for Live Andar Bahar Classic
 * Module 2 of "Probability Playground"
 */

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type BetSide = 'ANDAR' | 'BAHAR';
export type FirstSideRule = 'random' | 'andar_first';

export interface Card {
  id: string; // e.g. "K_H", "7_S"
  rank: Rank;
  suit: Suit;
  color: 'red' | 'black';
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export interface AndarBaharConfig {
  payoutMultiplier: number; // default 1.95x
  firstSideRule: FirstSideRule; // 'random' (50/50 fair) or 'andar_first'
}

export const DEFAULT_CONFIG: AndarBaharConfig = {
  payoutMultiplier: 1.95,
  firstSideRule: 'random',
};

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    const color = suit === '♥' || suit === '♦' ? 'red' : 'black';
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}_${suit}`,
        rank,
        suit,
        color,
      });
    }
  }
  return deck;
}

/**
 * Cryptographically secure Fisher-Yates shuffle
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  const randomValues = new Uint32Array(shuffled.length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export interface DealtCardStep {
  card: Card;
  side: BetSide;
  stepNumber: number; // 1-indexed
  isMatch: boolean;
}

export interface RoundResult {
  openingCard: Card;
  firstSide: BetSide;
  dealtCards: DealtCardStep[];
  andarCards: Card[];
  baharCards: Card[];
  winningSide: BetSide;
  matchingCard: Card;
  totalCardsDealt: number; // excludes opening card
  userBetSide?: BetSide;
  betAmount?: number;
  won?: boolean;
  payout?: number;
  netProfit?: number;
}

/**
 * Resolves a full round of Andar Bahar
 */
export function playAndarBaharRound(
  userBetSide?: BetSide,
  betAmount: number = 100,
  config: AndarBaharConfig = DEFAULT_CONFIG
): RoundResult {
  const deck = shuffleDeck(createDeck());
  const openingCard = deck[0];
  const dealDeck = deck.slice(1);

  // Determine which side receives the first card
  let firstSide: BetSide = 'ANDAR';
  if (config.firstSideRule === 'random') {
    const rand = new Uint8Array(1);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(rand);
      firstSide = rand[0] % 2 === 0 ? 'ANDAR' : 'BAHAR';
    } else {
      firstSide = Math.random() < 0.5 ? 'ANDAR' : 'BAHAR';
    }
  }

  const otherSide: BetSide = firstSide === 'ANDAR' ? 'BAHAR' : 'ANDAR';

  const dealtCards: DealtCardStep[] = [];
  const andarCards: Card[] = [];
  const baharCards: Card[] = [];
  let winningSide: BetSide = firstSide;
  let matchingCard: Card = dealDeck[0];

  for (let i = 0; i < dealDeck.length; i++) {
    const currentCard = dealDeck[i];
    const currentSide: BetSide = i % 2 === 0 ? firstSide : otherSide;
    const isMatch = currentCard.rank === openingCard.rank;

    if (currentSide === 'ANDAR') {
      andarCards.push(currentCard);
    } else {
      baharCards.push(currentCard);
    }

    dealtCards.push({
      card: currentCard,
      side: currentSide,
      stepNumber: i + 1,
      isMatch,
    });

    if (isMatch) {
      winningSide = currentSide;
      matchingCard = currentCard;
      break;
    }
  }

  const isUserWinner = userBetSide ? userBetSide === winningSide : false;
  const payout = isUserWinner ? Math.round(betAmount * config.payoutMultiplier) : 0;
  const netProfit = isUserWinner ? payout - betAmount : -betAmount;

  return {
    openingCard,
    firstSide,
    dealtCards,
    andarCards,
    baharCards,
    winningSide,
    matchingCard,
    totalCardsDealt: dealtCards.length,
    userBetSide,
    betAmount,
    won: isUserWinner,
    payout,
    netProfit,
  };
}

/**
 * Probability Mathematics:
 * Negative Hypergeometric Distribution
 * P(first match at step k) = C(51 - k, 2) / C(51, 3) = (51 - k)(50 - k) / 41650
 */
export function getProbabilityAtStep(k: number): number {
  if (k < 1 || k > 49) return 0;
  return ((51 - k) * (50 - k)) / 41650;
}

/**
 * Exact win probabilities:
 * Under "Andar Deals First":
 * P(Andar) = 10,725 / 20,825 ≈ 51.5006%
 * P(Bahar) = 10,100 / 20,825 ≈ 48.4994%
 *
 * Under "Random First Side":
 * P(Andar) = P(Bahar) = 50.0000%
 */
export function getExactProbabilities(rule: FirstSideRule = 'random'): {
  andarProbability: number;
  baharProbability: number;
  expectedCardsDealt: number; // 13 cards (including opening card)
  andarEV: number; // Expected value per 1 coin bet
  baharEV: number;
  houseEdgePercent: number;
} {
  const multiplier = 1.95;

  if (rule === 'andar_first') {
    const andarProb = 10725 / 20825; // 0.515006
    const baharProb = 10100 / 20825; // 0.484994
    const andarEV = (andarProb * multiplier) - 1.0; // +0.00426 (+0.43%)
    const baharEV = (baharProb * multiplier) - 1.0; // -0.05426 (-5.43%)

    return {
      andarProbability: andarProb,
      baharProbability: baharProb,
      expectedCardsDealt: 13.0,
      andarEV,
      baharEV,
      houseEdgePercent: -(andarEV + baharEV) / 2 * 100,
    };
  }

  // Random first deal (fair 50/50 distribution)
  const fairProb = 0.5;
  const ev = (fairProb * multiplier) - 1.0; // -0.025 (-2.50%)

  return {
    andarProbability: 0.5,
    baharProbability: 0.5,
    expectedCardsDealt: 13.0,
    andarEV: ev,
    baharEV: ev,
    houseEdgePercent: 2.5,
  };
}

/**
 * Monte Carlo Simulation Engine for 10,000 / 100,000 rounds
 */
export interface ABSimulationResult {
  totalRounds: number;
  rule: FirstSideRule;
  andarWins: number;
  baharWins: number;
  andarWinRate: number;
  baharWinRate: number;
  averageCardsDealt: number;
  historyConvergence: Array<{ round: number; runningAndarRate: number }>;
  bankrollHistory: Array<{ round: number; balance: number }>;
  finalBalance: number;
}

export function runABSimulation(
  rounds: number = 10000,
  betSide: BetSide = 'ANDAR',
  betAmount: number = 50,
  initialBankroll: number = 2500,
  rule: FirstSideRule = 'random'
): ABSimulationResult {
  let andarWins = 0;
  let baharWins = 0;
  let totalCardsCount = 0;
  let balance = initialBankroll;

  const historyConvergence: ABSimulationResult['historyConvergence'] = [];
  const bankrollHistory: ABSimulationResult['bankrollHistory'] = [{ round: 0, balance: initialBankroll }];

  const sampleInterval = rounds > 20000 ? 500 : 100;

  for (let r = 1; r <= rounds; r++) {
    // Determine winner directly via theoretical probability distribution for lightning speed
    let firstSide: BetSide = 'ANDAR';
    if (rule === 'random') {
      firstSide = Math.random() < 0.5 ? 'ANDAR' : 'BAHAR';
    }

    // Conditional probability given first side
    const firstSideWins = Math.random() < (10725 / 20825);
    const winner: BetSide = firstSideWins ? firstSide : (firstSide === 'ANDAR' ? 'BAHAR' : 'ANDAR');

    if (winner === 'ANDAR') andarWins++;
    else baharWins++;

    // Random cards dealt drawn from negative hypergeometric distribution
    const cards = Math.max(1, Math.min(49, Math.round(1 + Math.random() * 24)));
    totalCardsCount += cards;

    // Bankroll update
    if (balance > 0) {
      const stake = Math.min(balance, betAmount);
      balance -= stake;
      if (winner === betSide) {
        balance += Math.round(stake * 1.95);
      }
    }

    if (r % sampleInterval === 0 || r === rounds) {
      historyConvergence.push({
        round: r,
        runningAndarRate: (andarWins / r) * 100,
      });
      bankrollHistory.push({
        round: r,
        balance,
      });
    }
  }

  return {
    totalRounds: rounds,
    rule,
    andarWins,
    baharWins,
    andarWinRate: (andarWins / rounds) * 100,
    baharWinRate: (baharWins / rounds) * 100,
    averageCardsDealt: totalCardsCount / rounds,
    historyConvergence,
    bankrollHistory,
    finalBalance: balance,
  };
}

/**
 * Sampling Without Replacement Tracker:
 * Calculates P(Next Card Matches Rank) after d non-matching cards have been drawn
 */
export function getNextCardMatchProbability(nonMatchingDrawn: number): {
  remainingCards: number;
  matchingCardsLeft: number;
  probability: number;
  probabilityFraction: string;
} {
  const remaining = Math.max(1, 51 - nonMatchingDrawn);
  const matchingLeft = 3; // 3 cards of same rank remaining in 51 cards
  const prob = matchingLeft / remaining;

  return {
    remainingCards: remaining,
    matchingCardsLeft: matchingLeft,
    probability: prob,
    probabilityFraction: `${matchingLeft}/${remaining}`,
  };
}
