/**
 * Comprehensive Team Code Lookup Table and Helper for Frontend.
 * Maps team names to standard 3-letter codes.
 */

export const TEAM_CODE_MAP: Record<string, string> = {
  // ICC Full Members
  'india': 'IND',
  'ind': 'IND',
  'australia': 'AUS',
  'aus': 'AUS',
  'england': 'ENG',
  'eng': 'ENG',
  'pakistan': 'PAK',
  'pak': 'PAK',
  'south africa': 'SA',
  'sa': 'SA',
  'new zealand': 'NZ',
  'nz': 'NZ',
  'west indies': 'WI',
  'wi': 'WI',
  'sri lanka': 'SL',
  'sl': 'SL',
  'bangladesh': 'BAN',
  'ban': 'BAN',
  'afghanistan': 'AFG',
  'afg': 'AFG',
  'ireland': 'IRE',
  'ire': 'IRE',
  'zimbabwe': 'ZIM',
  'zim': 'ZIM',

  // Associate & Emerging Nations
  'netherlands': 'NED',
  'scotland': 'SCO',
  'united states': 'USA',
  'united states of america': 'USA',
  'usa': 'USA',
  'namibia': 'NAM',
  'nepal': 'NEP',
  'united arab emirates': 'UAE',
  'uae': 'UAE',
  'oman': 'OMA',
  'canada': 'CAN',
  'papua new guinea': 'PNG',
  'png': 'PNG',
  'uganda': 'UGA',
  'hong kong': 'HK',
  'hong kong china': 'HK',
  'kuwait': 'KUW',
  'jersey': 'JER',
  'italy': 'ITA',
  'singapore': 'SIN',
  'malaysia': 'MAS',
  'thailand': 'THA',
  'bahrain': 'BHR',
  'qatar': 'QAT',
  'myanmar': 'MYA',
  'mongolia': 'MGL',

  // IPL Franchises
  'chennai super kings': 'CSK',
  'mumbai indians': 'MI',
  'royal challengers bengaluru': 'RCB',
  'royal challengers bangalore': 'RCB',
  'kolkata knight riders': 'KKR',
  'delhi capitals': 'DC',
  'punjab kings': 'PBKS',
  'rajasthan royals': 'RR',
  'sunrisers hyderabad': 'SRH',
  'gujarat titans': 'GT',
  'lucknow super giants': 'LSG',
};

export function getTeamCode(teamName: string, shortnameHint?: string): string {
  if (shortnameHint) {
    const cleanHint = shortnameHint.trim().toUpperCase();
    if (cleanHint.length >= 2 && cleanHint.length <= 5 && !cleanHint.includes(' ')) {
      return cleanHint;
    }
  }

  const normalized = (teamName || '')
    .toLowerCase()
    .replace(/\b(cricket\s*team|men|women|u19|under-19|xi)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  if (TEAM_CODE_MAP[normalized]) {
    return TEAM_CODE_MAP[normalized];
  }

  for (const [key, code] of Object.entries(TEAM_CODE_MAP)) {
    if (normalized.startsWith(key) || normalized.includes(key)) {
      return code;
    }
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 4) {
    return words.map((w) => w[0]).join('').toUpperCase();
  }

  const letters = normalized.replace(/[^a-z]/g, '');
  return letters.slice(0, 3).toUpperCase() || 'TBD';
}
