import { describe, it, expect } from 'vitest';
import {
  getNumberColor,
  evaluateSpin,
  calculateBetProbability,
  calculateTableSummary,
  runSimulation,
  analyzeStreak,
  PlacedBet,
  EUROPEAN_NUMBERS,
} from './rouletteEngine';

describe('rouletteEngine', () => {
  it('correctly maps European numbers and colors', () => {
    expect(EUROPEAN_NUMBERS).toHaveLength(37);
    expect(getNumberColor(0)).toBe('green');
    expect(getNumberColor(32)).toBe('red');
    expect(getNumberColor(15)).toBe('black');
    expect(getNumberColor(7)).toBe('red');
    expect(getNumberColor(28)).toBe('black');
  });

  it('evaluates straight up bets correctly (35:1)', () => {
    const bet: PlacedBet = {
      id: 'straight-17',
      type: 'straight',
      label: '17',
      numbers: [17],
      amount: 100,
      chips: { 100: 1 },
    };

    // Winning spin on 17
    const winResult = evaluateSpin(17, [bet]);
    expect(winResult.totalPayout).toBe(3600); // 100 * 35 + 100
    expect(winResult.netProfit).toBe(3500);
    expect(winResult.winningBets).toHaveLength(1);

    // Losing spin on 18
    const loseResult = evaluateSpin(18, [bet]);
    expect(loseResult.totalPayout).toBe(0);
    expect(loseResult.netProfit).toBe(-100);
    expect(loseResult.winningBets).toHaveLength(0);
  });

  it('evaluates split bets correctly (17:1)', () => {
    const bet: PlacedBet = {
      id: 'split-1-2',
      type: 'split',
      label: '1-2 Split',
      numbers: [1, 2],
      amount: 50,
      chips: { 50: 1 },
    };

    const winResult = evaluateSpin(1, [bet]);
    expect(winResult.totalPayout).toBe(50 * 18); // 900
    expect(winResult.netProfit).toBe(50 * 17); // 850

    const winResult2 = evaluateSpin(2, [bet]);
    expect(winResult2.totalPayout).toBe(900);

    const loseResult = evaluateSpin(3, [bet]);
    expect(loseResult.totalPayout).toBe(0);
  });

  it('evaluates street bets (11:1) and corners (8:1)', () => {
    const streetBet: PlacedBet = {
      id: 'street-1-2-3',
      type: 'street',
      label: 'Street 1-2-3',
      numbers: [1, 2, 3],
      amount: 100,
      chips: { 100: 1 },
    };
    const cornerBet: PlacedBet = {
      id: 'corner-1-2-4-5',
      type: 'corner',
      label: 'Corner 1-2-4-5',
      numbers: [1, 2, 4, 5],
      amount: 100,
      chips: { 100: 1 },
    };

    const winResult = evaluateSpin(2, [streetBet, cornerBet]);
    // street pays 100 * 11 + 100 = 1200
    // corner pays 100 * 8 + 100 = 900
    expect(winResult.totalPayout).toBe(2100);
    expect(winResult.netProfit).toBe(1900);
  });

  it('evaluates outside bets: Red, Even, Dozen', () => {
    const redBet: PlacedBet = {
      id: 'red',
      type: 'red',
      label: 'Red',
      numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
      amount: 200,
      chips: { 100: 2 },
    };
    const dozenBet: PlacedBet = {
      id: 'dozen_1',
      type: 'dozen_1',
      label: '1st 12',
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      amount: 100,
      chips: { 100: 1 },
    };

    // Spin 7 is Red and in 1st Dozen
    const winResult = evaluateSpin(7, [redBet, dozenBet]);
    // red: 200 * 1 + 200 = 400
    // dozen: 100 * 2 + 100 = 300
    expect(winResult.totalPayout).toBe(700);
    expect(winResult.netProfit).toBe(400);

    // Spin 0 loses both
    const zeroResult = evaluateSpin(0, [redBet, dozenBet]);
    expect(zeroResult.totalPayout).toBe(0);
    expect(zeroResult.netProfit).toBe(-300);
  });

  it('calculates probability and expected value matching European standard 2.70%', () => {
    const straightBet: PlacedBet = {
      id: 'straight-7',
      type: 'straight',
      label: '7',
      numbers: [7],
      amount: 100,
      chips: { 100: 1 },
    };
    const probStraight = calculateBetProbability(straightBet, 'european');
    expect(probStraight.probability).toBeCloseTo(1 / 37, 4);
    expect(probStraight.houseEdgePercent).toBeCloseTo(2.70, 2);
    expect(probStraight.expectedValueUnit).toBeCloseTo(-1 / 37, 4);

    const redBet: PlacedBet = {
      id: 'red',
      type: 'red',
      label: 'Red',
      numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
      amount: 100,
      chips: { 100: 1 },
    };
    const probRed = calculateBetProbability(redBet, 'european');
    expect(probRed.probability).toBeCloseTo(18 / 37, 4);
    expect(probRed.expectedValueUnit).toBeCloseTo(-1 / 37, 4);
  });

  it('runs Monte Carlo simulations without crashing', () => {
    const sim = runSimulation('flat_red', 1000, 2500, 50, 'european');
    expect(sim.history.length).toBeGreaterThan(10);
    expect(sim.totalSpins).toBe(1000);
    expect(typeof sim.endingBalance).toBe('number');
  });

  it('correctly tracks streaks for Gambler Fallacy explanations', () => {
    const analysis = analyzeStreak([32, 7, 19, 14, 2]); // Red, Red, Red, Red, Black
    expect(analysis.currentRedStreak).toBe(4);
    expect(analysis.explanation).toContain('consecutive RED');
  });
});
