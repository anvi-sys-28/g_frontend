import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, winningNumber, payout, won, details } = body;

    const cleanUser = String(userId || 'vip_player').trim();
    let newBalance = 0;

    // Credit payout if player won
    if (won && Number(payout) > 0) {
      newBalance = casinoStore.creditCoinsForWin(cleanUser, Number(payout), 'ROULETTE', roundId);
    } else {
      const u = casinoStore.getUser(cleanUser);
      newBalance = u?.coins || 0;
    }

    // Record settled bet in persistent store
    casinoStore.recordSettledBet({
      userId: cleanUser,
      playerName: playerName || cleanUser,
      game: 'ROULETTE',
      roundId: Number(roundId) || 0,
      betAmount: Number(details?.totalWager) || 0,
      payout: Number(payout) || 0,
      won: Boolean(won),
      balanceAfter: newBalance,
      details: {
        winningNumber,
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
      { success: false, error: err?.message || 'Error settling roulette round' },
      { status: 500 }
    );
  }
}
