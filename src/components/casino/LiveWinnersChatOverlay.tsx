'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Eye, EyeOff } from 'lucide-react';

export interface WinnerItem {
  id: string;
  playerName: string;
  avatarColor: string;
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  payout: number;
  timestamp: number;
  isRealUser?: boolean;
}

export function LiveWinnersChatOverlay({ game }: { game?: 'ROULETTE' | 'ANDAR_BAHAR' }) {
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<WinnerItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('playin_user_id') || 'vip_player';
      setCurrentUserId(stored);
    } catch {}
  }, []);

  // Fetch real winners strictly for the current game
  const fetchWinners = useCallback(async () => {
    try {
      const url = game ? `/api/casino/winners?game=${encodeURIComponent(game)}` : '/api/casino/winners';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.winners && Array.isArray(data.winners)) {
          // Format strictly real settled winners
          const formatted: WinnerItem[] = data.winners.map((w: any) => ({
            id: w.id || `w_${Math.random()}`,
            playerName: w.playerName,
            avatarColor: w.avatarColor || 'from-amber-500 to-yellow-600',
            game: w.game,
            payout: w.payout,
            timestamp: w.timestamp || Date.now(),
            isRealUser: true,
          }));

          setMessages(formatted);
        }
      }
    } catch {}
  }, [game]);

  // Initial load
  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  // Real-time polling for actual settled winners every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWinners();
    }, 3000);
    return () => clearInterval(timer);
  }, [fetchWinners]);

  // Build repeated track items so translateY(0%) to translateY(-50%) scrolls infinitely and seamlessly
  const trackItems = useMemo(() => {
    if (messages.length === 0) return [];
    let base = [...messages];
    while (base.length < 5) {
      base = [...base, ...messages];
    }
    return [...base, ...base];
  }, [messages]);

  // Calculate smooth reading duration (~22px/sec travel speed)
  const duration = useMemo(() => {
    const halfCount = trackItems.length / 2;
    return Math.max(12, Math.round(halfCount * 3.8));
  }, [trackItems.length]);

  return (
    <div
      className="absolute top-2 left-2 bottom-2 w-[210px] sm:w-[250px] z-20 flex flex-col pointer-events-none select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <style>{`
        @keyframes liveWinnersScrollUp {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }
      `}</style>

      {/* Top Header Toggle Pill */}
      <div className="flex items-center gap-1.5 shrink-0 mb-1 pointer-events-auto z-30">
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          title={visible ? 'Hide Live Winners Feed' : 'Show Live Winners Feed'}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-[#d4af37]/40 hover:border-[#d4af37] text-white/90 text-[10px] font-black tracking-wider uppercase transition-all shadow-md active:scale-95"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[#f5d27a]">Live Wins</span>
          {visible ? <EyeOff className="w-2.5 h-2.5 text-neutral-400" /> : <Eye className="w-2.5 h-2.5 text-neutral-400" />}
        </button>
      </div>

      {/* Upward Scrolling Comments Track (Glides from bottom to top and scrolls completely off the table) */}
      {visible && trackItems.length > 0 && (
        <div
          className="relative flex-1 w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 85%, transparent 100%)',
          }}
        >
          <div
            className="flex flex-col space-y-2.5 will-change-transform pointer-events-auto pt-2"
            style={{
              animation: `liveWinnersScrollUp ${duration}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {trackItems.map((item, idx) => {
              const isCurrentUser = currentUserId && item.playerName === currentUserId;
              return (
                <div
                  key={`${item.id}_${idx}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all shadow-md ${
                    isCurrentUser
                      ? 'bg-amber-950/80 border border-[#f5d27a] shadow-[0_0_15px_rgba(245,210,122,0.4)]'
                      : 'bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Circular Avatar with Gradient & Silhouette (Matching YouTube reference) */}
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${item.avatarColor} flex items-center justify-center shrink-0 border border-white/20 shadow-sm`}
                  >
                    <User className="w-3.5 h-3.5 text-white drop-shadow" />
                  </div>

                  {/* User Handle & Win Amount Block */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: Player Name Only */}
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-[11px] font-bold text-neutral-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {item.playerName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[8px] font-black uppercase px-1 rounded bg-[#f5d27a] text-black">
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Line 2: Amount Won Only */}
                    <p className="text-[11px] font-extrabold text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] break-words mt-0.5">
                      <span className="text-emerald-400">+{item.payout.toLocaleString()}</span>{' '}
                      <span className="text-[#f5d27a]">Coins</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveWinnersChatOverlay;
