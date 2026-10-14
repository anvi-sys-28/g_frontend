import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const cleanUserId = String(userId).trim();

    // Check if user exists
    let user = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
    });

    // Auto-seed admin if missing
    if (!user && cleanUserId.toLowerCase() === 'admin' && password === 'admin123') {
      user = await prisma.casinoUser.create({
        data: {
          userId: 'admin',
          password: 'admin123',
          role: 'ADMIN',
          coins: 999999,
          status: 'ACTIVE',
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid User ID or Password. Please contact your Casino Admin.' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'This casino account has been suspended by Admin.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        role: user.role,
        coins: user.coins,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Casino Auth Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const user = await prisma.casinoUser.findUnique({
      where: { userId: userId.trim() },
      select: {
        id: true,
        userId: true,
        role: true,
        coins: true,
        status: true,
        coinRequests: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        pendingRequest: user.coinRequests[0] || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error fetching user' }, { status: 500 });
  }
}
