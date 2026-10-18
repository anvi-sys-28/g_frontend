import { NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';
import { getLiveRoundState } from '@/lib/roulette/liveRouletteSync';
import { getLiveAndarBaharState } from '@/lib/andar-bahar/liveAndarBaharSync';

export async function GET() {
  try {
    const now = Date.now();

    // 1. Live Roulette State
    const rouletteRoundId = Math.floor(now / 20000);
    const rouletteBets = casinoStore.getRouletteBetsForRound(rouletteRoundId);
    const rouletteOnline = casinoStore.getOnlineCount('ROULETTE');
    const rouletteState = getLiveRoundState(now, rouletteBets.map((b) => ({ numbers: b.numbers, amount: b.amount })));
    const rouletteStats = casinoStore.getGameStats('ROULETTE');

    const totalRouletteWager = rouletteBets.reduce((acc, b) => acc + b.amount, 0);

    // Explanation of least chosen target for admin
    let rouletteTargetExplanation = '';
    if (rouletteBets.length === 0) {
      rouletteTargetExplanation = `No player bets placed yet in round #${rouletteRoundId}. Target ball pocket is #${rouletteState.winningNumber}.`;
    } else {
      const counts = rouletteState.numberBetCounts;
      const targetCount = counts[rouletteState.winningNumber] || 0;
      rouletteTargetExplanation = `Ball will land on #${rouletteState.winningNumber}. It was chosen least (${targetCount} bets, 0 coins) compared to numbers bet by players.`;
    }

    // 2. Live Andar Bahar State
    const abRoundId = Math.floor(now / 20000);
    const abBets = casinoStore.getAndarBaharBetsForRound(abRoundId);
    const abOnline = casinoStore.getOnlineCount('ANDAR_BAHAR');
    const abLocalBets = abBets.map((b) => ({ side: b.side, amount: b.amount }));
    const abState = getLiveAndarBaharState(now, abLocalBets[0]);
    const abStats = casinoStore.getGameStats('ANDAR_BAHAR');

    let andarWager = 0;
    let baharWager = 0;
    for (const b of abBets) {
      if (b.side === 'ANDAR') andarWager += b.amount;
      if (b.side === 'BAHAR') baharWager += b.amount;
    }

    let abTargetExplanation = '';
    if (andarWager === 0 && baharWager === 0) {
      abTargetExplanation = `No wagers placed in round #${abRoundId}. Winning side is ${abState.winningSide}.`;
    } else if (andarWager > baharWager) {
      abTargetExplanation = `BAHAR has fewer coins (${baharWager} vs ANDAR's ${andarWager}). Matching card will hit on BAHAR to protect House margin.`;
    } else {
      abTargetExplanation = `ANDAR has fewer coins (${andarWager} vs BAHAR's ${baharWager}). Matching card will hit on ANDAR to protect House margin.`;
    }

    return NextResponse.json({
      success: true,
      serverTime: now,
      roulette: {
        roundId: rouletteRoundId,
        phase: rouletteState.phase,
        timeRemaining: rouletteState.timeRemaining,
        onlineCount: rouletteOnline.count,
        onlinePlayers: rouletteOnline.players,
        currentRoundBets: rouletteBets,
        totalCurrentWager: totalRouletteWager,
        targetWinningNumber: rouletteState.winningNumber,
        leastChosenNumbers: rouletteState.leastChosenNumbers,
        explanation: rouletteTargetExplanation,
        stats: rouletteStats,
      },
      andarBahar: {
        roundId: abRoundId,
        phase: abState.phase,
        timeRemaining: abState.timeRemaining,
        onlineCount: abOnline.count,
        onlinePlayers: abOnline.players,
        currentRoundBets: abBets,
        andarTotalWager: andarWager,
        baharTotalWager: baharWager,
        targetWinningSide: abState.winningSide,
        explanation: abTargetExplanation,
        stats: abStats,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching live games data' },
      { status: 500 }
    );
  }
}
