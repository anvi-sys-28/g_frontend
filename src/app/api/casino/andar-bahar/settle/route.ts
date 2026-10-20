import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, winningSide, betSide, wager, payout, won, details } = body;

    const cleanUser = String(userId || 'vip_player').trim();
    const cleanWager = Number(wager) || 0;

    const { newBalance, betRecord } = casinoStore.settleRound({
      userId: cleanUser,
      playerName: playerName || cleanUser,
      game: 'ANDAR_BAHAR',
      roundId: Number(roundId) || 0,
      wager: cleanWager,
      payout: Number(payout) || 0,
      won: Boolean(won),
      details: {
        winningSide,
        betSide,
        ...details,
      },
    });

    return NextResponse.json({
      success: true,
      newBalance,
      won: Boolean(won),
      payout: Number(payout) || 0,
      betRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error settling Andar Bahar round' },
      { status: 500 }
    );
  }
}
