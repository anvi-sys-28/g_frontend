import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, playerName, game } = body;

    if (userId && game) {
      casinoStore.touchSession(userId, playerName || userId, game);
    }

    const rouletteOnline = casinoStore.getOnlineCount('ROULETTE');
    const andarBaharOnline = casinoStore.getOnlineCount('ANDAR_BAHAR');

    let userCoins: number | undefined = undefined;
    if (userId) {
      const u = casinoStore.getUser(userId);
      if (u) {
        userCoins = u.coins;
      }
    }

    return NextResponse.json({
      success: true,
      roulette: rouletteOnline,
      andarBahar: andarBaharOnline,
      userCoins,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Presence error' },
      { status: 500 }
    );
  }
}
