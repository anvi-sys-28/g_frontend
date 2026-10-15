'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LimelightNav, NavItem } from '@/components/ui/limelight-nav';
import { CricketBatBallIcon, AceCardIcon, ProfilePersonIcon } from '../icons/NavIcons';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Send,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Dices,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface TransactionItem {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  note?: string | null;
  createdAt: string;
}

interface BetItem {
  id: string;
  game: string;
  betAmount: number;
  payout: number;
  won: boolean;
  details?: any;
  balanceAfter: number;
  createdAt: string;
}

interface RequestItem {
  id: string;
  requestedAmount: number;
  allocatedAmount?: number | null;
  status: string;
  reason?: string | null;
  createdAt: string;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // User Profile & Coins State
  const [userId, setUserId] = useState<string>('1001');
  const [userRole, setUserRole] = useState<string>('USER');
  const [coins, setCoins] = useState<number>(5000);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // History State
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [bets, setBets] = useState<BetItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'all' | 'additions' | 'bets' | 'requests'>('all');

  // Request Coins Modal State
  const [showRequestInput, setShowRequestInput] = useState(false);
  const [requestAmount, setRequestAmount] = useState('1000');
  const [requestStatusMsg, setRequestStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const check = () => {
      try {
        const auth = Boolean(localStorage.getItem('playin_auth') && sessionStorage.getItem('playin_session_active'));
        setIsAuth(auth);
        const storedId = localStorage.getItem('playin_user_id') || '1001';
        setUserId(storedId);
        const storedRole = localStorage.getItem('playin_role') || 'USER';
        setUserRole(storedRole);
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

  // Fetch full transaction history from backend
  const fetchUserHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/casino/admin/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCoins(data.user.coins);
          setUserRole(data.user.role);
          try {
            localStorage.setItem('playin_user_coins', String(data.user.coins));
          } catch {}
        }
        setTransactions(data.transactions || []);
        setBets(data.bets || []);
        setRequests(data.requests || []);
      } else {
        // Fallback for initial demo account if not in database yet
        generateFallbackHistory();
      }
    } catch {
      generateFallbackHistory();
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  const generateFallbackHistory = () => {
    const now = new Date();
    setTransactions([
      {
        id: 'tx-1',
        amount: 5000,
        balanceAfter: 5000,
        type: 'ADMIN_ALLOT',
        note: 'Welcome Bankroll - Initial Allotment by Admin',
        createdAt: new Date(now.getTime() - 3600000 * 2).toISOString(),
      },
      {
        id: 'tx-2',
        amount: 1000,
        balanceAfter: 6000,
        type: 'REQUEST_APPROVED',
        note: 'Admin Approved Coin Request (+1,000 Coins)',
        createdAt: new Date(now.getTime() - 1800000).toISOString(),
      },
    ]);
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    fetchUserHistory();
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setShowRequestInput(false);
    setRequestStatusMsg(null);
  };

  const handleSendCoinRequest = async () => {
    const amountNum = parseInt(requestAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setRequestStatusMsg({ type: 'error', text: 'Enter a valid coin amount' });
      return;
    }

    try {
      const res = await fetch('/api/casino/user/request-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requestedAmount: amountNum, reason: 'Profile refill request' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequestStatusMsg({ type: 'success', text: `Refill request for ${amountNum.toLocaleString()} coins sent to Admin!` });
        setShowRequestInput(false);
        fetchUserHistory();
      } else {
        setRequestStatusMsg({ type: 'error', text: data.error || 'Request failed' });
      }
    } catch {
      setRequestStatusMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
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

  // Hide mobile bottom tab bar on full-screen login, intro, admin portal, or on root before login
  if (pathname === '/login' || pathname === '/intro' || pathname.startsWith('/admin')) return null;
  if (pathname === '/' && !isAuth) return null;

  // Active Index: 0 = Sports/Cricket, 1 = Casino (or Roulette), 2 = Profile
  const activeIndex = showProfileModal ? 2 : (pathname.startsWith('/casino') || pathname.startsWith('/roulette')) ? 1 : 0;

  // Compute "how many times coins in his account has added"
  const coinAdditions = transactions.filter((t) => t.amount > 0);
  const timesCoinsAdded = coinAdditions.length;
  const totalCoinsAdded = coinAdditions.reduce((acc, t) => acc + t.amount, 0);

  // Tab Items matching user specifications: Bat/Ball (Cricket), Cards (Casino), Person (Profile)
  const navItems: NavItem[] = [
    {
      id: 'sports',
      label: 'Cricket Live Scores',
      icon: <CricketBatBallIcon className="w-7 h-7" />,
      onClick: () => {
        setShowProfileModal(false);
        router.push('/');
      },
    },
    {
      id: 'casino',
      label: 'Live Casino Lounge',
      icon: <AceCardIcon className="w-7 h-7" />,
      onClick: () => {
        setShowProfileModal(false);
        router.push('/casino');
      },
    },
    {
      id: 'profile',
      label: 'User Profile & Coin History',
      icon: <ProfilePersonIcon className="w-7 h-7" />,
      onClick: () => {
        handleOpenProfile();
      },
    },
  ];

  return (
    <>
      {/* Authentic Limelight Navigation Bar with Cricket, Casino, and Profile */}
      <div
        aria-label="Bottom Navigation"
        className="lg:hidden fixed bottom-4 left-0 right-0 z-40 flex justify-center items-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="pointer-events-auto">
          <LimelightNav
            items={navItems}
            activeIndex={activeIndex}
            className="w-[330px] max-w-[92vw] h-16 rounded-2xl bg-surface/95 dark:bg-card/95 backdrop-blur-2xl border-2 border-surface-border shadow-2xl shadow-black/50 justify-around px-2"
            iconContainerClassName="flex-1"
            limelightClassName="bg-brand-600 shadow-[0_0_20px_var(--brand-600)]"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFILE MODAL: COINS ADDED COUNT & FULL TRANSACTION HISTORY */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg max-h-[90vh] bg-neutral-950 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 text-black flex items-center justify-center font-black shadow-lg">
                    <ProfilePersonIcon className="w-7 h-7 text-neutral-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">Player #{userId}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 uppercase">
                        {userRole}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active Session Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchUserHistory}
                    disabled={isLoadingHistory}
                    title="Refresh History"
                    className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={handleCloseProfile}
                    className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body (Scrollable) */}
              <div className="overflow-y-auto no-scrollbar py-4 space-y-4 flex-1">
                {/* 1. Account Metrics Highlight Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Current Available Balance */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/35 shadow-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Current Coins
                      </span>
                      <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300">
                      {coins.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-neutral-400 block">Available in Wallet</span>
                  </div>

                  {/* HOW MANY TIMES COINS IN HIS ACCOUNT HAS ADDED */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/35 shadow-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Coins Added
                      </span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300">
                      {timesCoinsAdded} Times
                    </div>
                    <span className="text-[10px] text-neutral-400 block">
                      +{totalCoinsAdded.toLocaleString()} Total Credited
                    </span>
                  </div>
                </div>

                {/* Request More Coins Prompt Button */}
                <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Need More Coins?</span>
                    <span className="text-[11px] text-neutral-400">Request an immediate refill from Admin</span>
                  </div>
                  <button
                    onClick={() => setShowRequestInput((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-yellow-400 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    + Request Coins
                  </button>
                </div>

                {/* Inline Request Coins Form */}
                {showRequestInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5"
                  >
                    <span className="text-xs font-bold text-amber-300 block">Select Request Amount:</span>
                    <div className="flex items-center gap-2">
                      {['1000', '2500', '5000', '10000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRequestAmount(amt)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                            requestAmount === amt
                              ? 'bg-amber-400 text-neutral-950'
                              : 'bg-neutral-900 text-neutral-300 border border-white/10'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSendCoinRequest}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md"
                    >
                      Submit Request to Admin
                    </button>
                  </motion.div>
                )}

                {requestStatusMsg && (
                  <div
                    className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 ${
                      requestStatusMsg.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/40 text-red-300'
                    }`}
                  >
                    {requestStatusMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{requestStatusMsg.text}</span>
                  </div>
                )}

                {/* 2. All Related Transactions & Full History */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>All Related Transactions History</span>
                    </h3>
                    <span className="text-[11px] text-neutral-500 font-semibold">
                      {transactions.length + bets.length} Total Events
                    </span>
                  </div>

                  {/* Filter Sub-Tabs */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar text-xs">
                    <button
                      onClick={() => setActiveHistoryTab('all')}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        activeHistoryTab === 'all'
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Transactions ({transactions.length})
                    </button>
                    <button
                      onClick={() => setActiveHistoryTab('additions')}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        activeHistoryTab === 'additions'
                          ? 'bg-emerald-500 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Coins Added ({timesCoinsAdded})
                    </button>
                    <button
                      onClick={() => setActiveHistoryTab('bets')}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        activeHistoryTab === 'bets'
                          ? 'bg-red-500 text-white font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Bets History ({bets.length})
                    </button>
                    <button
                      onClick={() => setActiveHistoryTab('requests')}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        activeHistoryTab === 'requests'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Refill Requests ({requests.length})
                    </button>
                  </div>

                  {/* Transactions Feed */}
                  <div className="space-y-2">
                    {/* Coin Transactions List (All or Additions) */}
                    {(activeHistoryTab === 'all' || activeHistoryTab === 'additions') && (
                      <>
                        {(activeHistoryTab === 'additions' ? coinAdditions : transactions).map((tx) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <div
                              key={tx.id}
                              className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                                    isPositive
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-red-950/80 text-red-400 border border-red-500/40'
                                  }`}
                                >
                                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-white truncate">
                                    {tx.type === 'ADMIN_ALLOT'
                                      ? 'Admin Coin Allotment'
                                      : tx.type === 'REQUEST_APPROVED'
                                      ? 'Coin Request Approved'
                                      : tx.type === 'BET_WON'
                                      ? 'Casino Bet Payout'
                                      : 'Coin Transaction'}
                                  </div>
                                  <span className="text-[10px] text-neutral-400 truncate block">
                                    {tx.note || new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div
                                  className={`font-black text-sm ${
                                    isPositive ? 'text-emerald-400' : 'text-red-400'
                                  }`}
                                >
                                  {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} Coins
                                </div>
                                <span className="text-[10px] text-neutral-500 block">
                                  Bal: {tx.balanceAfter.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Bets History Tab */}
                    {activeHistoryTab === 'bets' && (
                      <>
                        {bets.length === 0 ? (
                          <div className="py-6 text-center text-xs text-neutral-500">
                            No casino bets recorded yet.
                          </div>
                        ) : (
                          bets.map((b) => (
                            <div
                              key={b.id}
                              className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                                    b.won
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  <Dices className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-white">
                                    {b.game} {b.won ? '🏆 WON' : 'LOST'}
                                  </div>
                                  <span className="text-[10px] text-neutral-400">
                                    {new Date(b.createdAt).toLocaleDateString()} • {new Date(b.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className={`font-black ${b.won ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                  {b.won ? `+${b.payout.toLocaleString()}` : `-${b.betAmount}`} Coins
                                </div>
                                <span className="text-[10px] text-neutral-500 block">
                                  Bal: {b.balanceAfter.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {/* Requests History Tab */}
                    {activeHistoryTab === 'requests' && (
                      <>
                        {requests.length === 0 ? (
                          <div className="py-6 text-center text-xs text-neutral-500">
                            No refill requests submitted yet.
                          </div>
                        ) : (
                          requests.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>Requested {r.requestedAmount.toLocaleString()} Coins</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                      r.status === 'APPROVED'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : r.status === 'PENDING'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString()}
                                </span>
                              </div>

                              {r.allocatedAmount && (
                                <div className="text-right">
                                  <span className="font-bold text-emerald-400">+{r.allocatedAmount.toLocaleString()}</span>
                                  <span className="text-[10px] text-neutral-500 block">Allotted</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {transactions.length === 0 && bets.length === 0 && (
                      <div className="py-8 text-center text-xs text-neutral-500">
                        No transactions recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: Sign Out Button */}
              <div className="pt-3 border-t border-white/10 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-950/60 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Player Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BottomTabBar;
