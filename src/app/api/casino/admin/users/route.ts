import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function GET() {
  try {
    const rawUsers = casinoStore.getAllUsers();
    const rouletteStats = casinoStore.getGameStats('ROULETTE');
    const andarBaharStats = casinoStore.getGameStats('ANDAR_BAHAR');

    const users = rawUsers.map((u) => {
      const userBets = [...rouletteStats.recentBets, ...andarBaharStats.recentBets].filter(
        (b) => b.userId.toLowerCase() === u.userId.toLowerCase()
      );
      const wins = userBets.filter((b) => b.won).length;
      const losses = userBets.filter((b) => !b.won).length;
      const totalWagered = userBets.reduce((acc, b) => acc + b.betAmount, 0);
      const totalPayout = userBets.reduce((acc, b) => acc + b.payout, 0);

      return {
        id: u.id,
        userId: u.userId,
        password: u.password,
        role: u.role,
        coins: u.coins,
        status: u.status,
        createdAt: u.createdAt,
        totalGames: userBets.length,
        wins,
        losses,
        winRate: userBets.length > 0 ? Math.round((wins / userBets.length) * 100) : 0,
        totalWagered,
        totalPayout,
        netPnL: totalPayout - totalWagered,
        gamesBreakdown: {
          roulette: userBets.filter((b) => b.game === 'ROULETTE').length,
          andarBahar: userBets.filter((b) => b.game === 'ANDAR_BAHAR').length,
        },
        pendingRequestsCount: 0,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, password, initialCoins } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const newUser = casinoStore.createUser(userId, password, Number(initialCoins) || 0);

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}
