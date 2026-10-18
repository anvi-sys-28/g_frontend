'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Sparkles, Trophy, Eye, EyeOff, Radio } from 'lucide-react';

export interface WinnerItem {
  id: string;
  playerName: string;
  avatarColor: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  payout: number;
  message: string;
  isRealUser?: boolean;
}

const POOL_WINNERS: Omit<WinnerItem, 'id'>[] = [
  { playerName: 'EchoStorm', avatarColor: 'from-purple-600 to-indigo-500', game: 'ROULETTE', payout: 36000, message: 'Won 36,000 Coins on #17! 🎯' },
  { playerName: 'NovaTrace', avatarColor: 'from-orange-500 to-amber-500', game: 'ANDAR_BAHAR', payout: 19500, message: 'Won 19,500 Coins on ANDAR! 👑' },
  { playerName: 'SkylineSeeker', avatarColor: 'from-blue-600 to-cyan-400', game: 'ROULETTE', payout: 72000, message: 'Hit 72,000 Coins on Corner 2/6! 💰' },
  { playerName: 'NeonPulse', avatarColor: 'from-cyan-500 to-blue-500', game: 'ROULETTE', payout: 10000, message: 'Won 10,000 Coins on Red! ⚡' },
  { playerName: 'PtoFox92', avatarColor: 'from-rose-500 to-pink-500', game: 'ANDAR_BAHAR', payout: 29250, message: 'Won 29,250 Coins on BAHAR! 🃏' },
  { playerName: 'Karan99', avatarColor: 'from-emerald-500 to-teal-400', game: 'ROULETTE', payout: 35000, message: 'Won 35,000 Coins on Number 2! 🎯' },
  { playerName: 'Rahul_Boss', avatarColor: 'from-yellow-500 to-amber-600', game: 'ANDAR_BAHAR', payout: 48750, message: 'Won 48,750 Coins on ANDAR! 👑' },
  { playerName: 'Ananya_777', avatarColor: 'from-violet-600 to-fuchsia-500', game: 'ROULETTE', payout: 18000, message: 'Won 18,000 Coins on 1st Dozen! 💎' },
  { playerName: 'LuckyStrike', avatarColor: 'from-red-600 to-orange-500', game: 'ROULETTE', payout: 50000, message: 'Hit 50,000 Coins on Black! 🖤' },
  { playerName: 'Vikram_X', avatarColor: 'from-amber-500 to-orange-600', game: 'ANDAR_BAHAR', payout: 39000, message: 'Won 39,000 Coins on BAHAR! 🔥' },
  { playerName: 'Aman_K', avatarColor: 'from-indigo-600 to-purple-500', game: 'ROULETTE', payout: 36000, message: 'Won 36,000 Coins on Number 32! 🎯' },
  { playerName: 'Rohan_Ace', avatarColor: 'from-emerald-600 to-green-400', game: 'ANDAR_BAHAR', payout: 19500, message: 'Won 19,500 Coins on ANDAR! 👑' },
  { playerName: 'GoldFinger', avatarColor: 'from-yellow-400 to-amber-500', game: 'ROULETTE', payout: 105000, message: 'Hit 105,000 Coins Jackpot! 🏆' },
  { playerName: 'QueenBee', avatarColor: 'from-pink-500 to-rose-400', game: 'ANDAR_BAHAR', payout: 35000, message: 'Won 35,000 Coins on BAHAR! 💎' },
  { playerName: 'BlitzRider', avatarColor: 'from-cyan-400 to-blue-600', game: 'ROULETTE', payout: 24000, message: 'Won 24,000 Coins on Street 7-9! ⚡' },
];

export function LiveWinnersChatOverlay({ game }: { game?: 'ROULETTE' | 'ANDAR_BAHAR' }) {
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<WinnerItem[]>([
    {
      id: 'init_1',
      playerName: 'EchoStorm',
      avatarColor: 'from-purple-600 to-indigo-500',
      game: 'ROULETTE',
      payout: 36000,
      message: 'Won 36,000 Coins on #17! 🎯',
    },
    {
      id: 'init_2',
      playerName: 'NovaTrace',
      avatarColor: 'from-orange-500 to-amber-500',
      game: 'ANDAR_BAHAR',
      payout: 19500,
      message: 'Won 19,500 Coins on ANDAR! 👑',
    },
    {
      id: 'init_3',
      playerName: 'SkylineSeeker',
      avatarColor: 'from-blue-600 to-cyan-400',
      game: 'ROULETTE',
      payout: 72000,
      message: 'Hit 72,000 Coins on Corner 2/6! 💰',
    },
    {
      id: 'init_4',
      playerName: 'NeonPulse',
      avatarColor: 'from-cyan-500 to-blue-500',
      game: 'ROULETTE',
      payout: 10000,
      message: 'Won 10,000 Coins on Red! ⚡',
    },
  ]);

  const poolIndexRef = useRef(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new comments arrive (YouTube live chat style)
  useEffect(() => {
    if (scrollContainerRef.current && !isPaused) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isPaused]);

  // Initial fetch from /api/casino/winners to load real server winners
  useEffect(() => {
    fetch('/api/casino/winners')
      .then((res) => res.json())
      .then((data) => {
        if (data?.winners && Array.isArray(data.winners) && data.winners.length > 0) {
          const formatted: WinnerItem[] = data.winners.slice(0, 6).reverse().map((w: any) => ({
            id: w.id || `w_${Math.random()}`,
            playerName: w.playerName,
            avatarColor: w.avatarColor || 'from-amber-500 to-yellow-600',
            game: w.game,
            payout: w.payout,
            message: w.message,
            isRealUser: w.isRealUser,
          }));
          setMessages(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Interval pushing new winner comments (every 2.8 - 4.2 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused) return;

      const template = POOL_WINNERS[poolIndexRef.current % POOL_WINNERS.length];
      poolIndexRef.current += 1;

      const newItem: WinnerItem = {
        id: `win_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        playerName: template.playerName,
        avatarColor: template.avatarColor,
        game: template.game,
        payout: template.payout,
        message: template.message,
      };

      setMessages((prev) => {
        const next = [...prev, newItem];
        // Keep last 15 items in history
        return next.length > 15 ? next.slice(next.length - 15) : next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="absolute top-2 left-2 bottom-2 w-[210px] sm:w-[250px] z-20 flex flex-col justify-end pointer-events-none select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Toggle Pill */}
      <div className="absolute top-1 left-1 pointer-events-auto flex items-center gap-1.5 z-30">
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          title={visible ? 'Hide Live Winners Feed' : 'Show Live Winners Feed'}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 hover:border-[#d4af37] text-white/90 text-[10px] font-black tracking-wider uppercase transition-all shadow-md active:scale-95"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[#f5d27a]">Live Wins</span>
          {visible ? <EyeOff className="w-2.5 h-2.5 text-neutral-400" /> : <Eye className="w-2.5 h-2.5 text-neutral-400" />}
        </button>
      </div>

      {/* Scrolling Comments Overlay (YouTube / TikTok Live Stream Style) */}
      {visible && (
        <div
          ref={scrollContainerRef}
          style={{
            maskImage: 'linear-gradient(to top, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)',
          }}
          className="w-full max-h-[190px] sm:max-h-[240px] overflow-y-auto overflow-x-hidden space-y-2 pr-1 pt-6 pb-1 scrollbar-none pointer-events-auto flex flex-col justify-end"
        >
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-xl transition-all animate-in slide-in-from-bottom-2 duration-300 ${
                item.isRealUser
                  ? 'bg-amber-950/70 border border-[#f5d27a] shadow-[0_0_15px_rgba(245,210,122,0.4)]'
                  : 'bg-black/55 backdrop-blur-md border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Circular Avatar with Gradient & Silhouette (Matching YouTube reference) */}
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-tr ${item.avatarColor} flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-0.5`}
              >
                <User className="w-4 h-4 text-white drop-shadow" />
              </div>

              {/* User Handle & Win Message Block */}
              <div className="flex-1 min-w-0">
                {/* Line 1: Player Name */}
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-[11px] font-bold text-neutral-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {item.playerName}
                  </span>
                  {item.isRealUser && (
                    <span className="text-[8px] font-black uppercase px-1 rounded bg-[#f5d27a] text-black">
                      YOU
                    </span>
                  )}
                </div>

                {/* Line 2: Win Amount & Game Detail */}
                <p className="text-[11px] font-extrabold text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] break-words mt-0.5">
                  <span className="text-emerald-400">+{item.payout.toLocaleString()}</span>{' '}
                  <span className="text-[#f5d27a]">Coins</span>{' '}
                  <span className="text-[10px] text-neutral-300 font-medium">
                    ({item.game === 'ROULETTE' ? 'Roulette' : 'Andar Bahar'})
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
