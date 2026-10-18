import { NextResponse } from 'next/server';
import { casinoStore } from '@/lib/casino/casinoStore';

export interface WinnerEvent {
  id: string;
  playerName: string;
  avatarColor: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  payout: number;
  message: string;
  timeAgo: string;
  timestamp: number;
  isRealUser?: boolean;
}

const AVATAR_GRADIENTS = [
  'from-purple-600 to-indigo-500',
  'from-orange-500 to-amber-500',
  'from-blue-600 to-cyan-400',
  'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-400',
  'from-yellow-500 to-amber-600',
  'from-violet-600 to-fuchsia-500',
  'from-red-600 to-orange-500',
];

const SEED_WINNERS = [
  { name: 'EchoStorm', game: 'ROULETTE' as const, payout: 36000, message: 'Won 36,000 Coins on Number 17! 🎯' },
  { name: 'NovaTrace', game: 'ANDAR_BAHAR' as const, payout: 19500, message: 'Won 19,500 Coins on ANDAR! 👑' },
  { name: 'SkylineSeeker', game: 'ROULETTE' as const, payout: 72000, message: 'Hit 72,000 Coins on Corner 2/6! 💰' },
  { name: 'NeonPulse', game: 'ROULETTE' as const, payout: 10000, message: 'Won 10,000 Coins on Red! ⚡' },
  { name: 'Priya_VIP', game: 'ANDAR_BAHAR' as const, payout: 29250, message: 'Won 29,250 Coins on BAHAR! 🃏' },
  { name: 'Karan99', game: 'ROULETTE' as const, payout: 35000, message: 'Won 35,000 Coins on Number 2! 🎯' },
  { name: 'RahulBoss', game: 'ANDAR_BAHAR' as const, payout: 48750, message: 'Won 48,750 Coins on ANDAR! 👑' },
  { name: 'Ananya_777', game: 'ROULETTE' as const, payout: 18000, message: 'Won 18,000 Coins on 1st Dozen! 💎' },
  { name: 'LuckyStrike', game: 'ROULETTE' as const, payout: 50000, message: 'Hit 50,000 Coins on Black! 🖤' },
  { name: 'Vikram_X', game: 'ANDAR_BAHAR' as const, payout: 39000, message: 'Won 39,000 Coins on BAHAR! 🔥' },
  { name: 'AmanK', game: 'ROULETTE' as const, payout: 36000, message: 'Won 36,000 Coins on Number 32! 🎯' },
  { name: 'Rohan_Ace', game: 'ANDAR_BAHAR' as const, payout: 19500, message: 'Won 19,500 Coins on ANDAR! 👑' },
];

export async function GET() {
  try {
    const realSettled = casinoStore.getRecentWinners(25);
    const now = Date.now();

    // Map real settled bets into WinnerEvents
    const realEvents: WinnerEvent[] = realSettled.map((bet, idx) => {
      const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
      const details = bet.details as any;
      let msg = `Won ${bet.payout.toLocaleString()} Coins!`;

      if (bet.game === 'ROULETTE') {
        const winningNum = details?.winningNumber ?? '';
        msg = `Won ${bet.payout.toLocaleString()} Coins on Number ${winningNum}! 🎯`;
      } else if (bet.game === 'ANDAR_BAHAR') {
        const side = details?.winningSide ?? 'ANDAR';
        msg = `Won ${bet.payout.toLocaleString()} Coins on ${side}! 👑`;
      }

      const diffSec = Math.floor((now - new Date(bet.createdAt).getTime()) / 1000);
      const timeAgo = diffSec < 60 ? `${diffSec}s ago` : `${Math.floor(diffSec / 60)}m ago`;

      return {
        id: bet.id,
        playerName: bet.playerName || bet.userId,
        avatarColor: gradient,
        game: bet.game,
        payout: bet.payout,
        message: msg,
        timeAgo,
        timestamp: new Date(bet.createdAt).getTime(),
        isRealUser: true,
      };
    });

    // Seed events with staggered timestamps so the live stream is immediately active
    const seedEvents: WinnerEvent[] = SEED_WINNERS.map((sw, i) => {
      const gradient = AVATAR_GRADIENTS[(i + 3) % AVATAR_GRADIENTS.length];
      const ageSec = (i + 1) * 7;
      return {
        id: `seed_${i}_${now - ageSec * 1000}`,
        playerName: sw.name,
        avatarColor: gradient,
        game: sw.game,
        payout: sw.payout,
        message: sw.message,
        timeAgo: `${ageSec}s ago`,
        timestamp: now - ageSec * 1000,
      };
    });

    // Combine real and seed events, sorted latest first
    const combined = [...realEvents, ...seedEvents].sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      winners: combined.slice(0, 30),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching winners' },
      { status: 500 }
    );
  }
}
