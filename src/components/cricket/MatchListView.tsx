'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types/models';
import { MatchCard } from './MatchCard';
import { formatTimeAgo } from '@/lib/format-date';
import { MatchesDataMeta } from '@/lib/matches';
import { StarBorder } from '@/components/ui/StarBorder';
import { Logo } from '@/components/brand/Logo';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  AlertTriangle,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface MatchListViewProps {
  initialMatches: Match[];
  meta: MatchesDataMeta;
  isMock: boolean;
}

export function MatchListView({ initialMatches, meta, isMock }: MatchListViewProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [currentMeta, setCurrentMeta] = useState<MatchesDataMeta>(meta);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('top');
  const [collapsedSeries, setCollapsedSeries] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerSlide, setBannerSlide] = useState<number>(0);

  // Manual "GET DATA" button handler: fetches real-time API data on-demand without wasting background quota
  const handleGetData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
      setRefreshToast(null);
    }
    try {
      const res = await fetch('/api/matches/today?refresh=true', {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.matches)) {
          setMatches(json.matches);
        }
        if (json.meta) {
          setCurrentMeta(json.meta);
        }
        if (isManual) {
          setRefreshToast('Live matches updated');
          setTimeout(() => setRefreshToast(null), 3000);
        }
      } else if (isManual) {
        setRefreshToast('Showing latest cached matches');
        setTimeout(() => setRefreshToast(null), 3000);
      }
    } catch {
      if (isManual) {
        setRefreshToast('Network error, showing offline data');
        setTimeout(() => setRefreshToast(null), 3000);
      }
    } finally {
      if (isManual) {
        setIsRefreshing(false);
      }
    }
  };

  // Auto-fetch fresh live data on mount ONLY if initial render had no matches
  useEffect(() => {
    if (matches.length === 0) {
      handleGetData(false);
    }
  }, []);

  // Periodic background refresh for live scores (every 30 seconds when tab is active)
  useEffect(() => {
    const liveInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        handleGetData(false);
      }
    }, 30000);
    return () => clearInterval(liveInterval);
  }, []);

  // Categorize matches
  const liveMatches = useMemo(() => matches.filter((m) => m.status === 'live'), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => m.status === 'upcoming'), [matches]);
  const finishedMatches = useMemo(
    () => matches.filter((m) => m.status === 'completed' || m.status === 'abandoned'),
    [matches]
  );

  // Filter matches based on search query
  const searchedMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.toLowerCase();
    return matches.filter(
      (m) =>
        m.teamA.name.toLowerCase().includes(q) ||
        m.teamA.code.toLowerCase().includes(q) ||
        m.teamB.name.toLowerCase().includes(q) ||
        m.teamB.code.toLowerCase().includes(q) ||
        (m.seriesName && m.seriesName.toLowerCase().includes(q)) ||
        (m.venue && m.venue.toLowerCase().includes(q))
    );
  }, [matches, searchQuery]);

  // Carousel ref and auto-scroll logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pauseTemporarily = (durationMs = 4000) => {
    setIsCarouselPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsCarouselPaused(false);
    }, durationMs);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    pauseTemporarily(4000);
    if (carouselRef.current) {
      const firstCard = carouselRef.current.firstElementChild as HTMLElement | null;
      const cardStep = firstCard ? firstCard.offsetWidth + 16 : 306;
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;

      if (direction === 'right') {
        if (carouselRef.current.scrollLeft >= maxScroll - 15) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: cardStep, behavior: 'smooth' });
        }
      } else {
        if (carouselRef.current.scrollLeft <= 15) {
          carouselRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: -cardStep, behavior: 'smooth' });
        }
      }
    }
  };

  // Carousel matches: Live first, then upcoming, then finished
  const carouselMatches = useMemo(() => {
    const list: Match[] = [...liveMatches];
    const sortedUpcoming = [...upcomingMatches].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    for (const m of sortedUpcoming) {
      if (!list.find((x) => x.id === m.id)) list.push(m);
    }
    const sortedFinished = [...finishedMatches].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    for (const m of sortedFinished) {
      if (!list.find((x) => x.id === m.id)) list.push(m);
    }
    return list;
  }, [liveMatches, upcomingMatches, finishedMatches]);

  // Auto-shift Top Matches cards every 2 seconds
  useEffect(() => {
    if (isCarouselPaused || carouselMatches.length <= 1) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const el = carouselRef.current;
      if (!el) return;

      const firstCard = el.firstElementChild as HTMLElement | null;
      const cardStep = firstCard ? firstCard.offsetWidth + 16 : 306;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isCarouselPaused, carouselMatches.length]);

  // Auto-cycle promotional hero banner every 5 seconds (paused when tab hidden)
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setBannerSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

  // Listen for tab switch events from BottomTabBar (e.g. In-Play)
  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('switch_cricket_tab', handleTabSwitch);
    return () => window.removeEventListener('switch_cricket_tab', handleTabSwitch);
  }, []);

  // Filter matches based on active tab
  const displayedMatches = useMemo(() => {
    let list = searchedMatches;
    if (activeTab === 'live') {
      list = searchedMatches.filter((m) => m.status === 'live');
    } else if (activeTab === 'upcoming') {
      list = searchedMatches.filter((m) => m.status === 'upcoming');
    } else if (activeTab === 'finished') {
      list = searchedMatches.filter((m) => m.status === 'completed' || m.status === 'abandoned');
    }
    return list;
  }, [activeTab, searchedMatches]);

  // Group displayed matches by series for accordion view
  const displayedSeriesGroups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of displayedMatches) {
      const sName = m.seriesName || 'Other Matches';
      if (!map.has(sName)) {
        map.set(sName, []);
      }
      map.get(sName)!.push(m);
    }
    return Array.from(map.entries()).map(([name, matches]) => ({
      name,
      matches,
    }));
  }, [displayedMatches]);

  const toggleSeriesCollapse = (seriesName: string) => {
    setCollapsedSeries((prev) => ({
      ...prev,
      [seriesName]: !prev[seriesName],
    }));
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

  // Estimated hours to next upcoming match
  const nextUpcomingHours = useMemo(() => {
    if (upcomingMatches.length === 0) return 4;
    const now = Date.now();
    const sorted = [...upcomingMatches].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    const nextStart = new Date(sorted[0].startTime).getTime();
    return Math.max(1, Math.round((nextStart - now) / (1000 * 3600)));
  }, [upcomingMatches]);

  const isDataOld = currentMeta.isBudgetExhausted;

  const heroBanners = [
    {
      image: '/hero-banner.webp',
      tag: 'LIVE',
      title: 'CRICKET',
      subtitle: 'REAL ACTION. REAL ODDS.',
    },
    {
      image: '/mb2.webp',
      tag: 'FAST ODDS',
      title: 'IN-PLAY',
      subtitle: 'BALL-BY-BALL MATCH TELEMETRY',
    },
    {
      image: '/mb3.webp',
      tag: 'SERIES',
      title: 'WORLD CUP',
      subtitle: 'STANDINGS & TOURNAMENT STATS',
    },
  ];

  return (
    <div className="w-full text-white">
      {/* 1. TOP HEADER BAR: Golden Spade Emblem + LiveCricket | Search Pill | GET DATA Button | Logout Icon */}
      <header className="sticky top-0 z-30 bg-[#0c0d12] border-b border-amber-500/20 px-3 sm:px-6 py-2.5 transition-all shadow-md">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Golden Spade Logo + LiveCricket */}
          <Link href="/" className="shrink-0 flex items-center">
            <Logo variant="gold-spade" size="md" />
          </Link>

          {/* Center: Search pill */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/80 transition-all shadow-inner"
            />
          </div>

          {/* Action: "GET DATA" button to fetch live API data on demand without wasting quota */}
          <button
            onClick={() => handleGetData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-black text-xs uppercase tracking-wider hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)] shrink-0 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'FETCHING...' : 'GET DATA'}</span>
            <span className="sm:hidden">{isRefreshing ? '...' : 'GET DATA'}</span>
          </button>

          {/* Right: Gold-bordered Logout / Exit Icon Button */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-2 rounded-xl border border-amber-500/60 bg-neutral-950/80 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all shadow-xs flex items-center justify-center shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Real-time Data Toast Notification */}
      {refreshToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-black shadow-xl flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* Notice displayed when API key quota is exhausted across all three keys */}
      {(currentMeta.isAllKeysExhausted || currentMeta.lastError?.includes('out of limit') || (isDataOld && !isMock)) && (
        <div className="bg-amber-950/90 border-b border-amber-500/50 text-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>out of limit for today</span>
        </div>
      )}

      {/* 2. SUB-HEADER TABS ROW: Top Matches | Live 1 | Upcoming 0 | ⭐ Favourites | 📅 Schedule > */}
      <div className="sticky top-[53px] z-20 bg-[#0e0f14] border-b border-amber-500/15 shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs font-semibold py-2">
          <div className="flex items-center gap-5 sm:gap-6 shrink-0">
            {/* Top Matches Tab */}
            <button
              onClick={() => setActiveTab('top')}
              className={`relative py-1 transition-colors whitespace-nowrap ${
                activeTab === 'top'
                  ? 'text-amber-300 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }`}
            >
              Top Matches
              {activeTab === 'top' && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>

            {/* Live Tab with solid Red Pill Badge */}
            <button
              onClick={() => setActiveTab('live')}
              className={`relative py-1 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'live'
                  ? 'text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }`}
            >
              <span>Live</span>
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wide shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                {liveMatches.length}
              </span>
              {activeTab === 'live' && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </button>

            {/* Upcoming Tab with Dark Badge */}
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`relative py-1 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'text-amber-300 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[10px]">
                {upcomingMatches.length}
              </span>
              {activeTab === 'upcoming' && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>

            {/* Favourites Tab */}
            <button
              onClick={() => setActiveTab('top')}
              className="py-1 flex items-center gap-1 text-neutral-400 hover:text-amber-300 transition-colors whitespace-nowrap font-medium"
            >
              <span>⭐</span>
              <span>Favourites</span>
            </button>
          </div>

          {/* Right Action: Schedule > */}
          <Link
            href="/fixtures"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold text-xs shrink-0 whitespace-nowrap py-1 transition-colors"
          >
            <span>📅</span>
            <span>Schedule &gt;</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* 3. HERO PROMOTIONAL BANNER CAROUSEL: High action cricketer, sparks, metallic CRICKET, • • • */}
        <section className="relative w-full rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-950 shadow-2xl">
          <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden">
            {/* Banner Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroBanners[bannerSlide].image}
              alt="Live Cricket Promotion"
              width={1100}
              height={240}
              fetchPriority={bannerSlide === 0 ? 'high' : 'auto'}
              loading={bannerSlide === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out scale-100 hover:scale-105"
            />

            {/* Atmospheric Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Banner Text Content */}
            <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-center items-start z-10 space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                {heroBanners[bannerSlide].tag}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-wider bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
                {heroBanners[bannerSlide].title}
              </h1>
              <p className="text-[11px] sm:text-xs font-extrabold tracking-widest text-neutral-300 uppercase drop-shadow-md">
                {heroBanners[bannerSlide].subtitle}
              </p>
            </div>

            {/* 3 Carousel Indicator Dots: • • • */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {heroBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setBannerSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    bannerSlide === idx
                      ? 'w-6 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'w-2 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. TOP MATCHES SECTION: Top Matches • 1 Live | < > arrows | Live cards with Red StarBorder, others with Gold StarBorder */}
        {(activeTab === 'top' || activeTab === 'live') && carouselMatches.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white">Top Matches</h2>
                {liveMatches.length > 0 ? (
                  <div className="px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/70 text-red-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.35)]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>{liveMatches.length} Live</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/80 text-neutral-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    <span>0 Live</span>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel('left')}
                  aria-label="Scroll left"
                  className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  aria-label="Scroll right"
                  className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel (Red StarBorder for Live, Gold StarBorder for others) */}
            <div
              ref={carouselRef}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
              onTouchStart={() => setIsCarouselPaused(true)}
              onTouchEnd={() => pauseTemporarily(2000)}
              className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 md:mx-0 md:px-0"
            >
              {carouselMatches.map((m) => (
                <MatchCard key={m.id} match={m} variant="carousel" />
              ))}
            </div>
          </section>
        )}

        {/* Empty State for Live Tab */}
        {activeTab === 'live' && liveMatches.length === 0 && (
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-neutral-950/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-2xl">
              🏏
            </div>
            <h3 className="text-base font-bold text-white">No matches currently live</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              There are no matches in progress worldwide right now. Next match starts in approximately{' '}
              <span className="font-semibold text-amber-400">{nextUpcomingHours} hours</span>.
            </p>
            <button
              onClick={() => setActiveTab('upcoming')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-yellow-400 transition-all shadow-md"
            >
              View Upcoming Matches
            </button>
          </div>
        )}

        {/* 5. ALL MATCHES & SERIES SECTION: Gold StarBorder Accordions with 🏆 Icon & Chevrons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white">
              {activeTab === 'live'
                ? `Live Matches (${liveMatches.length})`
                : activeTab === 'upcoming'
                ? `Upcoming Fixtures (${upcomingMatches.length})`
                : activeTab === 'finished'
                ? `Finished Results (${finishedMatches.length})`
                : 'All Matches & Series'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
              <span>Showing {displayedMatches.length} matches</span>
              <button
                aria-label="Filter matches"
                className="w-7 h-7 rounded-full border border-neutral-700/80 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {displayedSeriesGroups.map((group, groupIndex) => {
              const isCollapsed = collapsedSeries[group.name] ?? false;
              const hasGroupLive = group.matches.some((m) => m.status === 'live');
              const seriesVisual = ['/mb3.webp', '/mb2.webp', '/mb1.webp'][groupIndex % 3];

              return (
                <StarBorder
                  key={group.name}
                  as="div"
                  color="#D4AF37"
                  trailColor="#FFDF73"
                  duration={4}
                  thickness={1.4}
                  radius={18}
                  glow={0.65}
                  sparkle={true}
                  className="w-full flex-col rounded-2xl overflow-hidden bg-neutral-950/90 shadow-xl relative"
                >
                  {/* Background Stadium Image (mb3.webp, mb2.webp, mb1.webp) on the Series Box */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seriesVisual}
                      alt={group.name}
                      width={1200}
                      height={562}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-right opacity-50 mix-blend-screen scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/50" />
                  </div>

                  {/* Guaranteed Column Container for Vertical Stacking */}
                  <div className="w-full flex flex-col relative z-10">
                    {/* Collapsible Header with Trophy Icon */}
                    <button
                      onClick={() => toggleSeriesCollapse(group.name)}
                      className="w-full bg-gradient-to-r from-amber-950/60 via-neutral-900/80 to-transparent px-4 py-3.5 flex items-center justify-between border-b border-amber-500/20 hover:bg-amber-900/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-900/40 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          <span className="text-base">🏆</span>
                        </div>
                        <span className="text-sm font-bold text-white truncate">{group.name}</span>
                        <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          ({group.matches.length})
                        </span>
                        {hasGroupLive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase animate-pulse shadow-xs">
                            LIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-amber-400 shrink-0">
                        <span className="hidden sm:inline font-medium">
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    </button>

                    {/* Body: Match cards inside series with Gold StarBorder and mb1, mb2, mb3 visuals */}
                    {!isCollapsed && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-950/40">
                        {group.matches.map((match, matchIndex) => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            variant="list"
                            cardIndex={matchIndex}
                            bgImage={['/mb3.webp', '/mb2.webp', '/mb1.webp'][(groupIndex + matchIndex) % 3]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </StarBorder>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MatchListView;
