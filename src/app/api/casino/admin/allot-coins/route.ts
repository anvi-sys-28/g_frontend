import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const allotAmount = Number(amount);
    if (isNaN(allotAmount) || allotAmount <= 0) {
      return NextResponse.json(
        { error: 'Allotment amount must be a positive number' },
        { status: 400 }
      );
    }

    const cleanUserId = String(userId).trim();

    const user = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const newBalance = user.coins + allotAmount;

      const updated = await tx.casinoUser.update({
        where: { id: user.id },
        data: {
          coins: newBalance,
        },
      });

      await tx.coinTransaction.create({
        data: {
          casinoUserId: user.id,
          amount: allotAmount,
          balanceAfter: newBalance,
          type: 'ADMIN_ALLOT',
          note: note || `Admin manual allotment of ${allotAmount} coins`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully allotted ${allotAmount} coins to ${cleanUserId}`,
      userId: updatedUser.userId,
      coins: updatedUser.coins,
    });
  } catch (error: any) {
    console.error('Error allotting coins:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to allot coins' },
      { status: 500 }
    );
  }
}
