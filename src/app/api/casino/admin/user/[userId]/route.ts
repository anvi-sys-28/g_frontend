import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const cleanUserId = decodeURIComponent(userId).trim();

    const user = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
      include: {
        bets: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        coinTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        coinRequests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalGames = user.bets.length;
    const wins = user.bets.filter((b) => b.won).length;
    const losses = user.bets.filter((b) => !b.won).length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const totalWagered = user.bets.reduce((acc, b) => acc + b.betAmount, 0);
    const totalPayout = user.bets.reduce((acc, b) => acc + b.payout, 0);
    const netPnL = totalPayout - totalWagered;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        password: user.password,
        role: user.role,
        coins: user.coins,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      stats: {
        totalGames,
        wins,
        losses,
        winRate,
        totalWagered,
        totalPayout,
        netPnL,
        rouletteCount: user.bets.filter((b) => b.game === 'ROULETTE').length,
        andarBaharCount: user.bets.filter((b) => b.game === 'ANDAR_BAHAR').length,
      },
      bets: user.bets.map((b) => ({
        id: b.id,
        game: b.game,
        betAmount: b.betAmount,
        payout: b.payout,
        won: b.won,
        details: b.details,
        balanceAfter: b.balanceAfter,
        createdAt: b.createdAt.toISOString(),
      })),
      transactions: user.coinTransactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        type: t.type,
        note: t.note,
        createdAt: t.createdAt.toISOString(),
      })),
      requests: user.coinRequests.map((r) => ({
        id: r.id,
        requestedAmount: r.requestedAmount,
        allocatedAmount: r.allocatedAmount,
        status: r.status,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching user casino details:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
