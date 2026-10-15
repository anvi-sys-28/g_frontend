'use client';

import React from 'react';
import { AccountModal } from './AccountModal';

interface AppShellProps {
  children: React.ReactNode;
  sideColumn?: React.ReactNode;
}

export function AppShell({ children, sideColumn }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center relative overflow-x-hidden font-sans">
      {/* Background Ambience on Desktop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-radial from-amber-950/15 via-[#080808] to-[#040404]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-950/10 rounded-full blur-3xl" />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:gap-8 p-0 sm:p-4">
        {/* MOBILE-FIRST PHONE CONTAINER (Max 430px) */}
        <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[890px] bg-[#0a0a0a] sm:rounded-[36px] sm:border sm:border-[#D4AF37]/40 sm:shadow-[0_0_55px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden relative">
          {/* Main Game Screen Content */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {children}
          </div>
        </div>

        {/* Optional Desktop Side Column (Probability Playground & Mathematics) */}
        {sideColumn && (
          <aside className="hidden lg:flex flex-col w-[390px] h-[890px] bg-[#0d0d0d] rounded-[36px] border border-[#D4AF37]/30 shadow-2xl p-5 justify-between overflow-hidden">
            {sideColumn}
          </aside>
        )}
      </div>

      {/* Shared Account & Achievements Modal */}
      <AccountModal />
    </div>
  );
}
