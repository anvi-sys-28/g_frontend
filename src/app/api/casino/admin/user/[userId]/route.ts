import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const cleanId = decodeURIComponent(userId).trim();

    const user = casinoStore.getUser(cleanId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: `User "${cleanId}" not found` },
        { status: 404 }
      );
    }

    const bets = casinoStore.getUserBets(cleanId);
    const transactions = casinoStore.getUserTransactions(cleanId);

    const wins = bets.filter((b) => b.won).length;
    const losses = bets.filter((b) => !b.won).length;
    const totalWagered = bets.reduce((sum, b) => sum + (b.betAmount || 0), 0);
    const totalPayout = bets.reduce((sum, b) => sum + (b.payout || 0), 0);
    const netPnL = totalPayout - totalWagered;
    const winRate = bets.length > 0 ? Math.round((wins / bets.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      user,
      stats: {
        totalGames: bets.length,
        wins,
        losses,
        winRate,
        totalWagered,
        totalPayout,
        netPnL,
      },
      bets,
      transactions,
      requests: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching user history' },
      { status: 500 }
    );
  }
}
