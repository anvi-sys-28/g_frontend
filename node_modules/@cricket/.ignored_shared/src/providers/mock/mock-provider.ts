import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { CricketProvider, DateRange } from '../types.js';
import type {
  Match,
  MatchState,
  Scorecard,
  Commentary,
  BallEvent,
  BatterStats,
  BowlerStats,
  Innings,
  Partnership,
  OverSummary,
  MatchDeltaEvent,
} from '../../types/models.js';
import { mockMatchInfo, mockFirstInnings } from './mock-data.js';
import { calculateWinProbability } from '../../analytics/win-probability.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MockProviderOptions {
  fixturePath?: string;
  autoLoop?: boolean; // When match completes, loop from start
}

export class MockProvider implements CricketProvider {
  public readonly name = 'mock';
  private allBalls: BallEvent[] = [];
  private currentBallIndex: number = 0;
  private sequence: number = 1;
  private match: Match;
  private firstInnings: Innings;
  private autoLoop: boolean;

  constructor(options: MockProviderOptions = {}) {
    this.autoLoop = options.autoLoop ?? true;
    this.match = JSON.parse(JSON.stringify(mockMatchInfo));
    this.firstInnings = JSON.parse(JSON.stringify(mockFirstInnings));
    this.loadFixture(options.fixturePath);
  }

  private loadFixture(customPath?: string): void {
    const fixtureFile = customPath ?? path.join(__dirname, 'fixtures', 'ind-vs-pak-t20.json');
    if (fs.existsSync(fixtureFile)) {
      const data = fs.readFileSync(fixtureFile, 'utf-8');
      this.allBalls = JSON.parse(data);
    } else {
      // Fallback empty if file not yet generated
      this.allBalls = [];
    }
  }

  public reset(): void {
    this.currentBallIndex = 0;
    this.sequence = 1;
  }

  public setBallIndex(index: number): void {
    this.currentBallIndex = Math.min(Math.max(0, index), this.allBalls.length);
  }

  public getCurrentBallIndex(): number {
    return this.currentBallIndex;
  }

  public getTotalBalls(): number {
    return this.allBalls.length;
  }

  /**
   * Advance by one ball and return the new ball event and delta
   */
  public advanceBall(): { ball: BallEvent | null; delta: MatchDeltaEvent } {
    if (this.currentBallIndex >= this.allBalls.length) {
      if (this.autoLoop) {
        this.currentBallIndex = 0;
      } else {
        const state = this.buildCurrentState();
        return {
          ball: null,
          delta: {
            sequence: this.sequence++,
            matchId: this.match.id,
            timestamp: Date.now(),
            type: 'match_end',
            message: 'Match completed. India won by 4 wickets.',
          },
        };
      }
    }

    const ball = this.allBalls[this.currentBallIndex];
    this.currentBallIndex++;
    this.sequence++;

    const state = this.buildCurrentState();

    let eventType: MatchDeltaEvent['type'] = 'ball';
    if (ball.isWicket) eventType = 'wicket';
    else if (ball.isBoundary) eventType = 'boundary';
    else if (this.currentBallIndex >= this.allBalls.length) eventType = 'match_end';

    const delta: MatchDeltaEvent = {
      sequence: this.sequence,
      matchId: this.match.id,
      timestamp: Date.now(),
      type: eventType,
      ball,
      scoreChange: {
        runs: state.currentInnings.runs,
        wickets: state.currentInnings.wickets,
        overs: state.currentInnings.overs,
        currentRunRate: state.analytics.currentRunRate,
        requiredRunRate: state.analytics.requiredRunRate,
      },
      winProbability: state.analytics.winProbability,
    };

    return { ball, delta };
  }

  private buildCurrentState(): MatchState {
    const ballsSoFar = this.allBalls.slice(0, this.currentBallIndex);

    // Initial batting lineup for 2nd innings (India)
    const battersMap = new Map<string, BatterStats>([
      ['p-kl-rahul', { id: 'p-kl-rahul', name: 'KL Rahul', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-rohit-sharma', { id: 'p-rohit-sharma', name: 'Rohit Sharma', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-virat-kohli', { id: 'p-virat-kohli', name: 'Virat Kohli', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-suryakumar-yadav', { id: 'p-suryakumar-yadav', name: 'Suryakumar Yadav', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-axar-patel', { id: 'p-axar-patel', name: 'Axar Patel', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-hardik-pandya', { id: 'p-hardik-pandya', name: 'Hardik Pandya', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-dinesh-karthik', { id: 'p-dinesh-karthik', name: 'Dinesh Karthik', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
      ['p-ravichandran-ashwin', { id: 'p-ravichandran-ashwin', name: 'Ravichandran Ashwin', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }],
    ]);

    const bowlersMap = new Map<string, BowlerStats>([
      ['b-shaheen-afridi', { id: 'b-shaheen-afridi', name: 'Shaheen Afridi', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }],
      ['b-naseem-shah', { id: 'b-naseem-shah', name: 'Naseem Shah', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }],
      ['b-haris-rauf', { id: 'b-haris-rauf', name: 'Haris Rauf', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }],
      ['b-shadab-khan', { id: 'b-shadab-khan', name: 'Shadab Khan', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }],
      ['b-mohammad-nawaz', { id: 'b-mohammad-nawaz', name: 'Mohammad Nawaz', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }],
    ]);

    let totalRuns = 0;
    let totalWickets = 0;
    let legalBalls = 0;
    let wides = 0;
    let noBalls = 0;
    let byes = 0;
    let legByes = 0;
    let penalty = 0;
    let dotBalls = 0;
    let boundaryRuns = 0;

    const fallOfWickets: Innings['fallOfWickets'] = [];
    let currentStrikerId = 'p-kl-rahul';
    let currentNonStrikerId = 'p-rohit-sharma';
    let activeBowlerId = 'b-shaheen-afridi';

    // Track active partnership
    let partnerRuns = 0;
    let partnerBalls = 0;
    let b1Runs = 0;
    let b1Balls = 0;
    let b2Runs = 0;
    let b2Balls = 0;

    // Track bowler legal balls for overs calculation
    const bowlerLegalBalls = new Map<string, number>();

    for (const b of ballsSoFar) {
      const isLegal = b.extrasType !== 'wide' && b.extrasType !== 'noBall';
      if (isLegal) {
        legalBalls++;
        const prevBalls = bowlerLegalBalls.get(b.bowlerId) ?? 0;
        bowlerLegalBalls.set(b.bowlerId, prevBalls + 1);
      }

      totalRuns += b.totalRuns;
      currentStrikerId = b.strikerId;
      currentNonStrikerId = b.nonStrikerId;
      activeBowlerId = b.bowlerId;

      if (b.extrasType === 'wide') wides += b.extrasRuns;
      else if (b.extrasType === 'noBall') noBalls += b.extrasRuns;
      else if (b.extrasType === 'bye') byes += b.extrasRuns;
      else if (b.extrasType === 'legBye') legByes += b.extrasRuns;

      if (b.totalRuns === 0) dotBalls++;
      if (b.isBoundary) boundaryRuns += b.runsBat;

      // Update Batter
      const batter = battersMap.get(b.strikerId);
      if (batter) {
        batter.runs += b.runsBat;
        if (isLegal) batter.balls++;
        if (b.isFour) batter.fours++;
        if (b.isSix) batter.sixes++;
        batter.strikeRate = batter.balls > 0 ? Math.round((batter.runs / batter.balls) * 10000) / 100 : 0;
      }

      // Update Bowler
      const bowler = bowlersMap.get(b.bowlerId);
      if (bowler) {
        // Runs against bowler exclude byes/legByes
        if (b.extrasType !== 'bye' && b.extrasType !== 'legBye') {
          bowler.runs += b.totalRuns;
        }
        if (b.extrasType === 'wide') bowler.wides++;
        if (b.extrasType === 'noBall') bowler.noBalls++;
        if (b.totalRuns === 0) bowler.dots++;
        if (b.isWicket && b.wicketType !== 'run out') bowler.wickets++;

        const bowlerBalls = bowlerLegalBalls.get(b.bowlerId) ?? 0;
        const bOvers = Math.floor(bowlerBalls / 6) + (bowlerBalls % 6) / 10;
        bowler.overs = bOvers;
        bowler.economy = bowlerBalls > 0 ? Math.round((bowler.runs / (bowlerBalls / 6)) * 100) / 100 : 0;
      }

      // Partnership
      partnerRuns += b.totalRuns;
      if (isLegal) partnerBalls++;
      if (b.strikerId === currentStrikerId) {
        b1Runs += b.runsBat;
        if (isLegal) b1Balls++;
      } else {
        b2Runs += b.runsBat;
        if (isLegal) b2Balls++;
      }

      // Wicket
      if (b.isWicket) {
        totalWickets++;
        const dismissedId = b.dismissedPlayerId ?? b.strikerId;
        const dismissedBatter = battersMap.get(dismissedId);
        if (dismissedBatter) {
          dismissedBatter.isOut = true;
          dismissedBatter.dismissal = {
            type: b.wicketType ?? 'caught',
            bowlerName: b.bowlerName,
            text: `${b.wicketType ?? 'out'} b ${b.bowlerName}`,
          };
        }

        const currentOverFloat = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;
        fallOfWickets.push({
          wicketNumber: totalWickets,
          runs: totalRuns,
          overs: currentOverFloat,
          playerDismissedId: dismissedId,
          playerDismissedName: b.dismissedPlayerName ?? dismissedBatter?.name ?? 'Batter',
        });

        // Reset partnership on wicket
        partnerRuns = 0;
        partnerBalls = 0;
        b1Runs = 0;
        b1Balls = 0;
        b2Runs = 0;
        b2Balls = 0;
      }
    }

    const currentOverFloat = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;
    const currentRunRate = legalBalls > 0 ? Math.round((totalRuns / (legalBalls / 6)) * 100) / 100 : 0;
    const targetRuns = 160;
    const ballsRemaining = Math.max(0, 120 - legalBalls);
    const runsNeeded = Math.max(0, targetRuns - totalRuns);
    const requiredRunRate = ballsRemaining > 0 && runsNeeded > 0
      ? Math.round((runsNeeded / (ballsRemaining / 6)) * 100) / 100
      : 0;

    const currentBattersList: [BatterStats, BatterStats] = [
      battersMap.get(currentStrikerId) ?? { id: currentStrikerId, name: 'Striker', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
      battersMap.get(currentNonStrikerId) ?? { id: currentNonStrikerId, name: 'Non-Striker', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
    ];

    const currentBowler = bowlersMap.get(activeBowlerId) ?? {
      id: activeBowlerId,
      name: 'Bowler',
      overs: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: 0,
      wides: 0,
      noBalls: 0,
      dots: 0,
    };

    const currentPartnership: Partnership = {
      runs: partnerRuns,
      balls: partnerBalls,
      batter1Id: currentBattersList[0].id,
      batter1Name: currentBattersList[0].name,
      batter1Runs: b1Runs,
      batter1Balls: b1Balls,
      batter2Id: currentBattersList[1].id,
      batter2Name: currentBattersList[1].name,
      batter2Runs: b2Runs,
      batter2Balls: b2Balls,
    };

    // Calculate thisOver and lastOvers
    const currentOverNumber = ballsSoFar.length > 0 ? ballsSoFar[ballsSoFar.length - 1].over : 0;
    const thisOver = ballsSoFar.filter((b) => b.over === currentOverNumber);

    // Group overs
    const overMap = new Map<number, BallEvent[]>();
    for (const b of ballsSoFar) {
      if (!overMap.has(b.over)) overMap.set(b.over, []);
      overMap.get(b.over)!.push(b);
    }

    const lastOvers: OverSummary[] = [];
    const sortedOverNums = Array.from(overMap.keys()).sort((a, b) => b - a);
    for (const oNum of sortedOverNums.slice(0, 5)) {
      const oBalls = overMap.get(oNum)!;
      const oRuns = oBalls.reduce((acc, cur) => acc + cur.totalRuns, 0);
      const oWickets = oBalls.filter((b) => b.isWicket).length;
      const bSample = oBalls[0];
      lastOvers.push({
        overNumber: oNum,
        bowlerId: bSample.bowlerId,
        bowlerName: bSample.bowlerName,
        runs: oRuns,
        wickets: oWickets,
        balls: oBalls,
      });
    }

    // Win probability
    const winProb = calculateWinProbability({
      format: 'T20',
      inningsNumber: 2,
      teamAId: this.match.teamA.id,
      teamAName: this.match.teamA.name,
      teamBId: this.match.teamB.id,
      teamBName: this.match.teamB.name,
      battingTeamId: this.match.teamA.id, // India batting
      runs: totalRuns,
      wickets: totalWickets,
      balls: legalBalls,
      targetRuns,
    });

    const isMatchEnded = totalRuns >= targetRuns || totalWickets >= 10 || (legalBalls >= 120 && totalRuns < targetRuns);
    let matchStatus = this.match.status;
    let statusText = `India need ${runsNeeded} off ${ballsRemaining} balls`;

    if (totalRuns >= targetRuns) {
      matchStatus = 'completed';
      statusText = `India won by ${10 - totalWickets} wickets`;
      this.match.winnerId = this.match.teamA.id;
      this.match.resultText = statusText;
    } else if (totalWickets >= 10 || (legalBalls >= 120 && totalRuns < targetRuns)) {
      matchStatus = 'completed';
      statusText = `Pakistan won by ${targetRuns - totalRuns - 1} runs`;
      this.match.winnerId = this.match.teamB.id;
      this.match.resultText = statusText;
    }

    this.match.status = matchStatus;
    this.match.statusText = statusText;

    const secondInnings: Innings = {
      id: 'innings-2',
      matchId: this.match.id,
      inningsNumber: 2,
      battingTeamId: this.match.teamA.id,
      bowlingTeamId: this.match.teamB.id,
      runs: totalRuns,
      wickets: totalWickets,
      overs: currentOverFloat,
      balls: legalBalls,
      runRate: currentRunRate,
      targetRuns,
      requiredRunRate: ballsRemaining > 0 ? requiredRunRate : undefined,
      extras: {
        wides,
        noBalls,
        byes,
        legByes,
        penalty,
        total: wides + noBalls + byes + legByes + penalty,
      },
      batters: Array.from(battersMap.values()).filter((b) => b.balls > 0 || b.isOut || b.id === currentStrikerId || b.id === currentNonStrikerId),
      bowlers: Array.from(bowlersMap.values()).filter((b) => (bowlerLegalBalls.get(b.id) ?? 0) > 0 || b.wides > 0 || b.noBalls > 0),
      fallOfWickets,
      isCompleted: isMatchEnded,
    };

    const dotPct = legalBalls > 0 ? Math.round((dotBalls / legalBalls) * 1000) / 10 : 0;
    const boundaryPct = totalRuns > 0 ? Math.round((boundaryRuns / totalRuns) * 1000) / 10 : 0;

    const rawState = {
      match: this.match,
      currentInnings: secondInnings,
      innings: [this.firstInnings, secondInnings],
      currentBatters: currentBattersList,
      currentBowler,
      currentPartnership,
      thisOver,
      lastOvers,
      recentBalls: ballsSoFar.slice(-18),
      analytics: {
        currentRunRate,
        requiredRunRate: ballsRemaining > 0 ? requiredRunRate : undefined,
        projectedScore: winProb.projectedScore,
        dotBallPercentage: dotPct,
        boundaryPercentage: boundaryPct,
        winProbability: winProb,
      },
      sequence: this.sequence,
      lastUpdated: Date.now(),
    };

    const stateHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ runs: totalRuns, wickets: totalWickets, balls: legalBalls, seq: this.sequence }))
      .digest('hex');

    return {
      ...rawState,
      stateHash,
    };
  }

  public async getLiveMatches(): Promise<Match[]> {
    return [this.match];
  }

  public async getMatchSnapshot(matchId: string): Promise<MatchState> {
    if (matchId !== this.match.id) {
      throw new Error(`Match ${matchId} not found in MockProvider`);
    }
    return this.buildCurrentState();
  }

  public async getFixtures(range?: DateRange): Promise<Match[]> {
    return [this.match];
  }

  public async getScorecard(matchId: string): Promise<Scorecard> {
    const state = await this.getMatchSnapshot(matchId);
    return {
      match: state.match,
      innings: state.innings,
    };
  }

  public async getCommentary(matchId: string, cursor?: string): Promise<Commentary[]> {
    const ballsSoFar = this.allBalls.slice(0, this.currentBallIndex);
    return ballsSoFar
      .map((b) => ({
        id: b.ballId,
        matchId: b.matchId,
        sequence: b.sequence,
        over: b.over,
        ball: b.ballInOver,
        displayOver: b.displayOver,
        text: b.commentary,
        runs: b.totalRuns,
        isBoundary: b.isBoundary,
        isWicket: b.isWicket,
        timestamp: b.timestamp,
      }))
      .reverse();
  }
}
