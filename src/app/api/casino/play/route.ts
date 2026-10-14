import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ROULETTE_RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_SUITS = ['♠', '♥', '♦', '♣'];

function getRandomCard(): { rank: string; suit: string; display: string } {
  const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
  const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
  return { rank, suit, display: `${rank}${suit}` };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, game, betAmount, betChoice, selectedNumber } = body;

    if (!userId || !game || !betAmount) {
      return NextResponse.json(
        { error: 'userId, game, and betAmount are required.' },
        { status: 400 }
      );
    }

    const wager = Math.floor(Number(betAmount));
    if (isNaN(wager) || wager <= 0) {
      return NextResponse.json({ error: 'Bet amount must be a positive number' }, { status: 400 });
    }

    const cleanUserId = String(userId).trim();
    const user = await prisma.casinoUser.findUnique({
      where: { userId: cleanUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.coins < wager) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_COINS',
          message: `Insufficient coins. You have ${user.coins} coins, but bet requires ${wager} coins. Please request coins from Admin.`,
          currentCoins: user.coins,
        },
        { status: 400 }
      );
    }

    let won = false;
    let payout = 0;
    let details: any = {};

    // ----------------------------------------
    // GAME 1: ROULETTE
    // ----------------------------------------
    if (game === 'ROULETTE') {
      const winningNumber = Math.floor(Math.random() * 37); // 0 to 36
      const winningColor =
        winningNumber === 0 ? 'GREEN' : ROULETTE_RED_NUMBERS.has(winningNumber) ? 'RED' : 'BLACK';
      const isEven = winningNumber !== 0 && winningNumber % 2 === 0;

      const choice = String(betChoice || 'RED').toUpperCase();

      if (choice === 'RED') {
        if (winningColor === 'RED') {
          won = true;
          payout = wager * 2;
        }
      } else if (choice === 'BLACK') {
        if (winningColor === 'BLACK') {
          won = true;
          payout = wager * 2;
        }
      } else if (choice === 'EVEN') {
        if (isEven) {
          won = true;
          payout = wager * 2;
        }
      } else if (choice === 'ODD') {
        if (winningNumber !== 0 && !isEven) {
          won = true;
          payout = wager * 2;
        }
      } else if (choice === 'STRAIGHT_UP') {
        const num = Number(selectedNumber);
        if (num === winningNumber) {
          won = true;
          payout = wager * 36;
        }
      } else if (choice === '1_18') {
        if (winningNumber >= 1 && winningNumber <= 18) {
          won = true;
          payout = wager * 2;
        }
      } else if (choice === '19_36') {
        if (winningNumber >= 19 && winningNumber <= 36) {
          won = true;
          payout = wager * 2;
        }
      }

      details = {
        betType: choice,
        selectedNumber: selectedNumber !== undefined ? selectedNumber : null,
        winningNumber,
        winningColor,
        isEven,
        multiplier: won ? (choice === 'STRAIGHT_UP' ? 36 : 2) : 0,
      };
    }

    // ----------------------------------------
    // GAME 2: ANDAR BAHAR
    // ----------------------------------------
    else if (game === 'ANDAR_BAHAR') {
      const chosenSide = String(betChoice || 'ANDAR').toUpperCase(); // 'ANDAR' or 'BAHAR'

      // 1. Deal Joker card
      const joker = getRandomCard();

      // 2. Deal alternating cards until rank matches joker
      const dealtCards: Array<{ side: 'ANDAR' | 'BAHAR'; card: string }> = [];
      let currentSide: 'ANDAR' | 'BAHAR' = 'ANDAR';
      let winningSide: 'ANDAR' | 'BAHAR' = 'ANDAR';

      let matched = false;
      let count = 0;
      while (!matched && count < 50) {
        count++;
        const card = getRandomCard();
        dealtCards.push({ side: currentSide, card: card.display });

        if (card.rank === joker.rank) {
          matched = true;
          winningSide = currentSide;
          break;
        }

        currentSide = currentSide === 'ANDAR' ? 'BAHAR' : 'ANDAR';
      }

      if (chosenSide === winningSide) {
        won = true;
        // Standard Andar Bahar 1.95x payout
        payout = Math.round(wager * 1.95);
      }

      details = {
        chosenSide,
        jokerCard: joker.display,
        winningSide,
        totalCardsDealt: dealtCards.length,
        dealtCards: dealtCards.slice(0, 12), // Keep response compact
      };
    } else {
      return NextResponse.json({ error: `Unsupported game type: ${game}` }, { status: 400 });
    }

    // ----------------------------------------
    // Execute DB Transaction
    // ----------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      const balanceAfter = user.coins - wager + payout;

      // Update user coins
      const updatedUser = await tx.casinoUser.update({
        where: { id: user.id },
        data: { coins: balanceAfter },
      });

      // Record bet in history
      const bet = await tx.casinoBet.create({
        data: {
          casinoUserId: user.id,
          game,
          betAmount: wager,
          payout,
          won,
          details,
          balanceAfter,
        },
      });

      // Record transaction
      await tx.coinTransaction.create({
        data: {
          casinoUserId: user.id,
          amount: -wager,
          balanceAfter: user.coins - wager,
          type: 'BET_SPENT',
          note: `Placed ${wager} coins bet on ${game}`,
        },
      });

      if (payout > 0) {
        await tx.coinTransaction.create({
          data: {
            casinoUserId: user.id,
            amount: payout,
            balanceAfter,
            type: 'BET_WON',
            note: `Won ${payout} coins from ${game}`,
          },
        });
      }

      return {
        betId: bet.id,
        newBalance: updatedUser.coins,
        won,
        payout,
        profit: payout - wager,
        details,
      };
    });

    return NextResponse.json({
      success: true,
      game,
      wager,
      won: result.won,
      payout: result.payout,
      profit: result.profit,
      newBalance: result.newBalance,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Error in casino play-round:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process game round' },
      { status: 500 }
    );
  }
}
