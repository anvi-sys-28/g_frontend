import type { CricketProvider, DateRange } from '../types.js';
import type { Match, MatchState, Scorecard, Commentary } from '../../types/models.js';

/**
 * STUB: Roanuz Cricket API Provider
 * Docs: https://www.cricketapi.com/documentation/
 *
 * TODO: Implement when a Roanuz API license key is available.
 * Required steps:
 * 1. Implement Roanuz OAuth token exchange (POST to /v5/core/{app_id}/auth/).
 * 2. Connect to Roanuz WebSocket endpoint for ultra-low latency ball-by-ball push.
 * 3. Map Roanuz match summary schema to internal Match model.
 * 4. Map Roanuz ball-by-ball payload into internal BallEvent model.
 */
export class RoanuzCricketProvider implements CricketProvider {
  public readonly name = 'roanuz';

  public async getLiveMatches(): Promise<Match[]> {
    throw new Error('RoanuzCricketProvider not implemented yet. Set CRICKET_PROVIDER=mock or cricketdata.');
  }

  public async getMatchSnapshot(matchId: string): Promise<MatchState> {
    throw new Error('RoanuzCricketProvider not implemented yet.');
  }

  public async getFixtures(range?: DateRange): Promise<Match[]> {
    throw new Error('RoanuzCricketProvider not implemented yet.');
  }

  public async getScorecard(matchId: string): Promise<Scorecard> {
    throw new Error('RoanuzCricketProvider not implemented yet.');
  }

  public async getCommentary(matchId: string, cursor?: string): Promise<Commentary[]> {
    throw new Error('RoanuzCricketProvider not implemented yet.');
  }
}

/**
 * STUB: Sportradar Cricket API Provider
 * Docs: https://developer.sportradar.com/docs/read/cricket/Cricket_v2
 *
 * TODO: Implement when Sportradar Cricket v2 API access is provisioned.
 * Required steps:
 * 1. Provision Sportradar API Key with trial or production subscription.
 * 2. Call /cricket-t2/en/tournaments/live_summaries.json for live polling.
 * 3. Map Sportradar match timelines, probabilities, and player statistics.
 */
export class SportradarCricketProvider implements CricketProvider {
  public readonly name = 'sportradar';

  public async getLiveMatches(): Promise<Match[]> {
    throw new Error('SportradarCricketProvider not implemented yet. Set CRICKET_PROVIDER=mock or cricketdata.');
  }

  public async getMatchSnapshot(matchId: string): Promise<MatchState> {
    throw new Error('SportradarCricketProvider not implemented yet.');
  }

  public async getFixtures(range?: DateRange): Promise<Match[]> {
    throw new Error('SportradarCricketProvider not implemented yet.');
  }

  public async getScorecard(matchId: string): Promise<Scorecard> {
    throw new Error('SportradarCricketProvider not implemented yet.');
  }

  public async getCommentary(matchId: string, cursor?: string): Promise<Commentary[]> {
    throw new Error('SportradarCricketProvider not implemented yet.');
  }
}
