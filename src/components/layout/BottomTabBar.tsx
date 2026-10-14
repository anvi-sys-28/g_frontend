'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Trophy, Radio, User, MoreHorizontal, X, Coins, LogOut, ArrowRight } from 'lucide-react';
import { CricketBatBallIcon } from '../icons/NavIcons';

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [userId, setUserId] = useState<string>('1001');
  const [coins, setCoins] = useState<number>(5000);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      try {
        const auth = Boolean(localStorage.getItem('playin_auth') && sessionStorage.getItem('playin_session_active'));
        setIsAuth(auth);
        const storedId = localStorage.getItem('playin_user_id') || '1001';
        setUserId(storedId);
        const storedCoins = localStorage.getItem('playin_user_coins');
        if (storedCoins) setCoins(parseInt(storedCoins, 10));
      } catch {
        setIsAuth(true);
      }
    };
    check();
    window.addEventListener('storage', check);
    window.addEventListener('playin_auth_changed', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('playin_auth_changed', check);
    };
  }, []);

  // Hide mobile bottom tab bar on full-screen login, intro, or admin portal
  if (pathname === '/login' || pathname === '/intro' || pathname.startsWith('/admin')) return null;
  if (pathname === '/' && !isAuth) return null;

  const isCricketActive = pathname === '/' || pathname.startsWith('/match/');

  const handleInPlayClick = () => {
    if (pathname !== '/') {
      router.push('/');
    }
    // Dispatch custom event to switch to live tab in MatchListView
    window.dispatchEvent(new CustomEvent('switch_cricket_tab', { detail: 'live' }));
  };

  const handleRequestCoins = async () => {
    setRequestStatus('Sending request...');
    try {
      const res = await fetch('/api/casino/user/request-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: 5000 }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestStatus('✅ Request submitted to admin for approval!');
      } else {
        setRequestStatus(data.error || 'Failed to request coins.');
      }
    } catch {
      setRequestStatus('Network error.');
    }
    setTimeout(() => setRequestStatus(null), 4000);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('playin_auth');
      localStorage.removeItem('playin_user_id');
      localStorage.removeItem('playin_role');
      sessionStorage.removeItem('playin_session_active');
      sessionStorage.removeItem('playin_intro_seen');
      window.dispatchEvent(new Event('playin_auth_changed'));
    } catch {}
    window.location.href = '/';
  };

  return (
    <>
      {/* Docked Bottom Navigation Bar matching Image 2 */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d12]/95 backdrop-blur-2xl border-t border-amber-500/20 py-1.5 px-2 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] pb-[calc(env(safe-area-inset-bottom,8px)+6px)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          {/* 1. CRICKET (Active with illuminated red box) */}
          <Link
            href="/"
            aria-label="Cricket"
            className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
          >
            <div
              className={`flex flex-col items-center justify-center w-full max-w-[76px] py-1 px-2 rounded-xl transition-all ${
                isCricketActive
                  ? 'bg-gradient-to-b from-red-600/35 to-red-950/80 border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.55)] scale-105'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CricketBatBallIcon
                className={`w-5 h-5 ${
                  isCricketActive
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'text-neutral-400'
                }`}
              />
              <span
                className={`text-[10px] sm:text-[11px] font-bold mt-0.5 tracking-wide ${
                  isCricketActive ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                Cricket
              </span>
            </div>
          </Link>

          {/* 2. SPORTS */}
          <Link
            href="/"
            aria-label="Sports"
            className="flex-1 flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-amber-300 transition-colors group"
          >
            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-medium mt-0.5">Sports</span>
          </Link>

          {/* 3. IN-PLAY */}
          <button
            onClick={handleInPlayClick}
            aria-label="In-Play"
            className="flex-1 flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-red-400 transition-colors group"
          >
            <Radio className="w-5 h-5 group-hover:scale-110 group-hover:text-red-500 transition-all" />
            <span className="text-[10px] sm:text-[11px] font-medium mt-0.5">In-Play</span>
          </button>

          {/* 4. ACCOUNT */}
          <button
            onClick={() => setShowAccountModal(true)}
            aria-label="Account"
            className="flex-1 flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-amber-400 transition-colors group"
          >
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-medium mt-0.5">Account</span>
          </button>

          {/* 5. MORE */}
          <button
            onClick={() => setShowMoreModal(true)}
            aria-label="More"
            className="flex-1 flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-white transition-colors group"
          >
            <MoreHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Account Bottom Sheet / Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-950 border border-amber-500/30 rounded-t-3xl sm:rounded-2xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-neutral-950 font-black text-lg shadow-md">
                  👤
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Player #{userId}</h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">● Active Session</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Coin Balance Card */}
            <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-medium">Available Balance</span>
                <div className="text-lg font-black text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{coins.toLocaleString()} Coins</span>
                </div>
              </div>
              <button
                onClick={handleRequestCoins}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-yellow-400 transition-all shadow-md active:scale-95"
              >
                + Request Coins
              </button>
            </div>

            {requestStatus && (
              <div className="text-xs text-center text-amber-300 bg-amber-950/60 border border-amber-500/30 rounded-lg py-1.5 px-3">
                {requestStatus}
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-950/60 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out &amp; Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* More Options Sheet / Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-950 border border-amber-500/30 rounded-t-3xl sm:rounded-2xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚡</span>
                <span>Gaming &amp; Features</span>
              </h3>
              <button
                onClick={() => setShowMoreModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/casino"
                onClick={() => setShowMoreModal(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎰</span>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Live Casino Lounge</h4>
                    <p className="text-[10px] text-neutral-400">Roulette &amp; Andar Bahar with real dealer tables</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/fixtures"
                onClick={() => setShowMoreModal(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Schedule &amp; Fixtures</h4>
                    <p className="text-[10px] text-neutral-400">Upcoming tours, ICC tournaments &amp; calendar</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/"
                onClick={() => {
                  setShowMoreModal(false);
                  handleInPlayClick();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔴</span>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400">Live In-Play Matches</h4>
                    <p className="text-[10px] text-neutral-400">Real-time ball telemetry &amp; live score feeds</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BottomTabBar;
