import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.casinoUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bets: {
          select: {
            id: true,
            game: true,
            betAmount: true,
            payout: true,
            won: true,
            createdAt: true,
          },
        },
        coinRequests: {
          where: { status: 'PENDING' },
          select: { id: true, requestedAmount: true, createdAt: true },
        },
      },
    });

    const userStats = users.map((u) => {
      const totalGames = u.bets.length;
      const wins = u.bets.filter((b) => b.won).length;
      const losses = u.bets.filter((b) => !b.won).length;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      const totalWagered = u.bets.reduce((acc, b) => acc + b.betAmount, 0);
      const totalPayout = u.bets.reduce((acc, b) => acc + b.payout, 0);
      const netPnL = totalPayout - totalWagered; // Positive = player won, Negative = casino house won

      const rouletteGames = u.bets.filter((b) => b.game === 'ROULETTE').length;
      const andarBaharGames = u.bets.filter((b) => b.game === 'ANDAR_BAHAR').length;

      return {
        id: u.id,
        userId: u.userId,
        password: u.password,
        role: u.role,
        coins: u.coins,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
        totalGames,
        wins,
        losses,
        winRate,
        totalWagered,
        totalPayout,
        netPnL,
        gamesBreakdown: {
          roulette: rouletteGames,
          andarBahar: andarBaharGames,
        },
        pendingRequestsCount: u.coinRequests.length,
      };
    });

    return NextResponse.json({
      success: true,
      users: userStats,
    });
  } catch (error: any) {
    console.error('Error fetching admin casino users:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, password, initialCoins = 0 } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and Password are required.' },
        { status: 400 }
      );
    }

    const cleanUserId = String(userId).trim();
    const coins = Math.max(0, Number(initialCoins) || 0);

    // Check if user already exists
    const existing = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `User with ID "${cleanUserId}" already exists.` },
        { status: 409 }
      );
    }

    // Create user in PostgreSQL
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.casinoUser.create({
        data: {
          userId: cleanUserId,
          password: String(password).trim(),
          role: 'USER',
          coins,
          status: 'ACTIVE',
        },
      });

      if (coins > 0) {
        await tx.coinTransaction.create({
          data: {
            casinoUserId: user.id,
            amount: coins,
            balanceAfter: coins,
            type: 'ADMIN_ALLOT',
            note: 'Initial account allotment by Admin',
          },
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        userId: newUser.userId,
        coins: newUser.coins,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating casino user:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
