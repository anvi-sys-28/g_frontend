import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, winningNumber, payout, won, details } = body;

    const cleanUser = String(userId || 'vip_player').trim();
    const wager = Number(details?.totalWager) || 0;

    const { newBalance, betRecord } = casinoStore.settleRound({
      userId: cleanUser,
      playerName: playerName || cleanUser,
      game: 'ROULETTE',
      roundId: Number(roundId) || 0,
      wager,
      payout: Number(payout) || 0,
      won: Boolean(won),
      details: {
        winningNumber,
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
      { success: false, error: err?.message || 'Error settling roulette round' },
      { status: 500 }
    );
  }
}
