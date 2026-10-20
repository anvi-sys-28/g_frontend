import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export interface WinnerEvent {
  id: string;
  playerName: string;
  avatarColor: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  payout: number;
  roundId?: number;
  timestamp: number;
  isRealUser?: boolean;
}

const AVATAR_GRADIENTS = [
  'from-purple-600 to-indigo-500',
  'from-orange-500 to-amber-500',
  'from-blue-600 to-cyan-400',
  'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-400',
  'from-yellow-500 to-amber-600',
  'from-violet-600 to-fuchsia-500',
  'from-red-600 to-orange-500',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = searchParams.get('game')?.toUpperCase();
    const game = (gameParam === 'ROULETTE' || gameParam === 'ANDAR_BAHAR') ? (gameParam as 'ROULETTE' | 'ANDAR_BAHAR') : undefined;
    const roundIdParam = searchParams.get('roundId');
    const roundId = roundIdParam ? Number(roundIdParam) : undefined;

    // Fetch REAL settled winning bets strictly from persistent casinoStore
    const realSettled = casinoStore.getRecentWinners(game, 30);

    // If roundId is specified, find winners for that round; fallback to most recent settled round
    let matching = roundId
      ? realSettled.filter((b) => b.roundId === roundId)
      : realSettled;

    if (matching.length === 0 && realSettled.length > 0) {
      const latestRoundId = realSettled[0].roundId;
      matching = realSettled.filter((b) => b.roundId === latestRoundId);
    }

    // Deduplicate by playerName / userId to guarantee each user profile appears AT MOST ONCE
    const userWinsMap = new Map<string, WinnerEvent>();

    for (const bet of matching) {
      const userKey = (bet.playerName || bet.userId).toLowerCase().trim();
      if (!userWinsMap.has(userKey)) {
        const gradient = AVATAR_GRADIENTS[userWinsMap.size % AVATAR_GRADIENTS.length];
        userWinsMap.set(userKey, {
          id: bet.id,
          playerName: bet.playerName || bet.userId,
          avatarColor: gradient,
          game: bet.game,
          payout: bet.payout,
          roundId: bet.roundId,
          timestamp: new Date(bet.createdAt).getTime(),
          isRealUser: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      winners: Array.from(userWinsMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching winners' },
      { status: 500 }
    );
  }
}
