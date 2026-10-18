import { NextRequest, NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, note } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const allotAmount = Number(amount);
    if (isNaN(allotAmount) || allotAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Allotment amount must be a positive number' },
        { status: 400 }
      );
    }

    const newBalance = casinoStore.allotCoins(userId, allotAmount, note || 'Admin allotment refill');

    return NextResponse.json({
      success: true,
      message: `Successfully allotted ${allotAmount} coins to ${userId}. New balance: ${newBalance}`,
      newBalance,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to allot coins' },
      { status: 400 }
    );
  }
}
