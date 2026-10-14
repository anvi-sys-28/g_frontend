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

  return (
    <div className="relative min-h-[100dvh] w-full flex items-end lg:items-center justify-center lg:justify-end overflow-hidden bg-black select-none">
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

      {/* Ambient Vignette Overlays: Subtle on mobile so luxury background artwork is clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/80 pointer-events-none hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none md:hidden" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Main Container: Mobile sits elegantly at the bottom leaving model visible, Desktop balanced */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-5 sm:pb-8 flex flex-col lg:flex-row items-center justify-end lg:justify-between gap-6 min-h-[100dvh]">
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

        {/* Right Side: Sleek, Compact Glassmorphism Login Interface */}
        <div className="w-full max-w-[330px] sm:max-w-[370px] lg:max-w-[410px] shrink-0 mb-1 sm:mb-0">
          <div className="relative rounded-2xl sm:rounded-3xl bg-black/65 sm:bg-neutral-950/75 border border-amber-500/30 backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-2xl shadow-black/90 ring-1 ring-amber-400/20">
            {/* Top Playin Exchange Logo (Compact) */}
            <PlayinExchangeLogo compact className="mb-1" />

            {/* Header Titles */}
            <div className="text-center my-2 sm:my-3">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Login to your account to continue
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center gap-2 text-[11px] text-red-200 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-2.5 sm:space-y-3">
              {/* Username / ID Field */}
              <div className="space-y-1">
                <label
                  htmlFor="login-username"
                  className="block text-[11px] sm:text-xs font-semibold text-neutral-300"
                >
                  Username / ID
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-neutral-400 pointer-events-none">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your ID"
                    required
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] sm:text-xs font-semibold text-neutral-300"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-neutral-400 pointer-events-none">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 accent-amber-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact Casino Admin to reset your password.')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Golden Gradient LOGIN Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1.5 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#AA771C] hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
