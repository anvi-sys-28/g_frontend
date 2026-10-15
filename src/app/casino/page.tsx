'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SmoothVideoCard } from '@/components/casino/SmoothVideoCard';
import {
  Sparkles,
  Dices,
  ArrowLeft,
  Play,
  X,
  Coins,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function CasinoPage() {
  const router = useRouter();
  // User & Coin State
  const [userId, setUserId] = useState<string>('vip_player');
  const [role, setRole] = useState<string>('USER');
  const [coins, setCoins] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [realPlayers, setRealPlayers] = useState<{ roulette: number; andarBahar: number }>({
    roulette: 1,
    andarBahar: 1,
  });

  // Coin Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('1000');
  const [requestReason, setRequestReason] = useState('Out of coins, requested refill to continue playing');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Game State
  const [activeGame, setActiveGame] = useState<'roulette' | 'andhar-bahar' | null>(null);

  // Roulette Game State
  const [rouletteBetAmount, setRouletteBetAmount] = useState<number>(100);
  const [rouletteChoice, setRouletteChoice] = useState<string>('RED'); // RED, BLACK, EVEN, ODD, STRAIGHT_UP
  const [rouletteNumber, setRouletteNumber] = useState<number>(7);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<any>(null);

  // Andar Bahar Game State
  const [abBetAmount, setAbBetAmount] = useState<number>(100);
  const [abChoice, setAbChoice] = useState<'ANDAR' | 'BAHAR'>('ANDAR');
  const [isDealing, setIsDealing] = useState(false);
  const [abResult, setAbResult] = useState<any>(null);

  // Load User Data from localStorage and PostgreSQL API
  const fetchUserData = useCallback(async () => {
    let currentId = 'vip_player';
    try {
      const stored = localStorage.getItem('playin_user_id');
      const storedRole = localStorage.getItem('playin_role');
      if (stored) currentId = stored;
      if (storedRole) setRole(storedRole);
    } catch {}

    setUserId(currentId);

    try {
      const res = await fetch(`/api/casino/auth?userId=${encodeURIComponent(currentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCoins(data.user.coins);
          setRole(data.user.role);
          setPendingRequest(data.user.pendingRequest || null);
        }
      }

      // Fetch authentic real user count from backend
      try {
        const uRes = await fetch('/api/casino/admin/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          const list: any[] = uData.users || [];
          const rCount = list.filter((u) => (u.gamesBreakdown?.roulette ?? 0) > 0).length;
          const abCount = list.filter((u) => (u.gamesBreakdown?.andarBahar ?? 0) > 0).length;
          setRealPlayers({
            roulette: Math.max(1, rCount || Math.ceil(list.length / 2) || 1),
            andarBahar: Math.max(1, abCount || Math.floor(list.length / 2) || 1),
          });
        }
      } catch {}
    } catch (e) {
      console.error('Error fetching casino user balance:', e);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Request Coins Handler
  const handleRequestCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestMessage(null);

    try {
      const res = await fetch('/api/casino/user/request-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestedAmount: Number(requestAmount) || 1000,
          reason: requestReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRequestMessage({ type: 'success', text: data.message });
        setPendingRequest(data.request);
        setTimeout(() => setShowRequestModal(false), 2000);
      } else {
        setRequestMessage({ type: 'error', text: data.error || 'Failed to submit request' });
      }
    } catch {
      setRequestMessage({ type: 'error', text: 'Network error submitting request' });
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Play Roulette Handler
  const handlePlayRoulette = async () => {
    if (coins < rouletteBetAmount) {
      setShowRequestModal(true);
      return;
    }

    setIsSpinning(true);
    setRouletteResult(null);

    try {
      const res = await fetch('/api/casino/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          game: 'ROULETTE',
          betAmount: rouletteBetAmount,
          betChoice: rouletteChoice,
          selectedNumber: rouletteChoice === 'STRAIGHT_UP' ? rouletteNumber : undefined,
        }),
      });

      const data = await res.json();

      // Simulate realistic wheel spin duration (1.8 seconds)
      setTimeout(() => {
        setIsSpinning(false);
        if (res.ok && data.success) {
          setRouletteResult(data);
          setCoins(data.newBalance);
        } else {
          alert(data.error || data.message || 'Game error');
        }
      }, 1800);
    } catch {
      setIsSpinning(false);
      alert('Network error playing round');
    }
  };

  // Play Andar Bahar Handler
  const handlePlayAndarBahar = async () => {
    if (coins < abBetAmount) {
      setShowRequestModal(true);
      return;
    }

    setIsDealing(true);
    setAbResult(null);

    try {
      const res = await fetch('/api/casino/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          game: 'ANDAR_BAHAR',
          betAmount: abBetAmount,
          betChoice: abChoice,
        }),
      });

      const data = await res.json();

      // Simulate cards dealing duration (1.8 seconds)
      setTimeout(() => {
        setIsDealing(false);
        if (res.ok && data.success) {
          setAbResult(data);
          setCoins(data.newBalance);
        } else {
          alert(data.error || data.message || 'Game error');
        }
      }, 1800);
    } catch {
      setIsDealing(false);
      alert('Network error playing round');
    }
  };

  const games = [
    {
      id: 'roulette',
      title: 'ROULETTE',
      posterSrc: '/1.webp',
      framesDir: '/R',
      totalFrames: 300,
      category: 'Live Roulette',
      provider: 'Evolution Gaming',
      playersCount: `${realPlayers.roulette} Playing`,
      tag: 'HOT',
      description:
        'European and Lightning Roulette with real-time ball spinning physics, inside/outside bets, and interactive 60 FPS live video stream.',
    },
    {
      id: 'andhar-bahar',
      title: 'ANDHAR BAHAR',
      posterSrc: '/2.webp',
      framesDir: '/A',
      totalFrames: 300,
      category: 'Card Classic',
      provider: 'Ezugi Live',
      playersCount: `${realPlayers.andarBahar} Playing`,
      tag: 'FEATURED',
      description:
        'The authentic traditional South Asian card favorite featuring instant card cuts, Andar/Bahar betting spots, and crystal clear 60 FPS video.',
    },
  ];

  return (
    <div className="relative min-h-screen pb-28">
      {/* 100% Fixed, Motionless Background Layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100lvh',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Mobile Casino Background (< 768px): mcb.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mcb.webp"
          alt=""
          className="w-full h-full object-cover object-center md:hidden pointer-events-none select-none"
          style={{
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
          }}
        />

        {/* Desktop / Computer Casino Background (>= 768px): pcb.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pcb.webp"
          alt=""
          className="w-full h-full object-cover object-center hidden md:block pointer-events-none select-none"
          style={{
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
          }}
        />

        {/* Ambient Dark Gradient Overlays for Maximum Contrast & Depth */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Lounge Bar: User Balance & Action Shortcuts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-950/95 border border-amber-500/35 shadow-2xl ring-1 ring-amber-400/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/90 text-white font-bold text-xs uppercase tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Live Casino Showcase
              </span>
              {role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                  Admin Active
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Casino Games Lounge
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 mt-0.5">
              Player: <span className="text-amber-400 font-bold">{userId}</span> • Hover game boxes for 60 FPS live video previews.
            </p>
          </div>

          {/* Right: Wallet Balance & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Coins Balance Pill */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-amber-500/10">
              <div className="w-7 h-7 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                <Coins className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-tight">
                  Casino Balance
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300 leading-tight">
                  {coins.toLocaleString()} Coins
                </span>
              </div>
            </div>

            {/* Request Coins Button */}
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 font-bold text-xs border border-amber-500/35 transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Coins</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/15 text-white text-xs font-bold transition-colors shadow-lg backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Scores</span>
            </Link>
          </div>
        </div>

        {/* Low Coins Alert Banner */}
        {coins === 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Your casino coin balance is 0.</strong> Request coins from your Admin to continue playing Roulette and Andar Bahar!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
            >
              Request 1,000 Coins
            </button>
          </div>
        )}

        {/* Two Featured Games Placed Side-by-Side (60 FPS Smooth Video Previews) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {games.map((game) => (
            <SmoothVideoCard
              key={game.id}
              title={game.title}
              posterSrc={game.posterSrc}
              framesDir={game.framesDir}
              totalFrames={game.totalFrames}
              category={game.category}
              provider={game.provider}
              playersCount={game.playersCount}
              tag={game.tag}
              onPlayClick={() => {
                if (game.id === 'roulette') {
                  router.push('/roulette');
                } else if (game.id === 'andhar-bahar') {
                  router.push('/andar-bahar');
                } else {
                  setActiveGame(game.id as any);
                }
              }}
            />
          ))}
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: INTERACTIVE LIVE ROULETTE GAMEPLAY */}
        {/* ======================================================== */}
        {activeGame === 'roulette' && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
          >
            <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950 border border-amber-500/40 shadow-2xl p-6 space-y-5 text-white">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg">
                    <Dices className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      Live European Roulette
                    </h2>
                    <span className="text-xs text-amber-300 font-bold">
                      Wallet Balance: {coins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Roulette Wheel Preview Area */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-900 flex items-center justify-center">
                {/* 60 FPS Video Frame Card Background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/1.webp"
                  alt="Roulette"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 text-center space-y-2">
                  {isSpinning ? (
                    <div className="space-y-2">
                      <div className="w-14 h-14 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-amber-300 animate-pulse">
                        Spinning Roulette Ball (60 FPS)...
                      </p>
                    </div>
                  ) : rouletteResult ? (
                    <div className="space-y-1">
                      <div
                        className={`inline-block px-5 py-2 rounded-2xl font-black text-2xl shadow-xl ${
                          rouletteResult.details.winningColor === 'RED'
                            ? 'bg-red-600 text-white'
                            : rouletteResult.details.winningColor === 'BLACK'
                            ? 'bg-neutral-800 text-white border border-white/20'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {rouletteResult.details.winningNumber} ({rouletteResult.details.winningColor})
                      </div>
                      <div className="text-sm font-black">
                        {rouletteResult.won ? (
                          <span className="text-emerald-400">
                            🎉 WON +{rouletteResult.payout} COINS!
                          </span>
                        ) : (
                          <span className="text-red-400">LOST {rouletteResult.wager} COINS</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-widest font-extrabold text-neutral-300">
                        Place Your Bets & Spin
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Picks: RED (2x), BLACK (2x), EVEN (2x), ODD (2x), Single Number (36x)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Betting Controls */}
              <div className="space-y-3 text-xs">
                {/* Bet Choice Selector */}
                <div>
                  <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[10px]">
                    Choose Bet Spot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'RED', label: '🔴 RED (2x)' },
                      { id: 'BLACK', label: '⚫ BLACK (2x)' },
                      { id: 'EVEN', label: 'EVEN (2x)' },
                      { id: 'ODD', label: 'ODD (2x)' },
                    ].map((spot) => (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => setRouletteChoice(spot.id)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          rouletteChoice === spot.id
                            ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                        }`}
                      >
                        {spot.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setRouletteChoice('1_18')}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        rouletteChoice === '1_18'
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      1 to 18 (2x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRouletteChoice('19_36')}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        rouletteChoice === '19_36'
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      19 to 36 (2x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRouletteChoice('STRAIGHT_UP')}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        rouletteChoice === 'STRAIGHT_UP'
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      Number 0-36 (36x)
                    </button>
                  </div>

                  {rouletteChoice === 'STRAIGHT_UP' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-neutral-400 font-bold">Pick Lucky Number:</span>
                      <input
                        type="number"
                        min="0"
                        max="36"
                        value={rouletteNumber}
                        onChange={(e) => setRouletteNumber(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-xl bg-neutral-900 border border-amber-400/50 text-white font-black text-center focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Coin Wager Selector */}
                <div>
                  <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[10px]">
                    Select Bet Amount (Coins)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[50, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRouletteBetAmount(amt)}
                        className={`py-2 rounded-xl font-black border transition-all ${
                          rouletteBetAmount === amt
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-400'
                            : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spin Action Button */}
                <button
                  type="button"
                  disabled={isSpinning || coins < rouletteBetAmount}
                  onClick={handlePlayRoulette}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#AA771C] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>
                    {isSpinning
                      ? 'Spinning Wheel...'
                      : coins < rouletteBetAmount
                      ? 'Out of Coins - Request From Admin'
                      : `SPIN ROULETTE (${rouletteBetAmount} COINS)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: INTERACTIVE LIVE ANDAR BAHAR GAMEPLAY */}
        {/* ======================================================== */}
        {activeGame === 'andhar-bahar' && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
          >
            <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950 border border-amber-500/40 shadow-2xl p-6 space-y-5 text-white">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black shadow-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      Live Andar Bahar Classic
                    </h2>
                    <span className="text-xs text-amber-300 font-bold">
                      Wallet Balance: {coins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cards Dealing Table Area */}
              <div className="relative h-48 rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-900 flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/2.webp"
                  alt="Andar Bahar"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 text-center space-y-2 w-full">
                  {isDealing ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-amber-300 animate-pulse">
                        Dealing Andar & Bahar Cards (60 FPS)...
                      </p>
                    </div>
                  ) : abResult ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-amber-400/50">
                          <span className="text-[10px] text-neutral-400 block font-semibold">Joker Card</span>
                          <span className="text-xl font-black text-amber-300">
                            {abResult.details.jokerCard}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-xl font-black text-lg ${
                            abResult.details.winningSide === 'ANDAR'
                              ? 'bg-brand-600 text-white'
                              : 'bg-yellow-600 text-black'
                          }`}
                        >
                          Winner: {abResult.details.winningSide}
                        </div>
                      </div>

                      <div className="text-sm font-black">
                        {abResult.won ? (
                          <span className="text-emerald-400">
                            🎉 WON +{abResult.payout} COINS (1.95x)!
                          </span>
                        ) : (
                          <span className="text-red-400">LOST {abResult.wager} COINS</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-widest font-extrabold text-neutral-300">
                        Choose ANDAR or BAHAR (1.95x Payout)
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        First side to match the middle Joker rank wins the round!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Betting Controls */}
              <div className="space-y-3 text-xs">
                {/* Side Selector */}
                <div>
                  <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[10px]">
                    Choose Side
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAbChoice('ANDAR')}
                      className={`py-3 rounded-2xl font-black text-sm border transition-all ${
                        abChoice === 'ANDAR'
                          ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-600/30 ring-2 ring-brand-400/30'
                          : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-brand-500/50'
                      }`}
                    >
                      ANDAR (1.95x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbChoice('BAHAR')}
                      className={`py-3 rounded-2xl font-black text-sm border transition-all ${
                        abChoice === 'BAHAR'
                          ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-400/30'
                          : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-yellow-500/50'
                      }`}
                    >
                      BAHAR (1.95x)
                    </button>
                  </div>
                </div>

                {/* Coin Wager Selector */}
                <div>
                  <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[10px]">
                    Select Bet Amount (Coins)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[50, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAbBetAmount(amt)}
                        className={`py-2 rounded-xl font-black border transition-all ${
                          abBetAmount === amt
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-400'
                            : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-amber-400/40'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Deal Button */}
                <button
                  type="button"
                  disabled={isDealing || coins < abBetAmount}
                  onClick={handlePlayAndarBahar}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#AA771C] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>
                    {isDealing
                      ? 'Dealing Cards...'
                      : coins < abBetAmount
                      ? 'Out of Coins - Request From Admin'
                      : `DEAL ANDAR BAHAR (${abBetAmount} COINS)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: REQUEST COINS FROM ADMIN MODAL */}
        {/* ======================================================== */}
        {showRequestModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-amber-500/40 p-6 space-y-4 shadow-2xl shadow-black">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Request Coins from Admin</h2>
                    <span className="text-[11px] text-neutral-400">Player: {userId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {requestMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    requestMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {requestMessage.text}
                </div>
              )}

              {pendingRequest && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    You already have a pending request for {pendingRequest.requestedAmount} coins awaiting Admin approval.
                  </span>
                </div>
              )}

              <form onSubmit={handleRequestCoins} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Select Coin Request Amount
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['500', '1000', '2500', '5000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRequestAmount(preset)}
                        className={`py-1.5 rounded-lg font-bold border transition-colors ${
                          requestAmount === preset
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-neutral-950 text-neutral-300 border-white/10 hover:border-amber-400/50'
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="100"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Reason Message for Admin
                  </label>
                  <textarea
                    rows={2}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/25 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{requestSubmitting ? 'Sending...' : 'Send Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
