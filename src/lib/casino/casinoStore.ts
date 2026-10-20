import fs from 'fs';
import path from 'path';

export interface CasinoUserRecord {
  id: string;
  userId: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  coins: number;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface CasinoBetRecord {
  id: string;
  userId: string;
  playerName: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  roundId: number;
  betAmount: number;
  payout: number;
  won: boolean;
  balanceAfter: number;
  details: any;
  createdAt: string;
}

export interface CoinTransactionRecord {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: 'ADMIN_ALLOT' | 'BET_SPENT' | 'BET_WON' | 'REQUEST_APPROVED';
  note?: string;
  createdAt: string;
}

export interface ActiveSessionRecord {
  userId: string;
  playerName: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR' | 'LOUNGE';
  lastSeen: number;
}

export interface LiveRouletteBet {
  userId: string;
  playerName: string;
  numbers: number[];
  amount: number;
  label: string;
  placedAt: number;
}

export interface LiveAndarBaharBet {
  userId: string;
  playerName: string;
  side: 'ANDAR' | 'BAHAR';
  amount: number;
  placedAt: number;
}

interface CasinoStorageData {
  users: Record<string, CasinoUserRecord>;
  bets: CasinoBetRecord[];
  transactions: CoinTransactionRecord[];
}

function getStorageFile(): string {
  const cwd = process.cwd();
  const parentFile = path.resolve(cwd, '..', 'data', 'casino_data.json');
  const directFile = path.resolve(cwd, 'data', 'casino_data.json');

  if (fs.existsSync(parentFile)) return parentFile;
  if (fs.existsSync(directFile)) return directFile;

  if (fs.existsSync(path.resolve(cwd, '..', 'package.json'))) {
    return parentFile;
  }
  return directFile;
}

// In-memory runtime cache for high-speed concurrent gaming
let cache: CasinoStorageData | null = null;
const activeSessions = new Map<string, ActiveSessionRecord>();
const liveRouletteBets = new Map<number, LiveRouletteBet[]>();
const liveAndarBaharBets = new Map<number, LiveAndarBaharBet[]>();
const deductedWagers = new Map<string, number>();
const settledRounds = new Set<string>();

function ensureStorageDir() {
  const file = getStorageFile();
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

function loadData(): CasinoStorageData {
  if (cache) return cache;
  ensureStorageDir();
  const storageFile = getStorageFile();

  const defaultData: CasinoStorageData = {
    users: {
      admin: {
        id: 'u_admin',
        userId: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        coins: 9999999,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      test2: {
        id: 'u_test2',
        userId: 'test2',
        password: 'pass',
        role: 'USER',
        coins: 100000000,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      vip_player: {
        id: 'u_vip_player',
        userId: 'vip_player',
        password: 'pass123',
        role: 'USER',
        coins: 50000,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    },
    bets: [],
    transactions: [],
  };

  if (fs.existsSync(storageFile)) {
    try {
      const content = fs.readFileSync(storageFile, 'utf-8');
      const parsed = JSON.parse(content);
      cache = {
        users: { ...defaultData.users, ...(parsed.users || {}) },
        bets: Array.isArray(parsed.bets) ? parsed.bets : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      };
      return cache;
    } catch (e) {
      console.error('Error reading casino_data.json, using default data:', e);
    }
  }

  cache = defaultData;
  saveData(cache);
  return cache;
}

function saveData(data: CasinoStorageData) {
  cache = data;
  ensureStorageDir();
  try {
    const file = getStorageFile();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing casino_data.json:', e);
  }
}

export const casinoStore = {
  // Session & Online Presence Tracking
  touchSession(userId: string, playerName: string, game: 'ROULETTE' | 'ANDAR_BAHAR' | 'LOUNGE') {
    const cleanId = String(userId).trim();
    if (!cleanId) return;
    const now = Date.now();
    activeSessions.set(cleanId, {
      userId: cleanId,
      playerName: playerName || cleanId,
      game,
      lastSeen: now,
    });
  },

  getOnlineCount(game: 'ROULETTE' | 'ANDAR_BAHAR'): { count: number; players: string[] } {
    const now = Date.now();
    const active: string[] = [];
    for (const [uid, sess] of activeSessions.entries()) {
      if (sess.game === game && now - sess.lastSeen < 15000) {
        active.push(sess.playerName || uid);
      }
    }
    // Return authentic real count (at least 1 if active)
    return {
      count: Math.max(1, active.length),
      players: active.length > 0 ? active : ['You'],
    };
  },

  // User Management
  getUser(userId: string): CasinoUserRecord | null {
    const data = loadData();
    const clean = String(userId).trim().toLowerCase();
    for (const key of Object.keys(data.users)) {
      if (key.toLowerCase() === clean) {
        return data.users[key];
      }
    }
    return null;
  },

  getAllUsers(): CasinoUserRecord[] {
    const data = loadData();
    return Object.values(data.users);
  },

  createUser(userId: string, password: string, initialCoins: number = 0): CasinoUserRecord {
    const data = loadData();
    const clean = String(userId).trim();
    const existing = this.getUser(clean);
    if (existing) {
      throw new Error(`User with ID "${clean}" already exists.`);
    }

    const newUser: CasinoUserRecord = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: clean,
      password: String(password).trim(),
      role: 'USER',
      coins: Math.max(0, Number(initialCoins) || 0),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    data.users[clean] = newUser;
    if (newUser.coins > 0) {
      data.transactions.push({
        id: `tx_${Date.now()}`,
        userId: clean,
        amount: newUser.coins,
        balanceAfter: newUser.coins,
        type: 'ADMIN_ALLOT',
        note: 'Initial account allotment by Admin',
        createdAt: new Date().toISOString(),
      });
    }

    saveData(data);
    return newUser;
  },

  allotCoins(userId: string, amount: number, note: string = 'Admin allotment'): number {
    const data = loadData();
    const clean = String(userId).trim();
    const user = this.getUser(clean);
    if (!user) throw new Error(`User "${clean}" not found.`);

    const allot = Math.max(0, Number(amount) || 0);
    user.coins += allot;
    data.users[user.userId] = user;

    data.transactions.push({
      id: `tx_${Date.now()}`,
      userId: user.userId,
      amount: allot,
      balanceAfter: user.coins,
      type: 'ADMIN_ALLOT',
      note,
      createdAt: new Date().toISOString(),
    });

    saveData(data);
    return user.coins;
  },

  // Deduct Coins on Bet Placement
  deductCoinsForBet(userId: string, amount: number, game: 'ROULETTE' | 'ANDAR_BAHAR', roundId: number): number {
    const data = loadData();
    const clean = String(userId).trim();
    let user = this.getUser(clean);

    if (!user) {
      // Auto-register user if not present so game never breaks
      user = this.createUser(clean, 'pass123', 50000);
    }

    const wager = Math.floor(Number(amount));
    if (wager <= 0) return user.coins;

    if (user.coins < wager) {
      throw new Error(`INSUFFICIENT_COINS: Balance is ${user.coins}, bet requires ${wager}`);
    }

    user.coins -= wager;
    data.users[user.userId] = user;

    data.transactions.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.userId,
      amount: -wager,
      balanceAfter: user.coins,
      type: 'BET_SPENT',
      note: `Bet on ${game} Round #${roundId}`,
      createdAt: new Date().toISOString(),
    });

    saveData(data);

    // Track this deduction so settleRound knows it was already deducted from balance
    const trackKey = `${game}_${roundId}_${clean.toLowerCase()}`;
    deductedWagers.set(trackKey, (deductedWagers.get(trackKey) || 0) + wager);

    return user.coins;
  },

  // Authoritative, Idempotent Round Settlement
  settleRound(params: {
    userId: string;
    playerName?: string;
    game: 'ROULETTE' | 'ANDAR_BAHAR';
    roundId: number;
    wager: number;
    payout: number;
    won: boolean;
    details?: any;
  }): { newBalance: number; betRecord: CasinoBetRecord } {
    const { userId, playerName, game, roundId, wager, payout, won, details } = params;
    const data = loadData();
    const clean = String(userId).trim();
    let user = this.getUser(clean);
    if (!user) {
      user = this.createUser(clean, 'pass123', 50000);
    }

    const cleanWager = Math.max(0, Math.floor(Number(wager) || 0));
    const cleanPayout = Math.max(0, Math.floor(Number(payout) || 0));
    const trackKey = `${game}_${roundId}_${clean.toLowerCase()}`;

    // Prevent duplicate settlement if client retries or multiple events fire
    if (settledRounds.has(trackKey)) {
      const existingBet = data.bets.find(
        (b) => b.game === game && b.roundId === roundId && b.userId.toLowerCase() === clean.toLowerCase()
      );
      return {
        newBalance: user.coins,
        betRecord: existingBet || {
          id: `bet_${Date.now()}`,
          userId: user.userId,
          playerName: playerName || user.userId,
          game,
          roundId,
          betAmount: cleanWager,
          payout: cleanPayout,
          won,
          balanceAfter: user.coins,
          details: details || {},
          createdAt: new Date().toISOString(),
        },
      };
    }

    settledRounds.add(trackKey);
    // Keep settledRounds bounded
    if (settledRounds.size > 2000) {
      const firstKey = settledRounds.values().next().value;
      if (firstKey) settledRounds.delete(firstKey);
    }

    const alreadyDeducted = deductedWagers.get(trackKey) || 0;
    deductedWagers.delete(trackKey);

    if (won && cleanPayout > 0) {
      if (alreadyDeducted > 0) {
        // Wager was already subtracted in /live. Credit the full payout to user balance.
        user.coins += cleanPayout;
        data.transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.userId,
          amount: cleanPayout,
          balanceAfter: user.coins,
          type: 'BET_WON',
          note: `Won ${cleanPayout} coins on ${game} Round #${roundId}`,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Wager was NOT subtracted during /live (network hiccup/fallback).
        // Credit net gain (cleanPayout - cleanWager).
        const netGain = cleanPayout - cleanWager;
        user.coins = Math.max(0, user.coins + netGain);
        data.transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.userId,
          amount: netGain,
          balanceAfter: user.coins,
          type: 'BET_WON',
          note: `Won ${cleanPayout} coins (net +${netGain}) on ${game} Round #${roundId}`,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // LOSS (won === false or cleanPayout === 0)
      if (alreadyDeducted > 0) {
        // Wager was ALREADY deducted from user.coins during /live.
        // The balance is ALREADY correct (decreased by wager). No additional deduction needed.
      } else if (cleanWager > 0) {
        // Wager was NOT deducted during /live. Deduct it now so loss is faithfully reflected!
        user.coins = Math.max(0, user.coins - cleanWager);
        data.transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.userId,
          amount: -cleanWager,
          balanceAfter: user.coins,
          type: 'BET_SPENT',
          note: `Lost ${cleanWager} coins on ${game} Round #${roundId}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    data.users[user.userId] = user;

    const betRecord: CasinoBetRecord = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.userId,
      playerName: playerName || user.userId,
      game,
      roundId,
      betAmount: cleanWager,
      payout: cleanPayout,
      won: Boolean(won),
      balanceAfter: user.coins,
      details: details || {},
      createdAt: new Date().toISOString(),
    };

    data.bets.unshift(betRecord);
    if (data.bets.length > 500) {
      data.bets = data.bets.slice(0, 500);
    }

    saveData(data);
    return { newBalance: user.coins, betRecord };
  },

  // Credit Coins on Win (direct helper)
  creditCoinsForWin(userId: string, payout: number, game: 'ROULETTE' | 'ANDAR_BAHAR', roundId: number): number {
    const data = loadData();
    const clean = String(userId).trim();
    const user = this.getUser(clean);
    if (!user) return 0;

    const winAmount = Math.floor(Number(payout));
    if (winAmount <= 0) return user.coins;

    user.coins += winAmount;
    data.users[user.userId] = user;

    data.transactions.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.userId,
      amount: winAmount,
      balanceAfter: user.coins,
      type: 'BET_WON',
      note: `Won ${winAmount} coins from ${game} Round #${roundId}`,
      createdAt: new Date().toISOString(),
    });

    saveData(data);
    return user.coins;
  },

  // Record Settled Bet
  recordSettledBet(record: Omit<CasinoBetRecord, 'id' | 'createdAt'>): CasinoBetRecord {
    const data = loadData();
    const bet: CasinoBetRecord = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...record,
    };
    data.bets.unshift(bet);
    // Keep max 500 recent bets
    if (data.bets.length > 500) {
      data.bets = data.bets.slice(0, 500);
    }
    saveData(data);
    return bet;
  },

  getUserBets(userId: string): CasinoBetRecord[] {
    const data = loadData();
    const clean = String(userId).trim().toLowerCase();
    return data.bets.filter((b) => b.userId.toLowerCase() === clean);
  },

  getUserTransactions(userId: string): CoinTransactionRecord[] {
    const data = loadData();
    const clean = String(userId).trim().toLowerCase();
    return data.transactions.filter((t) => t.userId.toLowerCase() === clean);
  },

  getRecentWinners(game?: 'ROULETTE' | 'ANDAR_BAHAR', limit: number = 30): CasinoBetRecord[] {
    const data = loadData();
    return data.bets
      .filter((b) => b.won && b.payout > 0 && (!game || b.game === game))
      .slice(0, limit);
  },

  // Live Multiplayer Bets Cache
  registerRouletteBet(roundId: number, bet: LiveRouletteBet) {
    if (!liveRouletteBets.has(roundId)) {
      liveRouletteBets.set(roundId, []);
    }
    const list = liveRouletteBets.get(roundId)!;
    list.push(bet);
  },

  getRouletteBetsForRound(roundId: number): LiveRouletteBet[] {
    return liveRouletteBets.get(roundId) || [];
  },

  registerAndarBaharBet(roundId: number, bet: LiveAndarBaharBet) {
    if (!liveAndarBaharBets.has(roundId)) {
      liveAndarBaharBets.set(roundId, []);
    }
    const list = liveAndarBaharBets.get(roundId)!;
    list.push(bet);
  },

  getAndarBaharBetsForRound(roundId: number): LiveAndarBaharBet[] {
    return liveAndarBaharBets.get(roundId) || [];
  },

  // Analytics & Stats for Admin
  getGameStats(game: 'ROULETTE' | 'ANDAR_BAHAR') {
    const data = loadData();
    const gameBets = data.bets.filter((b) => b.game === game);
    const totalWagered = gameBets.reduce((acc, b) => acc + b.betAmount, 0);
    const totalPayout = gameBets.reduce((acc, b) => acc + b.payout, 0);
    const totalWins = gameBets.filter((b) => b.won).length;
    const totalLosses = gameBets.filter((b) => !b.won).length;
    const houseProfit = totalWagered - totalPayout;
    const winRate = gameBets.length > 0 ? Math.round((totalWins / gameBets.length) * 100) : 0;

    return {
      totalGames: gameBets.length,
      wins: totalWins,
      losses: totalLosses,
      winRate,
      totalWagered,
      totalPayout,
      houseProfit,
      recentBets: gameBets.slice(0, 10),
    };
  },
};
