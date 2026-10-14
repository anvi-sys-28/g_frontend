import type { Match, MatchState, Scorecard, Commentary } from '../types/models.js';

export interface DateRange {
  from?: Date | string;
  to?: Date | string;
}

export interface CricketProvider {
  readonly name: string;
  getLiveMatches(): Promise<Match[]>;
  getMatchSnapshot(matchId: string): Promise<MatchState>;
  getFixtures(range?: DateRange): Promise<Match[]>;
  getScorecard(matchId: string): Promise<Scorecard>;
  getCommentary(matchId: string, cursor?: string): Promise<Commentary[]>;
}
