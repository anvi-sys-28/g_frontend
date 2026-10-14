import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, requestedAmount = 1000, reason = 'Out of coins, requested refill' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const cleanUserId = String(userId).trim();
    const user = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Casino user not found' }, { status: 404 });
    }

    // Check if there is already an active pending request
    const existingPending = await prisma.coinRequest.findFirst({
      where: {
        casinoUserId: user.id,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error:
            'You already have a pending coin request awaiting Admin approval. Please wait for Admin to allot coins.',
          pendingRequest: existingPending,
        },
        { status: 400 }
      );
    }

    const newRequest = await prisma.coinRequest.create({
      data: {
        casinoUserId: user.id,
        requestedAmount: Math.max(100, Number(requestedAmount) || 1000),
        status: 'PENDING',
        reason: String(reason).trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Coin request for ${newRequest.requestedAmount} coins submitted to Admin!`,
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Error submitting coin request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit coin request' },
      { status: 500 }
    );
  }
}
