import { z } from 'zod';

export const CricketDataApiInfoSchema = z.object({
  hitsToday: z.number().optional(),
  hitsUsed: z.number().optional(),
  hitsLimit: z.number().optional(),
  remHits: z.number().optional(),
  credits: z.number().optional(),
  server: z.number().optional(),
  offsetRows: z.number().optional(),
  totalRows: z.number().optional(),
  queryTime: z.number().optional(),
  s: z.number().optional(),
  cache: z.number().optional(),
});

export const CricketDataTeamInfoSchema = z.object({
  name: z.string(),
  shortname: z.string().optional(),
  img: z.string().optional(),
});

export const CricketDataScoreItemSchema = z.object({
  r: z.number(),
  w: z.number(),
  o: z.number(),
  inning: z.string(),
});

export const CricketDataMatchItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  matchType: z.string(),
  status: z.string(),
  venue: z.string().optional().default('Venue TBD'),
  date: z.string().optional(),
  dateTimeGMT: z.string().optional(),
  teams: z.array(z.string()).default([]),
  teamInfo: z.array(CricketDataTeamInfoSchema).optional(),
  score: z.array(CricketDataScoreItemSchema).optional().default([]),
  series_id: z.string().optional(),
  fantasyEnabled: z.boolean().optional(),
  bbbEnabled: z.boolean().optional(),
  hasSquad: z.boolean().optional(),
  matchStarted: z.boolean().optional(),
  matchEnded: z.boolean().optional(),
  tossWinner: z.string().nullable().optional(),
  tossChoice: z.string().nullable().optional(),
  matchWinner: z.string().nullable().optional(),
});

export const CricketDataCurrentMatchesResponseSchema = z.object({
  apikey: z.string().optional(),
  data: z.array(CricketDataMatchItemSchema).default([]),
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

export const CricketDataMatchesResponseSchema = z.object({
  apikey: z.string().optional(),
  data: z.array(CricketDataMatchItemSchema).default([]),
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

export const CricketDataMatchInfoResponseSchema = z.object({
  apikey: z.string().optional(),
  data: CricketDataMatchItemSchema,
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

// Scorecard batting / bowling schemas
export const CricketDataBatsmanSchema = z.object({
  batsman: z.object({
    id: z.string().optional(),
    name: z.string(),
  }),
  dismissal: z.string().optional(),
  'dismissal-text': z.string().optional(),
  r: z.number().default(0),
  b: z.number().default(0),
  '4s': z.number().default(0),
  '6s': z.number().default(0),
  sr: z.number().default(0),
});

export const CricketDataBowlerSchema = z.object({
  bowler: z.object({
    id: z.string().optional(),
    name: z.string(),
  }),
  o: z.number().default(0),
  m: z.number().default(0),
  r: z.number().default(0),
  w: z.number().default(0),
  eco: z.number().default(0),
});

export const CricketDataInningScorecardSchema = z.object({
  inning: z.string(),
  batting: z.array(CricketDataBatsmanSchema).optional().default([]),
  bowling: z.array(CricketDataBowlerSchema).optional().default([]),
  catching: z.array(z.any()).optional().default([]),
  extras: z
    .object({
      r: z.number().default(0),
      w: z.number().default(0),
      nb: z.number().default(0),
      b: z.number().default(0),
      lb: z.number().default(0),
      p: z.number().default(0),
    })
    .optional(),
  totals: z
    .object({
      R: z.number().default(0),
      O: z.number().default(0),
      W: z.number().default(0),
      RR: z.number().optional().default(0),
    })
    .optional(),
});

export const CricketDataScorecardResponseSchema = z.object({
  apikey: z.string().optional(),
  data: CricketDataMatchItemSchema.extend({
    scorecard: z.array(CricketDataInningScorecardSchema).optional().default([]),
  }),
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

export const CricketDataSeriesItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  odi: z.number().optional(),
  t20: z.number().optional(),
  test: z.number().optional(),
  squads: z.number().optional(),
  matches: z.number().optional(),
});

export const CricketDataSeriesListResponseSchema = z.object({
  apikey: z.string().optional(),
  data: z.array(CricketDataSeriesItemSchema).default([]),
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

export const CricketDataSeriesInfoResponseSchema = z.object({
  apikey: z.string().optional(),
  data: z.object({
    info: z.record(z.any()).optional(),
    matchList: z.array(CricketDataMatchItemSchema).default([]),
  }),
  status: z.string(),
  info: CricketDataApiInfoSchema.optional(),
});

export type CricketDataMatchItem = z.infer<typeof CricketDataMatchItemSchema>;
export type CricketDataCurrentMatchesResponse = z.infer<typeof CricketDataCurrentMatchesResponseSchema>;
export type CricketDataMatchesResponse = z.infer<typeof CricketDataMatchesResponseSchema>;
export type CricketDataMatchInfoResponse = z.infer<typeof CricketDataMatchInfoResponseSchema>;
export type CricketDataScorecardResponse = z.infer<typeof CricketDataScorecardResponseSchema>;
export type CricketDataSeriesListResponse = z.infer<typeof CricketDataSeriesListResponseSchema>;
export type CricketDataSeriesInfoResponse = z.infer<typeof CricketDataSeriesInfoResponseSchema>;
