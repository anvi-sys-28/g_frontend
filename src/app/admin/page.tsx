'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Coins,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PlusCircle,
  Eye,
  EyeOff,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Dices,
  Shield,
  LogOut,
  Lock,
  KeyRound,
  Activity,
  Flame,
  Target,
} from 'lucide-react';

interface CasinoUserStat {
  id: string;
  userId: string;
  password?: string;
  role: string;
  coins: number;
  status: string;
  createdAt: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalPayout: number;
  netPnL: number;
  gamesBreakdown: {
    roulette: number;
    andarBahar: number;
  };
  pendingRequestsCount: number;
}

interface CoinRequestItem {
  id: string;
  userId: string;
  currentBalance: number;
  requestedAmount: number;
  allocatedAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface UserDetailHistory {
  user: CasinoUserStat;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    totalWagered: number;
    totalPayout: number;
    netPnL: number;
    rouletteCount: number;
    andarBaharCount: number;
  };
  bets: Array<{
    id: string;
    game: string;
    betAmount: number;
    payout: number;
    won: boolean;
    details: any;
    balanceAfter: number;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    note?: string;
    createdAt: string;
  }>;
  requests: Array<{
    id: string;
    requestedAmount: number;
    allocatedAmount?: number;
    status: string;
    reason?: string;
    createdAt: string;
  }>;
}

export default function CasinoAdminPage() {
  const router = useRouter();

  // Admin Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [adminLoginUser, setAdminLoginUser] = useState('admin');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'games'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [users, setUsers] = useState<CasinoUserStat[]>([]);
  const [requests, setRequests] = useState<CoinRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllotModal, setShowAllotModal] = useState<string | null>(null); // userId
  const [selectedUserHistory, setSelectedUserHistory] = useState<UserDetailHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form States
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserInitialCoins, setNewUserInitialCoins] = useState('1000');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const [allotAmount, setAllotAmount] = useState('1000');
  const [allotNote, setAllotNote] = useState('Admin allotment refill');
  const [actionLoading, setActionLoading] = useState(false);

  // Live Games Monitoring State
  const [liveGamesData, setLiveGamesData] = useState<any>(null);

  // Fetch Users & Requests
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [usersRes, requestsRes] = await Promise.all([
        fetch('/api/casino/admin/users'),
        fetch('/api/casino/admin/requests'),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }

      if (requestsRes.ok) {
        const rData = await requestsRes.json();
        setRequests(rData.requests || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch Live Casino Games State
  const fetchLiveGames = useCallback(async () => {
    try {
      const res = await fetch('/api/casino/admin/live-games');
      if (res.ok) {
        const data = await res.json();
        setLiveGamesData(data);
      }
    } catch {}
  }, []);

  // Poll live games continuously
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 1500);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, fetchLiveGames]);

  // Check admin session on mount
  useEffect(() => {
    try {
      const session = sessionStorage.getItem('playin_admin_session');
      if (session === 'true') {
        setIsAdminAuthenticated(true);
        fetchData();
      }
    } catch {}
    setIsCheckingSession(false);
  }, [fetchData]);

  // Periodic refresh when authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, fetchData]);

  // Admin Gate Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');

    const cleanUser = adminLoginUser.trim();
    const cleanPass = adminLoginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setAdminAuthError('Please enter both Admin ID and Password');
      return;
    }

    setAdminAuthLoading(true);
    try {
      // Direct fastify backend or local proxy auth
      const res = await fetch('/api/casino/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanUser, password: cleanPass }),
      });

      const data = await res.json();

      if (res.ok && (data.user?.role === 'ADMIN' || (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123'))) {
        sessionStorage.setItem('playin_admin_session', 'true');
        sessionStorage.setItem('playin_admin_user', cleanUser);
        setIsAdminAuthenticated(true);
        fetchData();
      } else if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123') {
        // Fallback authorization for master admin
        sessionStorage.setItem('playin_admin_session', 'true');
        sessionStorage.setItem('playin_admin_user', 'admin');
        setIsAdminAuthenticated(true);
        fetchData();
      } else {
        setAdminAuthError(data.error || 'Access Denied: Invalid Admin Credentials');
      }
    } catch {
      // In case backend is offline, verify against admin / admin123
      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123') {
        sessionStorage.setItem('playin_admin_session', 'true');
        sessionStorage.setItem('playin_admin_user', 'admin');
        setIsAdminAuthenticated(true);
        fetchData();
      } else {
        setAdminAuthError('Access Denied: Invalid Admin credentials');
      }
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('playin_admin_session');
      sessionStorage.removeItem('playin_admin_user');
      localStorage.removeItem('playin_role');
      localStorage.removeItem('playin_auth');
    } catch {}
    setIsAdminAuthenticated(false);
    setAdminLoginPassword('');
  };

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newUserId.trim()) {
      setCreateError('User ID cannot be empty');
      return;
    }
    if (!newUserPassword.trim()) {
      setCreateError('Password cannot be empty');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/casino/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUserId.trim(),
          password: newUserPassword.trim(),
          initialCoins: Number(newUserInitialCoins) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create user');
      } else {
        setCreateSuccess(`User "${newUserId}" created with ${newUserInitialCoins} coins!`);
        setNewUserId('');
        setNewUserPassword('');
        setNewUserInitialCoins('1000');
        fetchData();
        setTimeout(() => setShowCreateModal(false), 1200);
      }
    } catch {
      setCreateError('Network error creating user');
    } finally {
      setActionLoading(false);
    }
  };

  // Allot Coins Handler
  const handleAllotCoins = async (targetUserId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/casino/admin/allot-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          amount: Number(allotAmount) || 1000,
          note: allotNote,
        }),
      });

      if (res.ok) {
        setShowAllotModal(null);
        fetchData();
        if (selectedUserHistory && selectedUserHistory.user.userId === targetUserId) {
          viewUserHistory(targetUserId);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to allot coins');
      }
    } catch {
      alert('Network error allotting coins');
    } finally {
      setActionLoading(false);
    }
  };

  // Request Action (Approve / Reject)
  const handleRequestAction = async (requestId: string, action: 'APPROVE' | 'REJECT', amount?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/casino/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          amount,
        }),
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process request');
      }
    } catch {
      alert('Network error processing request');
    } finally {
      setActionLoading(false);
    }
  };

  // View User History
  const viewUserHistory = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/casino/admin/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Filtered Users
  const filteredUsers = users.filter((u) =>
    u.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall Stats
  const totalCoinsAllotted = users.reduce((acc, u) => acc + u.coins, 0);
  const totalGamesPlayed = users.reduce((acc, u) => acc + u.totalGames, 0);
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        {/* Glow */}
        <div className="fixed inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl bg-neutral-900/90 border border-amber-500/30 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-lg shadow-amber-500/20 mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Casino Master Admin
              </h1>
              <p className="text-xs text-neutral-400">
                Restricted portal. Enter administrator credentials to proceed.
              </p>
            </div>

            {/* Error banner */}
            {adminAuthError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adminAuthError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin User ID</span>
                </label>
                <input
                  type="text"
                  value={adminLoginUser}
                  onChange={(e) => setAdminLoginUser(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950/80 border border-white/10 focus:border-amber-400 focus:outline-none text-white text-sm placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Password</span>
                </label>
                <input
                  type="password"
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950/80 border border-white/10 focus:border-amber-400 focus:outline-none text-white text-sm placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-[0.99] text-black font-black text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adminAuthLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize Admin Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <Link
                href="/casino"
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Casino Lounge</span>
              </Link>
              <Link
                href="/"
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Live Scores</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-16">
      {/* Background Graphic Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Header & Quick Switch Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Casino Control & Admin Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                  PostgreSQL Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage casino user accounts, monitor gameplay win/loss records, and allot betting coins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={fetchData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-xs font-bold text-neutral-300 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/casino"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-400/30 transition-colors shadow-sm"
            >
              <Dices className="w-4 h-4" />
              <span>Launch Casino Lounge</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-xs font-bold text-neutral-300 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Live Scores</span>
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              title="Lock Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
              <span>Total Casino Users</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{users.length}</div>
            <div className="text-[11px] text-neutral-500">Active player accounts</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
              <span>Total Games Played</span>
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {totalGamesPlayed}
            </div>
            <div className="text-[11px] text-neutral-500">Roulette & Andar Bahar rounds</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
              <span>Active Coins in Play</span>
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-yellow-400">
              {totalCoinsAllotted.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500">Total player wallet coins</div>
          </div>

          <div
            onClick={() => setActiveTab('requests')}
            className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-amber-500/30 backdrop-blur-md space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
              <span>Pending Coin Requests</span>
              <div
                className={`w-2.5 h-2.5 rounded-full ${pendingRequestsCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {pendingRequestsCount}
            </div>
            <div className="text-[11px] text-amber-400/80 flex items-center gap-1 font-semibold">
              {pendingRequestsCount > 0 ? 'Action required: Review refills' : 'All requests processed'}
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900/70 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts & Gameplay</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-black">
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'requests'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900/70 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Coin Refill Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-black animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('games')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'games'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900/70 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Live Games Monitor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black animate-pulse">
                LIVE
              </span>
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search User ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 w-44"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#AA771C] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: USERS & GAMEPLAY RECORDS TABLE */}
        {activeTab === 'users' && (
          <div className="rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-neutral-900/90 text-neutral-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">User ID</th>
                    <th className="py-3.5 px-3">Password</th>
                    <th className="py-3.5 px-4">Coin Balance</th>
                    <th className="py-3.5 px-4">Games Played</th>
                    <th className="py-3.5 px-4">Won / Lost (Win Rate)</th>
                    <th className="py-3.5 px-4">Player Net PnL</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-neutral-500 text-sm">
                        No casino users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isRevealed = revealedPasswords[u.userId];
                      const isLowOnCoins = u.coins === 0;

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* User ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{u.userId}</span>
                              {u.role === 'ADMIN' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-400/30">
                                  ADMIN
                                </span>
                              )}
                              {u.pendingRequestsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 font-bold text-[10px] border border-red-500/30 animate-pulse">
                                  Coin Request
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-500">
                              Joined: {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Password */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-neutral-300">
                              <span>{isRevealed ? u.password : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => togglePasswordReveal(u.userId)}
                                className="text-neutral-500 hover:text-neutral-300 p-1 rounded"
                                title={isRevealed ? 'Hide Password' : 'Show Password'}
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Coins */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-sm font-black ${
                                  isLowOnCoins
                                    ? 'text-red-400'
                                    : 'text-amber-300 drop-shadow-sm'
                                }`}
                              >
                                {u.coins.toLocaleString()}
                              </span>
                              <Coins className="w-3.5 h-3.5 text-yellow-500" />
                            </div>
                            {isLowOnCoins && (
                              <span className="text-[10px] font-bold text-red-400/90">
                                Out of Coins
                              </span>
                            )}
                          </td>

                          {/* Games Played */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-200">
                              {u.totalGames} Rounds
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              R: {u.gamesBreakdown.roulette} | AB: {u.gamesBreakdown.andarBahar}
                            </div>
                          </td>

                          {/* Won / Lost */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">{u.wins}W</span>
                              <span className="text-neutral-600">/</span>
                              <span className="text-red-400 font-bold">{u.losses}L</span>
                              <span className="text-[11px] font-bold text-neutral-400">
                                ({u.winRate}%)
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${u.winRate}%` }}
                              />
                            </div>
                          </td>

                          {/* Player Net PnL */}
                          <td className="py-3.5 px-4">
                            <div
                              className={`flex items-center gap-1 font-bold ${
                                u.netPnL > 0
                                  ? 'text-emerald-400'
                                  : u.netPnL < 0
                                  ? 'text-red-400'
                                  : 'text-neutral-400'
                              }`}
                            >
                              {u.netPnL > 0 ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : u.netPnL < 0 ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : null}
                              <span>
                                {u.netPnL > 0 ? `+${u.netPnL.toLocaleString()}` : u.netPnL.toLocaleString()}{' '}
                                Coins
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              Wagered: {u.totalWagered.toLocaleString()}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAllotModal(u.userId);
                                  setAllotAmount('1000');
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-400/30 transition-colors shadow-sm"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Allot Coins</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => viewUserHistory(u.userId)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-white/10 transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Game Logs</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COIN REFILL REQUESTS */}
        {activeTab === 'requests' && (
          <div className="rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Player Coin Refill Requests</h2>
                <p className="text-xs text-neutral-400">
                  When players spend all their coins in Casino games, their requests appear here for Admin review and approval.
                </p>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-sm">
                No coin refill requests submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((r) => {
                  const isPending = r.status === 'PENDING';

                  return (
                    <div
                      key={r.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-neutral-900/90 border-amber-500/40 shadow-lg shadow-amber-500/10'
                          : 'bg-neutral-900/40 border-white/5 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white">{r.userId}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                r.status === 'PENDING'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : r.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400 font-medium">
                            Current Balance: {r.currentBalance} Coins
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-amber-400 flex items-center justify-end gap-1">
                            <span>+{r.requestedAmount.toLocaleString()}</span>
                            <Coins className="w-4 h-4 text-yellow-500" />
                          </div>
                          <span className="text-[10px] text-neutral-500">Requested Amount</span>
                        </div>
                      </div>

                      {r.reason && (
                        <div className="mt-3 p-3 rounded-xl bg-neutral-950/80 border border-white/5 text-xs text-neutral-300 italic">
                          &quot;{r.reason}&quot;
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(r.createdAt).toLocaleString()}
                        </span>

                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRequestAction(r.id, 'REJECT')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-xs border border-red-500/30 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestAction(r.id, 'APPROVE', r.requestedAmount)}
                              disabled={actionLoading}
                              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all shadow-md shadow-emerald-500/30 flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Allot</span>
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-neutral-400">
                            {r.status === 'APPROVED' ? `Allotted ${r.allocatedAmount || r.requestedAmount} coins` : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE CASINO GAMES MONITOR */}
        {activeTab === 'games' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Live Indicator Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    Universal Real-Time Games Feed
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                      20s Cycle Active
                    </span>
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Showing authentic active player wagers, online counts, and algorithmic least-chosen targets where results will fall.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono text-neutral-400">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Refresh: 1.5s</span>
              </div>
            </div>

            {/* TWO GAME MONITORS: ROULETTE & ANDAR BAHAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GAME 1: EUROPEAN ROULETTE MONITOR */}
              <div className="rounded-3xl bg-neutral-900/70 border border-amber-500/30 backdrop-blur-xl p-5 space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center font-black shadow-md">
                      <Dices className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Live European Roulette</h3>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>Round #{liveGamesData?.roulette?.roundId || 89615865}</span>
                        <span>•</span>
                        <span className="capitalize font-bold text-amber-300">
                          {liveGamesData?.roulette?.phase || 'betting'} phase
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {liveGamesData?.roulette?.onlineCount || 1} Online
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1">
                      {liveGamesData?.roulette?.timeRemaining?.toFixed(1) || '4.0'}s remaining
                    </span>
                  </div>
                </div>

                {/* HERO TARGET FALL NUMBER DISPLAY */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-black/80 to-amber-950/30 border-2 border-amber-500/60 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      Algorithm Target (Least Chosen Ball Pocket)
                    </span>
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                      House Margin Protected
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      {liveGamesData?.roulette?.targetWinningNumber !== undefined
                        ? liveGamesData.roulette.targetWinningNumber
                        : 2}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-black text-white block">
                        Ball Falling on Pocket #{liveGamesData?.roulette?.targetWinningNumber !== undefined ? liveGamesData.roulette.targetWinningNumber : 2}
                      </span>
                      <p className="text-[11px] text-neutral-300 leading-snug mt-0.5">
                        {liveGamesData?.roulette?.explanation || 'Calculated deterministically from active real player wagers.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CURRENT ROUND WAGERS TABLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">Active Bets Placed in Round:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      Total Wager: {liveGamesData?.roulette?.totalCurrentWager || 0} Coins
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/50 overflow-hidden">
                    {liveGamesData?.roulette?.currentRoundBets && liveGamesData.roulette.currentRoundBets.length > 0 ? (
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-semibold">
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-3">Numbers Bet</th>
                            <th className="py-2 px-3 text-right">Coins</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {liveGamesData.roulette.currentRoundBets.map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="py-2 px-3 font-bold text-white">{b.playerName}</td>
                              <td className="py-2 px-3 font-mono text-amber-300">{b.label}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-white">
                                {b.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500 italic">
                        No player bets placed yet in current round. Waiting for player coins...
                      </div>
                    )}
                  </div>
                </div>

                {/* GAME AGGREGATE STATS */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Total Rounds</span>
                    <span className="font-mono font-black text-sm text-white">
                      {liveGamesData?.roulette?.stats?.totalGames || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Total Wagered</span>
                    <span className="font-mono font-black text-sm text-amber-300">
                      {liveGamesData?.roulette?.stats?.totalWagered || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">House Margin</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      +{liveGamesData?.roulette?.stats?.houseProfit || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* GAME 2: ANDAR BAHAR MONITOR */}
              <div className="rounded-3xl bg-neutral-900/70 border border-amber-500/30 backdrop-blur-xl p-5 space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black shadow-md">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Live Andar Bahar</h3>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>Round #{liveGamesData?.andarBahar?.roundId || 89615865}</span>
                        <span>•</span>
                        <span className="capitalize font-bold text-amber-300">
                          {liveGamesData?.andarBahar?.phase || 'betting'} phase
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {liveGamesData?.andarBahar?.onlineCount || 1} Online
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1">
                      {liveGamesData?.andarBahar?.timeRemaining?.toFixed(1) || '4.0'}s remaining
                    </span>
                  </div>
                </div>

                {/* HERO TARGET WINNING SIDE DISPLAY */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-black/80 to-amber-950/30 border-2 border-red-500/60 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-red-400" />
                      Algorithm Target (Least Chosen Side)
                    </span>
                    <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-bold">
                      House Margin Protected
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-red-500/30 uppercase">
                      {liveGamesData?.andarBahar?.targetWinningSide || 'BAHAR'}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-black text-white block">
                        Matching Card Lands on {liveGamesData?.andarBahar?.targetWinningSide || 'BAHAR'}
                      </span>
                      <p className="text-[11px] text-neutral-300 leading-snug mt-0.5">
                        {liveGamesData?.andarBahar?.explanation || 'Target side calculated automatically to protect house profit.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ANDAR VS BAHAR REAL WAGERS BAR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">Live Pool Distribution:</span>
                    <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
                      <span className="text-red-400">ANDAR: {liveGamesData?.andarBahar?.andarTotalWager || 0}</span>
                      <span className="text-blue-400">BAHAR: {liveGamesData?.andarBahar?.baharTotalWager || 0}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/50 overflow-hidden">
                    {liveGamesData?.andarBahar?.currentRoundBets && liveGamesData.andarBahar.currentRoundBets.length > 0 ? (
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-semibold">
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-3">Chosen Side</th>
                            <th className="py-2 px-3 text-right">Coins</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {liveGamesData.andarBahar.currentRoundBets.map((b: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="py-2 px-3 font-bold text-white">{b.playerName}</td>
                              <td className="py-2 px-3 font-mono font-bold text-amber-300">{b.side}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-white">
                                {b.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500 italic">
                        No player bets placed yet in current round. Waiting for player wagers...
                      </div>
                    )}
                  </div>
                </div>

                {/* GAME AGGREGATE STATS */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Total Rounds</span>
                    <span className="font-mono font-black text-sm text-white">
                      {liveGamesData?.andarBahar?.stats?.totalGames || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Total Wagered</span>
                    <span className="font-mono font-black text-sm text-amber-300">
                      {liveGamesData?.andarBahar?.stats?.totalWagered || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block font-bold">House Margin</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      +{liveGamesData?.andarBahar?.stats?.houseProfit || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE USER MODAL */}
        {showCreateModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-amber-500/40 p-6 space-y-4 shadow-2xl shadow-black ring-1 ring-amber-400/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-black text-white">Create New Casino User</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  {createSuccess}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    User ID (Username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rohit_vip, player_77"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Set User Password
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass123"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Initial Coins Allotment
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['500', '1000', '2500', '5000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewUserInitialCoins(preset)}
                        className={`py-1.5 rounded-lg font-bold border transition-colors ${
                          newUserInitialCoins === preset
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
                    min="0"
                    placeholder="Custom coin amount"
                    value={newUserInitialCoins}
                    onChange={(e) => setNewUserInitialCoins(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/25"
                  >
                    {actionLoading ? 'Creating...' : 'Create User & Allot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ALLOT COINS MODAL */}
        {showAllotModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-amber-500/40 p-6 space-y-4 shadow-2xl shadow-black">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Allot Coins</h2>
                    <p className="text-[11px] text-neutral-400">
                      User: <span className="text-amber-400 font-bold">{showAllotModal}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllotModal(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Select Coin Preset
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['500', '1000', '2500', '5000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAllotAmount(preset)}
                        className={`py-2 rounded-xl font-bold border transition-colors ${
                          allotAmount === preset
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
                    min="1"
                    placeholder="Enter custom coin amount"
                    value={allotAmount}
                    onChange={(e) => setAllotAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    Transaction Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={allotNote}
                    onChange={(e) => setAllotNote(e.target.value)}
                    placeholder="e.g. VIP Refill, User request approved"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllotModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAllotCoins(showAllotModal)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Confirm Allotment (+{allotAmount})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: DETAILED USER GAMEPLAY HISTORY DRAWER */}
        {selectedUserHistory && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative w-full max-w-2xl h-full bg-neutral-900 border-l border-white/10 p-6 space-y-5 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Player Gameplay Logs: {selectedUserHistory.user.userId}
                    </h2>
                    <span className="text-xs text-neutral-400">
                      Balance: {selectedUserHistory.user.coins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserHistory(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Player Summary Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 text-center">
                  <span className="text-[10px] text-neutral-400 font-semibold block">Total Bets</span>
                  <span className="text-lg font-black text-white">
                    {selectedUserHistory.stats.totalGames}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 text-center">
                  <span className="text-[10px] text-neutral-400 font-semibold block">Wins / Losses</span>
                  <span className="text-lg font-black text-emerald-400">
                    {selectedUserHistory.stats.wins}W{' '}
                    <span className="text-red-400">{selectedUserHistory.stats.losses}L</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 text-center">
                  <span className="text-[10px] text-neutral-400 font-semibold block">Net PnL</span>
                  <span
                    className={`text-lg font-black ${
                      selectedUserHistory.stats.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {selectedUserHistory.stats.netPnL.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Chronological Bets List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Game Rounds History ({selectedUserHistory.bets.length})
                </h3>

                {selectedUserHistory.bets.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">
                    User has not played any casino rounds yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserHistory.bets.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-neutral-950 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{b.game}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold text-[10px] uppercase ${
                                b.won
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {b.won ? 'WON' : 'LOST'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 block">
                            {new Date(b.createdAt).toLocaleString()}
                          </span>
                          {b.details && (
                            <span className="text-[11px] text-neutral-400 block font-mono">
                              Outcome:{' '}
                              {b.details.winningNumber !== undefined
                                ? `Num: ${b.details.winningNumber} (${b.details.winningColor})`
                                : b.details.winningSide
                                ? `Joker: ${b.details.jokerCard} | Won: ${b.details.winningSide}`
                                : JSON.stringify(b.details)}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-neutral-400 block">
                            Bet: {b.betAmount} Coins
                          </span>
                          <span
                            className={`font-black text-sm block ${
                              b.won ? 'text-emerald-400' : 'text-neutral-500'
                            }`}
                          >
                            {b.won ? `+${b.payout} Won` : '0 Coins'}
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            After: {b.balanceAfter}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coin Allotment / Transaction Audit Trail */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Coin Transactions & Allotments ({selectedUserHistory.transactions.length})
                </h3>
                <div className="space-y-1.5">
                  {selectedUserHistory.transactions.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-neutral-950/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-neutral-300">{t.type}</span>
                        {t.note && <span className="text-neutral-500 block text-[11px]">{t.note}</span>}
                      </div>
                      <div className="text-right font-mono font-bold">
                        <span className={t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">Bal: {t.balanceAfter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
