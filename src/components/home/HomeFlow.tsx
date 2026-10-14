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
  // Step 1: Always start with 'intro' by default (No loading screen, no spinner)
  const [currentStep, setCurrentStep] = useState<'intro' | 'login' | 'app'>('intro');

  useEffect(() => {
    try {
      // Check if user is actively in a session already (e.g. navigated back from /casino)
      const isSessionActive = sessionStorage.getItem('playin_session_active');
      const isAuth = localStorage.getItem('playin_auth');

      if (isSessionActive && isAuth) {
        setCurrentStep('app');
      } else {
        // Fresh visit: start directly with intro video
        setCurrentStep('intro');
      }
    } catch {
      setCurrentStep('intro');
    }

    const handleAuthChange = () => {
      try {
        const isAuth = localStorage.getItem('playin_auth');
        const isSessionActive = sessionStorage.getItem('playin_session_active');
        if (isAuth && isSessionActive) {
          setCurrentStep('app');
        } else if (!isAuth) {
          setCurrentStep('intro');
        }
      } catch {}
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('playin_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('playin_auth_changed', handleAuthChange);
    };
  }, []);

  // Step 1 -> Step 2: When 60 FPS Intro Finishes or is Skipped
  const handleIntroFinish = () => {
    try {
      sessionStorage.setItem('playin_intro_seen', 'true');
    } catch {}
    setCurrentStep('login');
  };

  // Step 2 -> Step 3: When Login Succeeds or Skip Login is Clicked
  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem('playin_session_active', 'true');
      localStorage.setItem('playin_auth', 'true');
      window.dispatchEvent(new Event('playin_auth_changed'));
    } catch {}
    setCurrentStep('app');
  };

  // Step 1: 60 FPS Canvas Intro Video Player
  if (currentStep === 'intro') {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <IntroVideoPlayer onFinish={handleIntroFinish} totalFrames={475} />
      </div>
    );
  }

  // Step 2: Login Interface with ID, Password, Player Demo Preset, and Skip Login
  if (currentStep === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
        <LoginPage />
      </div>
    );
  }

  // Step 3: Main Gaming Area (Cricket Live Scores with Device Backgrounds & Navigation Bar)
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

        {/* Atmospheric Dark Gradient Overlays - Softened so stadium background is clearly visible */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/25 pointer-events-none" />
      </div>

      <div className="relative z-10">
        <MatchListView initialMatches={initialMatches} meta={meta} isMock={isMock} />
      </div>
    </div>
  );
}
