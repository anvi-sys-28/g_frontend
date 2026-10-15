import { describe, it, expect } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  playAndarBaharRound,
  getProbabilityAtStep,
  getExactProbabilities,
  getNextCardMatchProbability,
  runABSimulation,
} from './andarBaharEngine';

describe('andarBaharEngine', () => {
  it('creates a standard 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    const suits = new Set(deck.map((c) => c.suit));
    const ranks = new Set(deck.map((c) => c.rank));
    expect(suits.size).toBe(4);
    expect(ranks.size).toBe(13);
  });

  it('shuffles deck into a permutation of 52 cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    const ids = new Set(shuffled.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it('plays a full round of Andar Bahar and terminates with a match', () => {
    const round = playAndarBaharRound('ANDAR', 100);
    expect(round.openingCard).toBeDefined();
    expect(round.matchingCard.rank).toBe(round.openingCard.rank);
    expect(['ANDAR', 'BAHAR']).toContain(round.winningSide);
    expect(round.totalCardsDealt).toBeGreaterThanOrEqual(1);
    expect(round.totalCardsDealt).toBeLessThanOrEqual(49);

    if (round.won) {
      expect(round.payout).toBe(195);
      expect(round.netProfit).toBe(95);
    } else {
      expect(round.payout).toBe(0);
      expect(round.netProfit).toBe(-100);
    }
  });

  it('computes negative hypergeometric probabilities correctly', () => {
    // Step 1: P(1) = 50 * 49 / 41650 = 2450 / 41650 ≈ 0.0588 (3/51)
    const p1 = getProbabilityAtStep(1);
    expect(p1).toBeCloseTo(3 / 51, 4);

    // Sum of all steps 1..49 must be 1.0
    let totalProb = 0;
    for (let k = 1; k <= 49; k++) {
      totalProb += getProbabilityAtStep(k);
    }
    expect(totalProb).toBeCloseTo(1.0, 5);
  });

  it('computes exact conditional probabilities under both rules', () => {
    // Random rule gives 50/50
    const randProbs = getExactProbabilities('random');
    expect(randProbs.andarProbability).toBe(0.5);
    expect(randProbs.baharProbability).toBe(0.5);
    expect(randProbs.houseEdgePercent).toBeCloseTo(2.5, 2);

    // Andar First rule gives ~51.5% and ~48.5%
    const andarFirst = getExactProbabilities('andar_first');
    expect(andarFirst.andarProbability).toBeCloseTo(0.515, 3);
    expect(andarFirst.baharProbability).toBeCloseTo(0.485, 3);
  });

  it('calculates sampling without replacement probabilities', () => {
    const draw0 = getNextCardMatchProbability(0);
    expect(draw0.probabilityFraction).toBe('3/51');

    const draw10 = getNextCardMatchProbability(10);
    expect(draw10.probabilityFraction).toBe('3/41');
  });

  it('runs Monte Carlo simulation without errors', () => {
    const sim = runABSimulation(1000, 'ANDAR', 50, 2500, 'random');
    expect(sim.totalRounds).toBe(1000);
    expect(sim.andarWinRate).toBeGreaterThan(40);
    expect(sim.andarWinRate).toBeLessThan(60);
    expect(sim.historyConvergence.length).toBeGreaterThan(5);
  });
});
