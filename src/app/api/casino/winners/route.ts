import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export interface WinnerEvent {
  id: string;
  playerName: string;
  avatarColor: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  payout: number;
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

    // Fetch REAL settled winning bets strictly from persistent casinoStore
    const realSettled = casinoStore.getRecentWinners(game, 30);

    // Map strictly real settled bets into WinnerEvents (NO MOCK DATA)
    const winners: WinnerEvent[] = realSettled.map((bet, idx) => {
      const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
      return {
        id: bet.id,
        playerName: bet.playerName || bet.userId,
        avatarColor: gradient,
        game: bet.game,
        payout: bet.payout,
        timestamp: new Date(bet.createdAt).getTime(),
        isRealUser: true,
      };
    });

    return NextResponse.json({
      success: true,
      winners,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching winners' },
      { status: 500 }
    );
  }
}
