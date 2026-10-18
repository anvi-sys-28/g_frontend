import { NextRequest, NextResponse } from 'next/server';
import { getLiveRoundState, RoomPlayerBet } from '@/lib/roulette/liveRouletteSync';

// In-memory store for real multiplayer bets per round (shared across tabs/clients)
const realMultiplayerBets: Map<
  number,
  Array<{
    userId: string;
    playerName: string;
    numbers: number[];
    amount: number;
    label: string;
  }>
> = new Map();

// Clean up old rounds memory periodically
function cleanOldRounds(currentRound: number) {
  for (const r of realMultiplayerBets.keys()) {
    if (r < currentRound - 20) {
      realMultiplayerBets.delete(r);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    const roundId = Math.floor(now / 20000);
    cleanOldRounds(roundId);

    const roundPlayerBets = realMultiplayerBets.get(roundId) || [];
    const state = getLiveRoundState(now, roundPlayerBets);

    // Merge any real player bets into room bets display
    const realBetsFormatted: RoomPlayerBet[] = roundPlayerBets.map((b) => ({
      playerId: b.userId,
      playerName: b.playerName,
      avatarColor: '#D4AF37',
      numbers: b.numbers,
      amount: b.amount,
      label: b.label,
    }));

    return NextResponse.json({
      success: true,
      serverTime: now,
      round: {
        ...state,
        roomBets: [...realBetsFormatted, ...state.roomBets],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch live roulette state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundId, userId, playerName, bets } = body;

    if (!roundId || !bets || !Array.isArray(bets)) {
      return NextResponse.json(
        { success: false, error: 'roundId and bets array are required' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const currentRound = Math.floor(now / 20000);
    const cycleOffset = now % 20000;

    // Betting only allowed during first 5 seconds of round
    if (roundId !== currentRound || cycleOffset >= 5000) {
      return NextResponse.json(
        { success: false, error: 'BETS_CLOSED', message: 'Betting is closed for this round.' },
        { status: 403 }
      );
    }

    if (!realMultiplayerBets.has(roundId)) {
      realMultiplayerBets.set(roundId, []);
    }

    const existing = realMultiplayerBets.get(roundId)!;
    for (const b of bets) {
      existing.push({
        userId: userId || 'player_' + Math.floor(Math.random() * 900 + 100),
        playerName: playerName || 'Player',
        numbers: b.numbers || [],
        amount: b.amount || 0,
        label: b.label || 'Bet',
      });
    }

    const updatedState = getLiveRoundState(now, existing);

    return NextResponse.json({
      success: true,
      message: 'Bets accepted for live round #' + roundId,
      round: updatedState,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit bet' },
      { status: 500 }
    );
  }
}
