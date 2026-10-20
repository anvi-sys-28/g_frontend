'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

interface LiveWinnersChatOverlayProps {
  game: 'ROULETTE' | 'ANDAR_BAHAR';
  isResultTime?: boolean;
  roundId?: number;
}

export function LiveWinnersChatOverlay({
  game,
  isResultTime = false,
  roundId,
}: LiveWinnersChatOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [messages, setMessages] = useState<WinnerItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('playin_user_id') || 'vip_player';
      setCurrentUserId(stored);
    } catch {}
  }, []);

  // Fetch real winners strictly for the current game and round
  const fetchWinners = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (game) query.set('game', game);
      if (roundId) query.set('roundId', String(roundId));

      const res = await fetch(`/api/casino/winners?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.winners && Array.isArray(data.winners)) {
          // Strictly unique by playerName so NO user profile is ever duplicated
          const seen = new Set<string>();
          const unique: WinnerItem[] = [];

          for (const w of data.winners) {
            const key = (w.playerName || '').toLowerCase().trim();
            if (key && !seen.has(key)) {
              seen.add(key);
              unique.push({
                id: w.id || `w_${Math.random()}`,
                playerName: w.playerName,
                avatarColor: w.avatarColor || 'from-amber-500 to-yellow-600',
                game: w.game,
                payout: w.payout,
                timestamp: w.timestamp || Date.now(),
                isRealUser: true,
              });
            }
          }

          setMessages(unique);
        }
      }
    } catch {}
  }, [game, roundId]);

  // When result time begins, fetch the winners; when not in result time, clear messages
  useEffect(() => {
    if (isResultTime) {
      fetchWinners();
    } else {
      setMessages([]);
    }
  }, [isResultTime, fetchWinners]);

  // ONLY SHOW AT RESULT TIME TILL NEXT GAME BETTING OPENS
  // When betting opens or wheel is spinning/dealing: DO NOT SHOW RESULT!
  if (!isResultTime || !visible || messages.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute top-2 left-2 bottom-2 w-[210px] sm:w-[250px] z-20 flex flex-col justify-end pointer-events-none select-none overflow-hidden"
    >
      <style>{`
        @keyframes winnerFloatUpAndOff {
          0% {
            transform: translate3d(0, 110%, 0);
            opacity: 0;
          }
          15% {
            transform: translate3d(0, 45%, 0);
            opacity: 1;
          }
          70% {
            transform: translate3d(0, -40%, 0);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, -125%, 0);
            opacity: 0;
          }
        }
      `}</style>

      {/* Top Header Toggle Pill */}
      <div className="flex items-center gap-1.5 shrink-0 mb-1 pointer-events-auto z-30">
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          title={visible ? 'Hide Live Wins' : 'Show Live Wins'}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#d4af37]/50 hover:border-[#d4af37] text-white/90 text-[10px] font-black tracking-wider uppercase transition-all shadow-md active:scale-95"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[#f5d27a]">Live Wins</span>
          {visible ? <EyeOff className="w-2.5 h-2.5 text-neutral-400" /> : <Eye className="w-2.5 h-2.5 text-neutral-400" />}
        </button>
      </div>

      {/* Upward Scrolling Result Cards (Glides from bottom to top and scrolls completely off the table during result time) */}
      <div
        className="relative flex-1 w-full overflow-hidden flex flex-col justify-end"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <div
          className="flex flex-col space-y-2 will-change-transform pointer-events-auto"
          style={{
            animation: 'winnerFloatUpAndOff 4.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        >
          {messages.map((item) => {
            const isCurrentUser = currentUserId && item.playerName === currentUserId;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all shadow-xl ${
                  isCurrentUser
                    ? 'bg-amber-950/90 border border-[#f5d27a] shadow-[0_0_20px_rgba(245,210,122,0.5)]'
                    : 'bg-black/75 backdrop-blur-md border border-white/15 hover:border-white/25'
                }`}
              >
                {/* Circular Avatar */}
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
                      <span className="text-[8px] font-black uppercase px-1 rounded bg-[#f5d27a] text-black font-sans">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Line 2: Amount Won Only */}
                  <p className="text-[11px] font-extrabold text-emerald-400 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] break-words mt-0.5">
                    +{item.payout.toLocaleString()} Coins
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LiveWinnersChatOverlay;
