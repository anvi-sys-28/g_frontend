import type { MatchFormat, WinProbabilityResult } from '../types/models.js';

export interface MatchStateInput {
  format: MatchFormat;
  inningsNumber: number;
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  battingTeamId: string;
  runs: number;
  wickets: number;
  balls: number; // Legal balls bowled in current innings
  targetRuns?: number;
  totalOvers?: number; // default 20 for T20, 50 for ODI
}

export interface WinProbabilityEngine {
  calculate(input: MatchStateInput): WinProbabilityResult;
}

/**
 * Standard par scores for formats
 */
const FORMAT_PAR_SCORES: Record<string, number> = {
  T20: 165,
  ODI: 280,
  '100BALL': 140,
  TEST: 320,
};

export class ResourceBasedWinProbabilityEngine implements WinProbabilityEngine {
  public calculate(input: MatchStateInput): WinProbabilityResult {
    const totalOvers = input.totalOvers ?? (input.format === 'ODI' ? 50 : 20);
    const totalBalls = totalOvers * 6;
    const ballsBowled = Math.min(input.balls, totalBalls);
    const ballsRemaining = Math.max(0, totalBalls - ballsBowled);
    const wicketsInHand = Math.max(0, 10 - input.wickets);
    const isChasing = input.inningsNumber >= 2 && Boolean(input.targetRuns);
    const currentRunRate = ballsBowled > 0 ? (input.runs / (ballsBowled / 6)) : 0;

    const isTeamABatting = input.battingTeamId === input.teamAId;
    let battingProb = 50;
    let confidence = 50;
    let parScore = FORMAT_PAR_SCORES[input.format] ?? 165;
    let projectedScore: number | undefined;
    let requiredRunRate: number | undefined;

    if (isChasing) {
      const target = input.targetRuns!;
      const runsNeeded = target - input.runs;
      parScore = target;

      // 1. Chasing team has already reached target
      if (runsNeeded <= 0) {
        battingProb = 100;
        confidence = 100;
      }
      // 2. Chasing team is all out or ran out of balls with runs still needed
      else if (wicketsInHand <= 0 || (ballsRemaining <= 0 && runsNeeded > 0)) {
        battingProb = 0;
        confidence = 100;
      }
      // 3. Match tied (0 runs needed with 0 balls remaining - exact tie)
      else if (ballsRemaining === 0 && runsNeeded === 0) {
        battingProb = 50;
        confidence = 100;
      }
      // 4. In-progress chase
      else {
        requiredRunRate = (runsNeeded / (ballsRemaining / 6));

        // Edge case: Chasing 1 off 1 ball with wickets in hand
        if (ballsRemaining === 1 && runsNeeded === 1) {
          if (wicketsInHand >= 2) {
            battingProb = 85;
          } else {
            battingProb = 55; // 9 down, extreme pressure
          }
        } else {
          // Resource model:
          // Wicket resource factor (having wickets in hand scales exponentially in death overs)
          const wicketWeight = Math.pow(wicketsInHand / 10, 0.7);
          const ballsWeight = Math.pow(ballsRemaining / totalBalls, 0.9);

          // Calculate standard capability benchmark
          // At death (last 4 overs), teams can score up to ~11-12 RRR if wickets in hand
          let phaseCapabilityRate = 8.5;
          if (ballsRemaining <= 24) {
            phaseCapabilityRate = 10.5;
          } else if (ballsRemaining <= 60) {
            phaseCapabilityRate = 9.0;
          }

          // Effective RRR adjusted by wickets remaining
          // e.g. RRR of 9 with 8 wickets in hand feels like 7.5; with 2 wickets in hand feels like 13
          const adjustedRRR = requiredRunRate * (1 + (10 - wicketsInHand) * 0.08);

          // Sigmoid centered around phaseCapabilityRate
          // z > 0 means difficulty is high (batting prob drops)
          const z = (adjustedRRR - phaseCapabilityRate) * 0.45;
          const rawBattingProb = 100 / (1 + Math.exp(z));

          // Bound and adjust by remaining balls / wickets
          const clampedProb = Math.min(99.5, Math.max(0.5, rawBattingProb));
          battingProb = Math.round(clampedProb * 10) / 10;
        }

        // Confidence increases as match nears conclusion
        confidence = Math.round(50 + (ballsBowled / totalBalls) * 45);
      }
    } else {
      // 1st innings: projected score + probability vs standard par
      const oversBowled = ballsBowled / 6;
      let phaseAcceleration = 1.0;
      if (oversBowled >= 15) {
        phaseAcceleration = 1.25; // Death overs acceleration
      } else if (oversBowled >= 6) {
        phaseAcceleration = 1.05; // Middle overs
      } else {
        phaseAcceleration = 0.95; // Powerplay setting up
      }

      // Wicket penalty on acceleration
      const wicketDrag = Math.max(0.5, 1 - (10 - wicketsInHand) * 0.07);
      const expectedFutureRR = Math.max(5.5, currentRunRate > 0 ? (currentRunRate * phaseAcceleration * wicketDrag) : 8.0);
      const remainingOvers = ballsRemaining / 6;
      projectedScore = Math.round(input.runs + (expectedFutureRR * remainingOvers));

      // Compare projected score to par score
      const scoreDiff = projectedScore - parScore;
      const z = scoreDiff * 0.05;
      battingProb = Math.round((100 / (1 + Math.exp(-z))) * 10) / 10;
      battingProb = Math.min(95, Math.max(5, battingProb));

      // 1st innings confidence scales from 40% to 80%
      confidence = Math.round(40 + (ballsBowled / totalBalls) * 40);
    }

    // Assign team probabilities based on who is batting
    const teamAProb = isTeamABatting ? battingProb : Math.round((100 - battingProb) * 10) / 10;
    const teamBProb = Math.round((100 - teamAProb) * 10) / 10;

    return {
      teamAId: input.teamAId,
      teamAName: input.teamAName,
      teamAProb,
      teamBId: input.teamBId,
      teamBName: input.teamBName,
      teamBProb,
      confidence,
      projectedScore,
      factors: {
        ballsRemaining,
        wicketsInHand,
        requiredRunRate: requiredRunRate ? Math.round(requiredRunRate * 100) / 100 : undefined,
        currentRunRate: Math.round(currentRunRate * 100) / 100,
        parScore,
      },
    };
  }
}

export const defaultWinProbabilityEngine = new ResourceBasedWinProbabilityEngine();

export function calculateWinProbability(input: MatchStateInput): WinProbabilityResult {
  return defaultWinProbabilityEngine.calculate(input);
}
