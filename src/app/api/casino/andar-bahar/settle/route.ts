import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, winningSide, betSide, wager, payout, won, details } = body;

    const cleanUser = String(userId || 'vip_player').trim();
    let newBalance = 0;

    // Credit payout if player won
    if (won && Number(payout) > 0) {
      newBalance = casinoStore.creditCoinsForWin(cleanUser, Number(payout), 'ANDAR_BAHAR', roundId);
    } else {
      const u = casinoStore.getUser(cleanUser);
      newBalance = u?.coins || 0;
    }

    // Record settled bet in persistent store
    casinoStore.recordSettledBet({
      userId: cleanUser,
      playerName: playerName || cleanUser,
      game: 'ANDAR_BAHAR',
      roundId: Number(roundId) || 0,
      betAmount: Number(wager) || 0,
      payout: Number(payout) || 0,
      won: Boolean(won),
      balanceAfter: newBalance,
      details: {
        winningSide,
        betSide,
        ...details,
      },
    });

    return NextResponse.json({
      success: true,
      newBalance,
      won,
      payout,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error settling Andar Bahar round' },
      { status: 500 }
    );
  }
}
