import { Match } from '@/types/models';
import { redis } from './redis';

export interface MatchesDataMeta {
  provider: string;
  dailyBudget: number;
  usableBudget: number;
  callsToday: number;
  remainingBudget: number;
  lastSuccessfulFetch: string | null;
  lastError: string | null;
  nextScheduledPoll: string | null;
  pollIntervalMs: number;
  isBudgetExhausted: boolean;
  totalMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  finishedMatches: number;
  updatedAt: string;
}

export interface TodayMatchesResponse {
  matches: Match[];
  meta: MatchesDataMeta;
  isMock: boolean;
}

const FALLBACK_MATCHES: Match[] = [
  {
    id: 'mock-live-1',
    slug: 'ind-vs-aus-1st-t20i-2026',
    title: 'India vs Australia, 1st T20I',
    seriesId: 'series-ind-aus-2026',
    seriesName: 'Australia Tour of India 2026',
    format: 'T20',
    status: 'live',
    statusText: 'IND need 32 runs in 24 balls to win',
    venue: 'Wankhede Stadium',
    city: 'Mumbai',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    currentInningsNumber: 2,
    teamA: {
      id: 'team-ind',
      name: 'India',
      shortName: 'IND',
      code: 'IND',
      primaryColor: '#1d4ed8',
    },
    teamB: {
      id: 'team-aus',
      name: 'Australia',
      shortName: 'AUS',
      code: 'AUS',
      primaryColor: '#eab308',
    },
    teamAScore: {
      runs: 165,
      wickets: 3,
      overs: 16.0,
      display: '165/3 (16.0 ov)',
    },
    teamBScore: {
      runs: 196,
      wickets: 6,
      overs: 20.0,
      display: '196/6 (20.0 ov)',
    },
  },
  {
    id: 'mock-live-2',
    slug: 'csk-vs-mi-ipl-2026',
    title: 'Chennai Super Kings vs Mumbai Indians, Match 24',
    seriesId: 'series-ipl-2026',
    seriesName: 'Indian Premier League 2026',
    format: 'T20',
    status: 'live',
    statusText: 'MI opt to bowl first | Rain delayed start',
    venue: 'M. A. Chidambaram Stadium',
    city: 'Chennai',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    currentInningsNumber: 1,
    teamA: {
      id: 'team-csk',
      name: 'Chennai Super Kings',
      shortName: 'CSK',
      code: 'CSK',
      primaryColor: '#facc15',
    },
    teamB: {
      id: 'team-mi',
      name: 'Mumbai Indians',
      shortName: 'MI',
      code: 'MI',
      primaryColor: '#0284c7',
    },
    teamAScore: {
      runs: 182,
      wickets: 4,
      overs: 18.2,
      display: '182/4 (18.2 ov)',
    },
  },
  {
    id: 'mock-upcoming-1',
    slug: 'eng-vs-sa-3rd-odi-2026',
    title: 'England vs South Africa, 3rd ODI',
    seriesId: 'series-eng-sa-2026',
    seriesName: 'South Africa Tour of England 2026',
    format: 'ODI',
    status: 'upcoming',
    statusText: 'Match starts at 14:00 local time',
    venue: "Lord's Cricket Ground",
    city: 'London',
    startTime: new Date(Date.now() + 14400000).toISOString(),
    currentInningsNumber: 0,
    teamA: {
      id: 'team-eng',
      name: 'England',
      shortName: 'ENG',
      code: 'ENG',
      primaryColor: '#dc2626',
    },
    teamB: {
      id: 'team-sa',
      name: 'South Africa',
      shortName: 'SA',
      code: 'SA',
      primaryColor: '#16a34a',
    },
  },
];

export async function getTodayMatches(): Promise<TodayMatchesResponse> {
  const providerConfig = process.env.CRICKET_PROVIDER || 'cricketdata';
  const isMock = providerConfig === 'mock';

  // 1. Try reading directly from Redis cache
  try {
    if (redis) {
      if (redis.status === 'wait') {
        await redis.connect();
      }

      const [matchesRaw, metaRaw] = await Promise.all([
        redis.get('matches:today'),
        redis.get('matches:today:meta'),
      ]);

      if (matchesRaw) {
        const matches: Match[] = JSON.parse(matchesRaw);
        const meta: MatchesDataMeta = metaRaw
          ? JSON.parse(metaRaw)
          : {
              provider: providerConfig,
              dailyBudget: 100,
              usableBudget: 80,
              callsToday: 1,
              remainingBudget: 79,
              lastSuccessfulFetch: new Date().toISOString(),
              lastError: null,
              nextScheduledPoll: null,
              pollIntervalMs: 60000,
              isBudgetExhausted: false,
              totalMatches: matches.length,
              liveMatches: matches.filter((m) => m.status === 'live').length,
              upcomingMatches: matches.filter((m) => m.status === 'upcoming').length,
              finishedMatches: matches.filter((m) => m.status === 'completed' || m.status === 'abandoned').length,
              updatedAt: new Date().toISOString(),
            };

        return { matches, meta, isMock };
      }
    }
  } catch (err: any) {
    // Redis unavailable or connection timeout, fallback to HTTP
  }

  // 2. Try fetching from backend / realtime service REST endpoint
  const backendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_REALTIME_URL ||
    'http://localhost:4001';

  try {
    const res = await fetch(`${backendUrl}/api/matches/today`, {
      next: { revalidate: 2 },
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.matches) && json.matches.length > 0) {
        return {
          matches: json.matches,
          meta: json.meta || {
            provider: providerConfig,
            updatedAt: new Date().toISOString(),
          },
          isMock,
        };
      }
    }
  } catch {
    // Backend service currently starting or unreachable
  }

  // 3. Fallback: Return resilient initial matches
  return {
    matches: FALLBACK_MATCHES,
    meta: {
      provider: 'fallback',
      dailyBudget: 100,
      usableBudget: 80,
      callsToday: 0,
      remainingBudget: 80,
      lastSuccessfulFetch: new Date().toISOString(),
      lastError: null,
      nextScheduledPoll: null,
      pollIntervalMs: 60000,
      isBudgetExhausted: false,
      totalMatches: FALLBACK_MATCHES.length,
      liveMatches: FALLBACK_MATCHES.filter((m) => m.status === 'live').length,
      upcomingMatches: FALLBACK_MATCHES.filter((m) => m.status === 'upcoming').length,
      finishedMatches: FALLBACK_MATCHES.filter((m) => m.status === 'completed' || m.status === 'abandoned').length,
      updatedAt: new Date().toISOString(),
    },
    isMock: true,
  };
}
