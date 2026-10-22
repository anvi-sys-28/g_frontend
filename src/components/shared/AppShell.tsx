'use client';

import React from 'react';
import { AccountModal } from './AccountModal';
import { RequestCoinsModal } from './RequestCoinsModal';

interface AppShellProps {
  children: React.ReactNode;
  sideColumn?: React.ReactNode;
}

export function AppShell({ children, sideColumn }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white flex items-center justify-center relative overflow-x-hidden font-sans">
      {/* 100% Fixed Motionless Background Layer for Roulette and Andar Bahar Games */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#0B0C0E]"
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
        }}
      >
        {/* Mobile Game Background (< 768px): gm.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gm.webp"
          alt="Game Mobile Background"
          width={900}
          height={1600}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center md:hidden pointer-events-none select-none"
        />

        {/* Desktop / Computer Game Background (>= 768px): gp.webp */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gp.webp"
          alt="Game Desktop Background"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center hidden md:block pointer-events-none select-none"
        />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:gap-8 p-0 sm:p-4">
        {/* MOBILE-FIRST PHONE CONTAINER (Max 430px) */}
        <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[890px] bg-transparent sm:bg-black/30 sm:backdrop-blur-sm sm:rounded-[36px] sm:border sm:border-[#D4AF37]/40 sm:shadow-[0_0_55px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden relative">
          {/* Main Game Screen Content */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {children}
          </div>
        </div>

        {/* Optional Desktop Side Column (Probability Playground & Mathematics) */}
        {sideColumn && (
          <aside className="hidden lg:flex flex-col w-[390px] h-[890px] bg-[#0d0d0d]/85 backdrop-blur-md rounded-[36px] border border-[#D4AF37]/30 shadow-2xl p-5 justify-between overflow-hidden">
            {sideColumn}
          </aside>
        )}
      </div>

      {/* Shared Account & Achievements Modal */}
      <AccountModal />

      {/* Request Coins from Admin Modal */}
      <RequestCoinsModal />
    </div>
  );
}
