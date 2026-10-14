'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types/models';
import { MatchCard } from './MatchCard';
import { TabStrip, TabItem } from '@/components/ui/TabStrip';
import { formatTimeAgo, formatMatchTime } from '@/lib/format-date';
import { MatchesDataMeta } from '@/lib/matches';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Radio, AlertTriangle, Clock } from 'lucide-react';

interface MatchListViewProps {
  initialMatches: Match[];
  meta: MatchesDataMeta;
  isMock: boolean;
}

export function MatchListView({ initialMatches, meta, isMock }: MatchListViewProps) {
  const [activeTab, setActiveTab] = useState<string>('top');
  const [collapsedSeries, setCollapsedSeries] = useState<Record<string, boolean>>({});

  // Categorize matches
  const liveMatches = useMemo(() => initialMatches.filter((m) => m.status === 'live'), [initialMatches]);
  const upcomingMatches = useMemo(() => initialMatches.filter((m) => m.status === 'upcoming'), [initialMatches]);
  const finishedMatches = useMemo(
    () => initialMatches.filter((m) => m.status === 'completed' || m.status === 'abandoned'),
    [initialMatches]
  );

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

  // Carousel matches: ALL matches from today, ordered with Live first, then upcoming by start time, then finished
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

  // Auto-shift Top Matches cards one after other: stay for 2 seconds, then smoothly advance
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

      // If at or near the end, wrap back to the beginning
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isCarouselPaused, carouselMatches.length]);

  // Unique series list with count
  const seriesGroups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of initialMatches) {
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
  }, [initialMatches]);

  // Dynamic tabs
  const tabs: TabItem[] = useMemo(() => {
    const baseTabs: TabItem[] = [
      { id: 'top', label: 'Top Matches' },
      { id: 'live', label: 'Live', badge: liveMatches.length },
      { id: 'upcoming', label: 'Upcoming', badge: upcomingMatches.length },
      { id: 'finished', label: 'Finished', badge: finishedMatches.length },
    ];

    // Add top 3 dynamic series tabs
    seriesGroups.slice(0, 3).forEach((sg) => {
      baseTabs.push({
        id: `series-${sg.name}`,
        label: sg.name,
        badge: sg.matches.length,
      });
    });

    return baseTabs;
  }, [liveMatches.length, upcomingMatches.length, finishedMatches.length, seriesGroups]);

  // Filter matches based on active tab
  const displayedMatches = useMemo(() => {
    if (activeTab === 'live') return liveMatches;
    if (activeTab === 'upcoming') return upcomingMatches;
    if (activeTab === 'finished') return finishedMatches;
    if (activeTab.startsWith('series-')) {
      const seriesName = activeTab.replace('series-', '');
      return initialMatches.filter((m) => (m.seriesName || 'Other Matches') === seriesName);
    }
    return initialMatches;
  }, [activeTab, initialMatches, liveMatches, upcomingMatches, finishedMatches]);

  // Group displayed matches by series for mobile accordion & categorized view
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

  // Next upcoming match countdown estimation
  const nextUpcomingHours = useMemo(() => {
    if (upcomingMatches.length === 0) return 4;
    const now = Date.now();
    const sorted = [...upcomingMatches].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    const nextStart = new Date(sorted[0].startTime).getTime();
    const diffHours = Math.max(1, Math.round((nextStart - now) / (1000 * 3600)));
    return diffHours;
  }, [upcomingMatches]);

  const lastUpdatedText = formatTimeAgo(meta.updatedAt || meta.lastSuccessfulFetch);
  const isDataOld = meta.isBudgetExhausted;

  return (
    <div className="w-full">
      {/* Notice displayed when API key quota is exhausted across all three keys */}
      {(meta.isAllKeysExhausted || (isDataOld && !isMock)) && (
        <div className="bg-amber-950/85 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-center text-xs font-semibold backdrop-blur-md flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>⚠️ Limit over from all three keys.</span>
          <span className="text-amber-400/80 text-[11px] font-normal">
            (Daily live quota reached across all keys. Serving cached scores until next reset.)
          </span>
        </div>
      )}

      {/* Desktop Horizontal Tab Strip */}
      <div className="border-b border-surface-border bg-surface/90 backdrop-blur-md sticky top-14 md:top-16 z-20 shadow-xs">
        <div className="max-w-[1100px] mx-auto px-4 flex items-center justify-between">
          <TabStrip
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
            variant="surface"
            className="flex-1 overflow-x-auto"
            rightAction={
              <div className="flex items-center gap-3 shrink-0 ml-4 py-2 text-xs">
                <span className="text-surface-muted-text hidden md:inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {lastUpdatedText}
                </span>
                <Link
                  href="/fixtures"
                  className="text-brand-600 hover:text-brand-700 font-bold text-xs flex items-center gap-0.5"
                >
                  Schedule &gt;
                </Link>
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-8">
        {/* Top Matches Carousel Row (shown in 'top' or 'live' tabs) */}
        {(activeTab === 'top' || activeTab === 'live') && carouselMatches.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-surface-text">Top Matches</h2>
                {liveMatches.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    {liveMatches.length} Live
                  </span>
                )}
                <span className="text-xs text-surface-muted-text font-medium hidden sm:inline">
                  ({carouselMatches.length} matches • Auto-shifting every 2s)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-muted-text hidden md:inline">
                  Updated {lastUpdatedText}
                </span>
                {/* Horizontal scroll arrow buttons */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    aria-label="Scroll left"
                    className="w-7 h-7 rounded-full border border-surface-border bg-surface hover:bg-surface-muted flex items-center justify-center text-surface-muted-text hover:text-surface-text transition-all shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    aria-label="Scroll right"
                    className="w-7 h-7 rounded-full border border-surface-border bg-surface hover:bg-surface-muted flex items-center justify-center text-surface-muted-text hover:text-surface-text transition-all shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Carousel with smooth scrolling & 2s auto-shift */}
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

        {/* Empty State for Live Tab when 0 live matches */}
        {activeTab === 'live' && liveMatches.length === 0 && (
          <div className="p-8 rounded-card border border-surface-border bg-surface text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-muted mx-auto flex items-center justify-center text-2xl">
              🏏
            </div>
            <h3 className="text-base font-bold text-surface-text">No matches currently live</h3>
            <p className="text-xs text-surface-muted-text max-w-sm mx-auto">
              There are no matches in progress worldwide right now. Next match starts in approximately{' '}
              <span className="font-semibold text-surface-text">{nextUpcomingHours} hours</span>.
            </p>
            <button
              onClick={() => setActiveTab('upcoming')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-sm"
            >
              View Upcoming Matches
            </button>
          </div>
        )}

        {/* Collapsible Series Groups (Mobile View matching screenshot) & Desktop Grouped List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-surface-text">
              {activeTab === 'live'
                ? `Live Matches (${liveMatches.length})`
                : activeTab === 'upcoming'
                ? `Upcoming Fixtures (${upcomingMatches.length})`
                : activeTab === 'finished'
                ? `Finished Results (${finishedMatches.length})`
                : 'All Matches & Series'}
            </h2>
            <span className="text-xs text-surface-muted-text font-medium">
              Showing {displayedMatches.length} matches
            </span>
          </div>

          <div className="space-y-4">
            {displayedSeriesGroups.map((group) => {
              const isCollapsed = collapsedSeries[group.name] ?? false;
              const hasGroupLive = group.matches.some((m) => m.status === 'live');

              return (
                <div
                  key={group.name}
                  className="rounded-card border border-surface-border bg-surface overflow-hidden shadow-card transition-all"
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => toggleSeriesCollapse(group.name)}
                    className="w-full bg-surface-muted px-4 py-3 flex items-center justify-between border-b border-surface-border hover:bg-surface-border/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span className="text-sm font-bold text-surface-text truncate">
                        {group.name}
                      </span>
                      {hasGroupLive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 uppercase">
                          LIVE
                        </span>
                      )}
                      <span className="text-xs text-surface-muted-text font-semibold">
                        ({group.matches.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-surface-muted-text shrink-0">
                      <span className="hidden sm:inline font-medium">
                        {isCollapsed ? 'Expand' : 'Collapse'}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-surface-muted-text" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-surface-muted-text" />
                      )}
                    </div>
                  </button>

                  {/* Body: Match cards inside series */}
                  {!isCollapsed && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.matches.map((match) => (
                        <MatchCard key={match.id} match={match} variant="list" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Cricket News / Analysis Row */}
        <section className="space-y-4 pt-4 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-text">Latest Cricket News & Updates</h2>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Real-time feed
            </span>
          </div>

          <div className="divide-y divide-surface-border">
            <article className="py-4 flex flex-col md:flex-row gap-4 group">
              <div className="w-full md:w-48 h-32 rounded-lg bg-surface-muted border border-surface-border shrink-0 flex items-center justify-center font-bold text-3xl">
                🏏
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-bold text-surface-text group-hover:text-brand-600 transition-colors leading-snug">
                  ICC World Test Championship & Bilateral Series: Standings and Points System Explained
                </h3>
                <p className="text-xs text-surface-muted-text line-clamp-2 leading-relaxed">
                  Track full team point distributions, over-rate penalties, and qualification scenarios for the World Test Championship final.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <span className="text-surface-muted-text">Updated {lastUpdatedText}</span>
                  <span className="text-brand-600 font-bold uppercase tracking-wider">ICC WTC</span>
                  <span className="text-surface-muted-text">Test Championship</span>
                </div>
              </div>
            </article>

            <article className="py-4 flex flex-col md:flex-row gap-4 group">
              <div className="w-full md:w-48 h-32 rounded-lg bg-surface-muted border border-surface-border shrink-0 flex items-center justify-center font-bold text-3xl">
                🏆
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-bold text-surface-text group-hover:text-brand-600 transition-colors leading-snug">
                  Fast Live Ball-By-Ball Telemetry and Win Probability Analytics Integration
                </h3>
                <p className="text-xs text-surface-muted-text line-clamp-2 leading-relaxed">
                  Low-latency Server-Sent Events architecture delivers score updates directly to clients with sub-500ms server fan-out.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <span className="text-surface-muted-text">Just now</span>
                  <span className="text-brand-600 font-bold uppercase tracking-wider">ENGINEERING</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
