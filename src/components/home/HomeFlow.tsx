'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types/models';
import { MatchesDataMeta } from '@/lib/matches';
import { MatchListView } from '@/components/cricket/MatchListView';
import { IntroVideoPlayer } from '@/components/intro/IntroVideoPlayer';
import LoginPage from '@/app/login/page';

interface HomeFlowProps {
  initialMatches: Match[];
  meta: MatchesDataMeta;
  isMock: boolean;
}

export function HomeFlow({ initialMatches, meta, isMock }: HomeFlowProps) {
  // 'checking' | 'intro' | 'login' | 'app'
  const [currentStep, setCurrentStep] = useState<'checking' | 'intro' | 'login' | 'app'>('checking');

  useEffect(() => {
    try {
      const isAuth = localStorage.getItem('playin_auth');
      const introSeen = sessionStorage.getItem('playin_intro_seen');

      if (isAuth) {
        setCurrentStep('app');
      } else if (introSeen) {
        setCurrentStep('login');
      } else {
        setCurrentStep('intro');
      }
    } catch {
      setCurrentStep('app');
    }

    const handleAuthChange = () => {
      try {
        const isAuth = localStorage.getItem('playin_auth');
        if (isAuth) setCurrentStep('app');
      } catch {}
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('playin_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('playin_auth_changed', handleAuthChange);
    };
  }, []);

  const handleIntroFinish = () => {
    try {
      sessionStorage.setItem('playin_intro_seen', 'true');
    } catch {}
    setCurrentStep('login');
  };

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem('playin_auth', 'true');
      window.dispatchEvent(new Event('playin_auth_changed'));
    } catch {}
    setCurrentStep('app');
  };

  // 1. Initial State / SSR Placeholder
  if (currentStep === 'checking') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-12 h-12 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  // 2. Step 1: 60 FPS Intro Video
  if (currentStep === 'intro') {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <IntroVideoPlayer onFinish={handleIntroFinish} totalFrames={475} />
      </div>
    );
  }

  // 3. Step 2: Login Interface
  if (currentStep === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
        <LoginPage />
      </div>
    );
  }

  // 4. Step 3: Main Cricket Dashboard with Device Backgrounds & Navigation
  return (
    <div className="relative min-h-screen">
      {/* Background Images: mbc.webp for mobile (< 768px), pbc.webp for desktop (>= 768px) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Mobile Cricket Background (< 768px): mbc.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mbc.webp"
          alt="Cricket Mobile Background"
          className="absolute inset-0 w-full h-full object-cover object-center md:hidden"
        />

        {/* Desktop / Computer Cricket Background (>= 768px): pbc.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pbc.webp"
          alt="Cricket Desktop Background"
          className="absolute inset-0 w-full h-full object-cover object-center hidden md:block"
        />

        {/* Atmospheric Dark Gradient Overlays for High Contrast & Readability */}
        <div className="absolute inset-0 bg-black/65 dark:bg-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/80 pointer-events-none" />
      </div>

      <div className="relative z-10">
        <MatchListView initialMatches={initialMatches} meta={meta} isMock={isMock} />
      </div>
    </div>
  );
}
