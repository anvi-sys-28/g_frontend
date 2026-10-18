import { NextRequest, NextResponse } from 'next/server';
import { getLiveAndarBaharState, RoomAndarBaharBet } from '@/lib/andar-bahar/liveAndarBaharSync';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'vip_player';
    const playerName = searchParams.get('playerName') || userId;

    if (userId) {
      casinoStore.touchSession(userId, playerName, 'ANDAR_BAHAR');
    }

    const now = Date.now();
    const roundId = Math.floor(now / 20000);

    // Fetch REAL bets placed by players for this round
    const realBets = casinoStore.getAndarBaharBetsForRound(roundId);
    const onlineInfo = casinoStore.getOnlineCount('ANDAR_BAHAR');

    const roomBetsFormatted: RoomAndarBaharBet[] = realBets.map((b) => ({
      playerId: b.userId,
      playerName: b.playerName,
      avatarColor: '#D4AF37',
      side: b.side,
      amount: b.amount,
    }));

    const state = getLiveAndarBaharState(
      now,
      realBets[0] ? { side: realBets[0].side, amount: realBets[0].amount } : undefined,
      roomBetsFormatted
    );

    return NextResponse.json({
      success: true,
      serverTime: now,
      round: {
        ...state,
        roomBets: roomBetsFormatted,
        activePlayersCount: onlineInfo.count,
        onlinePlayers: onlineInfo.players,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch live Andar Bahar state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, side, amount } = body;

    if (!roundId || !side || !amount) {
      return NextResponse.json(
        { success: false, error: 'roundId, side, and amount are required' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const currentRound = Math.floor(now / 20000);
    const cycleOffset = now % 20000;

    // Betting only allowed during first 5 seconds of round
    if (roundId !== currentRound || cycleOffset >= 5000) {
      return NextResponse.json(
        { success: false, error: 'BETS_CLOSED', message: 'Betting is closed for this round.' },
        { status: 403 }
      );
    }

    const cleanUser = String(userId || 'vip_player').trim();
    const wager = Number(amount) || 100;

    // Deduct coins from authentic user balance in casinoStore!
    let newBalance: number;
    try {
      newBalance = casinoStore.deductCoinsForBet(cleanUser, wager, 'ANDAR_BAHAR', roundId);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: 'INSUFFICIENT_COINS', message: e.message },
        { status: 400 }
      );
    }

    casinoStore.touchSession(cleanUser, playerName || cleanUser, 'ANDAR_BAHAR');

    casinoStore.registerAndarBaharBet(roundId, {
      userId: cleanUser,
      playerName: playerName || cleanUser,
      side: side === 'BAHAR' ? 'BAHAR' : 'ANDAR',
      amount: wager,
      placedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: `Accepted live Andar Bahar bet of ${wager} coins on ${side} for round #${roundId}`,
      newBalance,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process live bet' },
      { status: 500 }
    );
  }
}
