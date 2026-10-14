'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayinExchangeLogo } from '@/components/brand/PlayinExchangeLogo';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your Username or ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/casino/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Store authentic credentials
      sessionStorage.setItem('playin_session_active', 'true');
      localStorage.setItem('playin_auth', 'true');
      localStorage.setItem('playin_user_id', data.user.userId);
      localStorage.setItem('playin_role', data.user.role);
      localStorage.setItem('playin_coins', String(data.user.coins));
      window.dispatchEvent(new Event('playin_auth_changed'));

      setIsLoading(false);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setErrorMessage('Network error connecting to database server.');
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (user = 'vip_player', pass = 'pass123') => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden bg-black select-none">
      {/* Mobile Background (< 768px): ml.webp */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ml.webp"
        alt="Playin Exchange Mobile Background"
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none md:hidden"
      />

      {/* Desktop Background (>= 768px): lb.webp */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lb.webp"
        alt="Playin Exchange Desktop Background"
        className="absolute inset-0 w-full h-full object-cover object-left md:object-center pointer-events-none hidden md:block"
      />

      {/* Dark Ambient Vignette Overlays for Maximum Contrast & Depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/80 pointer-events-none hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none md:hidden" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />

      {/* Main Container: Mobile centers/bottom, Desktop has graphic left + card right */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center justify-end lg:justify-between gap-8 min-h-screen">
        {/* Left Side: Spacious graphic area showing the seated model & gold coins */}
        <div className="hidden lg:flex flex-1 flex-col justify-end pb-12 pointer-events-none">
          {/* Subtle branding watermark on bottom-left */}
          <div className="space-y-1 drop-shadow-md">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400/80">
              Exclusive VIP Portal
            </span>
            <p className="text-sm font-semibold text-white/70 max-w-sm leading-relaxed">
              Experience the pinnacle of live sports cricket analytics and premier casino entertainment.
            </p>
          </div>
        </div>

        {/* Right Side: Exact Glassmorphism Login Interface */}
        <div className="w-full max-w-[480px] shrink-0">
          <div className="relative rounded-3xl bg-neutral-950/75 border border-amber-500/35 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-black/90 ring-1 ring-amber-400/20">
            {/* Top Playin Exchange Logo */}
            <PlayinExchangeLogo className="mb-2" />

            {/* Header Titles */}
            <div className="text-center my-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Login to your account to continue
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username / ID Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Username / ID
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your ID"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 accent-amber-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link has been dispatched to your registered recovery contact.')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Golden Gradient LOGIN Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#AA771C] hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>

              {/* Quick Fill Player Demo Helper Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('vip_player', 'pass123')}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-amber-300 bg-neutral-900/90 border border-amber-500/40 hover:bg-neutral-800 hover:border-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>🎰 Player Preset (Demo)</span>
                </button>
              </div>

              {/* Skip Login for Testing */}
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.setItem('playin_intro_seen', 'true');
                    sessionStorage.setItem('playin_session_active', 'true');
                    localStorage.setItem('playin_auth', 'true');
                    localStorage.setItem('playin_user_id', 'TEST_GUEST');
                    localStorage.setItem('playin_role', 'PLAYER');
                    localStorage.setItem('playin_coins', '10000');
                    window.dispatchEvent(new Event('playin_auth_changed'));
                  } catch (e) {}
                  router.push('/');
                }}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-200 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shadow-md"
              >
                <span>⚡ Skip Login (Instant Access) ➔</span>
              </button>
            </form>

            {/* Footer: Sign Up & Replay Intro */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <div>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleQuickDemo()}
                  className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors"
                >
                  Sign Up
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push('/intro')}
                className="text-neutral-400 hover:text-white transition-colors underline"
              >
                Replay Intro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
