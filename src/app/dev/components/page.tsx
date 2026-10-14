'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { FlagIcon } from '@/components/cricket/FlagIcon';
import { FormChips } from '@/components/cricket/FormChips';
import { TabStrip, TabItem } from '@/components/ui/TabStrip';
import { SearchPill } from '@/components/ui/SearchPill';
import { Skeleton, MatchCardSkeleton, NewsItemSkeleton } from '@/components/ui/Skeleton';
import { Moon, Sun, Monitor, Smartphone, Tablet } from 'lucide-react';
import Link from 'next/link';

export default function DevComponentsPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeSurfaceTab, setActiveSurfaceTab] = useState('top');
  const [activeHeaderTab, setActiveHeaderTab] = useState('info');

  const surfaceTabs: TabItem[] = [
    { id: 'top', label: 'Top Matches' },
    { id: 'live', label: 'Live', badge: 6 },
    { id: 'ind-wi', label: 'WI vs IND 2026', badge: 2 },
    { id: 'sl-pak', label: 'SL vs PAK 2026', badge: 1 },
    { id: 'aus-sa', label: 'AUS vs SA 2026', badge: 1 },
  ];

  const headerTabs: TabItem[] = [
    { id: 'info', label: 'Match info' },
    { id: 'live', label: 'Live' },
    { id: 'discussions', label: 'Discussions' },
    { id: 'stats', label: 'Series Stats' },
    { id: 'news', label: 'News' },
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-surface text-surface-text transition-colors pb-24">
        {/* Dev Toolbar */}
        <div className="sticky top-0 z-30 bg-surface-muted border-b border-surface-border px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-600 text-white font-mono text-xs font-bold">
              DEV MODE
            </span>
            <h1 className="text-sm font-bold">Component Design System Explorer</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport indicators */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-surface-muted-text border border-surface-border rounded-lg p-1 bg-surface">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-muted">
                <Smartphone className="w-3.5 h-3.5 text-brand-600" /> 360px
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded">
                <Tablet className="w-3.5 h-3.5 text-brand-600" /> 768px
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded">
                <Monitor className="w-3.5 h-3.5 text-brand-600" /> 1280px
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-xs font-medium hover:bg-surface-muted transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-12">
          {/* Section 1: Brand & Logo */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">1. Brand Logo & Variants</h2>
              <p className="text-xs text-surface-muted-text">Original SVG wordmark in white and brand red variants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-card bg-brand-600 text-white flex flex-col items-center justify-center gap-3">
                <span className="text-xs font-medium text-white/70">On Brand Red Header (White Variant)</span>
                <Logo variant="white" size="lg" />
              </div>

              <div className="p-6 rounded-card border border-surface-border bg-surface flex flex-col items-center justify-center gap-3 shadow-card">
                <span className="text-xs font-medium text-surface-muted-text">On White / Dark Surface (Brand Variant)</span>
                <Logo variant="brand" size="lg" />
              </div>
            </div>
          </section>

          {/* Section 2: Flag Icons */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">2. Cricket Flag Icons</h2>
              <p className="text-xs text-surface-muted-text">SVG national team emblems with rounded circular framing</p>
            </div>

            <div className="p-6 rounded-card border border-surface-border bg-surface flex flex-wrap items-center gap-6 shadow-card">
              {[
                { code: 'IND', name: 'India' },
                { code: 'WI', name: 'West Indies' },
                { code: 'PAK', name: 'Pakistan' },
                { code: 'SL', name: 'Sri Lanka' },
                { code: 'AUS', name: 'Australia' },
                { code: 'SA', name: 'South Africa' },
                { code: 'ENG', name: 'England' },
                { code: 'NZ', name: 'New Zealand' },
                { code: 'BAN', name: 'Bangladesh' },
                { code: 'AFG', name: 'Afghanistan' },
                { code: 'SCO', name: 'Scotland (Fallback)' },
              ].map((team) => (
                <div key={team.code} className="flex flex-col items-center gap-1.5">
                  <FlagIcon code={team.code} name={team.name} size="lg" />
                  <span className="text-xs font-bold text-surface-text">{team.code}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: TabStrips */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">3. TabStrip Component (Surface & Header Band)</h2>
              <p className="text-xs text-surface-muted-text">
                Surface: 2px brand red underline with text-brand-600. Header: 3px white underline on brand red.
              </p>
            </div>

            {/* Surface Variant */}
            <div className="p-4 rounded-card border border-surface-border bg-surface shadow-card space-y-3">
              <span className="text-xs font-bold text-surface-muted-text uppercase tracking-wider">Surface Variant (Home Page)</span>
              <TabStrip
                tabs={surfaceTabs}
                activeId={activeSurfaceTab}
                onChange={setActiveSurfaceTab}
                variant="surface"
                rightAction={
                  <Link href="/fixtures" className="text-brand-600 hover:text-brand-700 font-bold text-xs flex items-center gap-1">
                    Cricket Schedule &gt;
                  </Link>
                }
              />
            </div>

            {/* Header Variant */}
            <div className="rounded-card overflow-hidden shadow-card">
              <div className="bg-brand-600 p-4 pb-0 text-white">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider block mb-2">
                  Header Band Variant (Match Center)
                </span>
                <TabStrip
                  tabs={headerTabs}
                  activeId={activeHeaderTab}
                  onChange={setActiveHeaderTab}
                  variant="header"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Form Chips */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">4. Form Chips (WCAG Compliant)</h2>
              <p className="text-xs text-surface-muted-text">
                W: Green (#15803D), L: Dark Slate (#374151 - NEVER red), NR: Grey (#9CA3AF)
              </p>
            </div>

            <div className="p-6 rounded-card border border-surface-border bg-surface shadow-card space-y-4">
              <div className="flex items-center gap-4">
                <FlagIcon code="IND" size="md" />
                <span className="font-bold text-sm w-12">IND</span>
                <FormChips results={['W', 'L', 'W', 'W', 'W']} />
                <span className="text-xs text-surface-muted-text">4 Wins, 1 Loss</span>
              </div>

              <div className="flex items-center gap-4">
                <FlagIcon code="WI" size="md" />
                <span className="font-bold text-sm w-12">WI</span>
                <FormChips results={['L', 'W', 'L', 'W', 'L']} />
                <span className="text-xs text-surface-muted-text">2 Wins, 3 Losses</span>
              </div>
            </div>
          </section>

          {/* Section 5: Search Pill & Command Palette */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">5. Search Pill & Command Palette</h2>
              <p className="text-xs text-surface-muted-text">Interactive search trigger with modal and Cmd+K support</p>
            </div>

            <div className="p-6 rounded-card border border-surface-border bg-surface shadow-card flex flex-wrap items-center gap-6">
              <div className="bg-brand-600 p-4 rounded-xl flex items-center gap-3">
                <span className="text-xs text-white/80 font-medium">Header Variant:</span>
                <SearchPill variant="nav" />
              </div>

              <div className="bg-surface-muted p-4 rounded-xl flex items-center gap-3 border border-surface-border">
                <span className="text-xs text-surface-muted-text font-medium">Mobile Variant:</span>
                <SearchPill variant="mobile" />
              </div>
            </div>
          </section>

          {/* Section 6: Skeletons */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-2">
              <h2 className="text-lg font-bold text-surface-text">6. Skeleton Loading States (CLS &lt; 0.05)</h2>
              <p className="text-xs text-surface-muted-text">Shimmer using --bg-muted with exact card dimensions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-semibold text-surface-muted-text block mb-2">MatchCard Skeleton</span>
                <MatchCardSkeleton variant="carousel" />
              </div>

              <div className="md:col-span-2">
                <span className="text-xs font-semibold text-surface-muted-text block mb-2">NewsItem Skeleton</span>
                <div className="p-4 rounded-card border border-surface-border bg-surface shadow-card">
                  <NewsItemSkeleton />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
