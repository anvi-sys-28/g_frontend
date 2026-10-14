import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const requests = await prisma.coinRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        casinoUser: {
          select: {
            id: true,
            userId: true,
            coins: true,
            status: true,
          },
        },
      },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      userId: r.casinoUser.userId,
      currentBalance: r.casinoUser.coins,
      requestedAmount: r.requestedAmount,
      allocatedAmount: r.allocatedAmount,
      status: r.status,
      reason: r.reason,
      adminNotes: r.adminNotes,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      requests: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching coin requests:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch coin requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, action, amount, adminNotes } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'requestId and action ("APPROVE" or "REJECT") are required.' },
        { status: 400 }
      );
    }

    const coinRequest = await prisma.coinRequest.findUnique({
      where: { id: requestId },
      include: { casinoUser: true },
    });

    if (!coinRequest) {
      return NextResponse.json({ error: 'Coin request not found' }, { status: 404 });
    }

    if (coinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${coinRequest.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const allocateCoins = Number(amount) || coinRequest.requestedAmount;
      if (allocateCoins <= 0) {
        return NextResponse.json(
          { error: 'Allocated coins must be greater than zero' },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Update request
        await tx.coinRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            allocatedAmount: allocateCoins,
            adminNotes: adminNotes || null,
            reviewedAt: new Date(),
          },
        });

        // Credit user
        const newBalance = coinRequest.casinoUser.coins + allocateCoins;
        await tx.casinoUser.update({
          where: { id: coinRequest.casinoUserId },
          data: {
            coins: newBalance,
          },
        });

        // Record transaction
        await tx.coinTransaction.create({
          data: {
            casinoUserId: coinRequest.casinoUserId,
            amount: allocateCoins,
            balanceAfter: newBalance,
            type: 'REQUEST_APPROVED',
            note: adminNotes || `Approved coin request for ${allocateCoins} coins`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Approved request! Allotted ${allocateCoins} coins to ${coinRequest.casinoUser.userId}.`,
      });
    } else if (action === 'REJECT') {
      await prisma.coinRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNotes: adminNotes || 'Request rejected by Admin',
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Rejected coin request for ${coinRequest.casinoUser.userId}.`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating coin request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update coin request' },
      { status: 500 }
    );
  }
}
