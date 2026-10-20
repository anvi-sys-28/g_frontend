import { NextRequest, NextResponse } from 'next/server';
import { getLiveRoundState, RoomPlayerBet } from '@/lib/roulette/liveRouletteSync';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'vip_player';
    const playerName = searchParams.get('playerName') || userId;

    if (userId) {
      casinoStore.touchSession(userId, playerName, 'ROULETTE');
    }

    const now = Date.now();
    const roundId = Math.floor(now / 20000);

    // Fetch REAL bets placed by players for this round
    const realBets = casinoStore.getRouletteBetsForRound(roundId);
    const onlineInfo = casinoStore.getOnlineCount('ROULETTE');

    const roomBetsFormatted: RoomPlayerBet[] = realBets.map((b) => ({
      playerId: b.userId,
      playerName: b.playerName,
      avatarColor: '#D4AF37',
      numbers: b.numbers,
      amount: b.amount,
      label: b.label,
    }));

    const state = getLiveRoundState(
      now,
      realBets.map((b) => ({ numbers: b.numbers, amount: b.amount })),
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
      { success: false, error: err?.message || 'Failed to fetch live roulette state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, bets } = body;

    if (!roundId || !bets || !Array.isArray(bets)) {
      return NextResponse.json(
        { success: false, error: 'roundId and bets array are required' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const currentRound = Math.floor(now / 20000);
    const cycleOffset = now % 20000;

    // Bets for current round accepted before ball outcome settlement begins (14.5s)
    if (roundId !== currentRound || cycleOffset >= 14500) {
      return NextResponse.json(
        { success: false, error: 'BETS_CLOSED', message: 'Betting is closed for this round.' },
        { status: 403 }
      );
    }

    const cleanUser = String(userId || 'vip_player').trim();
    const totalWager = bets.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0);

    // Deduct coins from authentic user balance in casinoStore!
    let newBalance: number;
    try {
      newBalance = casinoStore.deductCoinsForBet(cleanUser, totalWager, 'ROULETTE', roundId);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: 'INSUFFICIENT_COINS', message: e.message },
        { status: 400 }
      );
    }

    casinoStore.touchSession(cleanUser, playerName || cleanUser, 'ROULETTE');

    for (const b of bets) {
      casinoStore.registerRouletteBet(roundId, {
        userId: cleanUser,
        playerName: playerName || cleanUser,
        numbers: b.numbers || [],
        amount: b.amount || 0,
        label: b.label || 'Bet',
        placedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Accepted ${bets.length} bets totaling ${totalWager} coins for round #${roundId}`,
      newBalance,
      totalWager,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process live bet' },
      { status: 500 }
    );
  }
}
