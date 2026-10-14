/**
 * Comprehensive Team Code Lookup Table and Helper.
 * Maps team names to standard 3-letter codes.
 * Falls back gracefully to shortname hints or first 3 uppercase letters.
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
  'bhutan': 'BHU',
  'maldives': 'MDV',
  'saudi arabia': 'KSA',
  'china': 'CHN',
  'bermuda': 'BER',
  'kenya': 'KEN',

  // Indian Premier League (IPL)
  'chennai super kings': 'CSK',
  'csk': 'CSK',
  'mumbai indians': 'MI',
  'mi': 'MI',
  'royal challengers bangalore': 'RCB',
  'royal challengers bengaluru': 'RCB',
  'rcb': 'RCB',
  'kolkata knight riders': 'KKR',
  'kkr': 'KKR',
  'rajasthan royals': 'RR',
  'rr': 'RR',
  'sunrisers hyderabad': 'SRH',
  'srh': 'SRH',
  'delhi capitals': 'DC',
  'dc': 'DC',
  'punjab kings': 'PBKS',
  'kings xi punjab': 'PBKS',
  'pbks': 'PBKS',
  'gujarat titans': 'GT',
  'gt': 'GT',
  'lucknow super giants': 'LSG',
  'lsg': 'LSG',

  // Big Bash League (BBL)
  'sydney sixers': 'SYS',
  'perth scorchers': 'PRS',
  'melbourne stars': 'MLS',
  'melbourne renegades': 'MLR',
  'adelaide strikers': 'ADS',
  'brisbane heat': 'BRH',
  'hobart hurricanes': 'HBH',
  'sydney thunder': 'SYT',

  // Pakistan Super League (PSL)
  'lahore qalandars': 'LQ',
  'karachi kings': 'KK',
  'islamabad united': 'IU',
  'peshawar zalmi': 'PZ',
  'quetta gladiators': 'QG',
  'multan sultans': 'MS',

  // Australian Domestic (Sheffield Shield / Marsh Cup)
  'western australia': 'WA',
  'new south wales': 'NSW',
  'victoria': 'VIC',
  'queensland': 'QLD',
  'south australia': 'SOA',
  'tasmania': 'TAS',

  // Indian Domestic (Ranji / Syed Mushtaq Ali / Vijay Hazare)
  'mumbai': 'MUM',
  'karnataka': 'KAR',
  'tamil nadu': 'TN',
  'delhi': 'DEL',
  'bengal': 'BEN',
  'saurashtra': 'SAU',
  'uttar pradesh': 'UP',
  'baroda': 'BAR',
  'vidarbha': 'VID',
  'punjab': 'PUN',
  'hyderabad': 'HYD',
  'madhya pradesh': 'MP',
  'rajasthan': 'RAJ',
  'arunachal pradesh': 'AP',
};

/**
 * Returns a standardized 3-letter (or 2-4 letter) uppercase team code.
 */
export function getTeamCode(teamName: string, shortnameHint?: string): string {
  if (!teamName && !shortnameHint) return 'TBD';

  if (shortnameHint) {
    const hintClean = shortnameHint.trim().toUpperCase();
    if (hintClean.length >= 2 && hintClean.length <= 4) {
      return hintClean;
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

  // Check words matching keys
  for (const [key, code] of Object.entries(TEAM_CODE_MAP)) {
    if (normalized.startsWith(key) || normalized.includes(key)) {
      return code;
    }
  }

  // Multi-word team name: take acronym of words if 2-4 words
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 4) {
    return words.map((w) => w[0]).join('').toUpperCase();
  }

  // Fallback: first 3 characters uppercased
  const letters = normalized.replace(/[^a-z]/g, '');
  return letters.slice(0, 3).toUpperCase() || 'TBD';
}
