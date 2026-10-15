'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MatchDetailData, BatsmanDetail, BowlerDetail } from '@/types/models';
import { FlagIcon } from './FlagIcon';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tv,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

interface MatchDetailViewProps {
  initialData: MatchDetailData;
  matchId: string;
}

export function MatchDetailView({ initialData, matchId }: MatchDetailViewProps) {
  const router = useRouter();
  const [data, setData] = useState<MatchDetailData>(initialData);
  const [activeTab, setActiveTab] = useState<'info' | 'scorecard' | 'live' | 'stats'>('info');
  const [selectedInningIndex, setSelectedInningIndex] = useState(0);
  const [comparisonTab, setComparisonTab] = useState<'overall' | 'venue'>('overall');
  const [expandedSquad, setExpandedSquad] = useState<'teamA' | 'teamB' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<'teamA' | 'teamB' | null>(null);
  const [voteStats, setVoteStats] = useState({
    teamA: data.whoWillWin?.teamAVotes || 45200,
    teamB: data.whoWillWin?.teamBVotes || 32485,
    total: data.whoWillWin?.totalVotes || 77685,
  });

  const { match, scorecard, squads, headToHead, teamComparison, teamForm } = data;

  // Manual "GET DATA" button handler: fetches real-time API data on-demand without wasting background quota
  const handleGetData = async () => {
    setIsRefreshing(true);
    setRefreshNotice(null);
    try {
      const res = await fetch(`/api/match/${matchId}?refresh=true`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const freshData: MatchDetailData = await res.json();
        setData(freshData);
        setRefreshNotice('Data updated from Live API');
        setTimeout(() => setRefreshNotice(null), 3000);
      } else {
        setRefreshNotice('Using latest cached data');
        setTimeout(() => setRefreshNotice(null), 3000);
      }
    } catch {
      setRefreshNotice('Network error, serving offline data');
      setTimeout(() => setRefreshNotice(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVote = (team: 'teamA' | 'teamB') => {
    if (userVote) return;
    setUserVote(team);
    setVoteStats((prev) => ({
      teamA: team === 'teamA' ? prev.teamA + 1 : prev.teamA,
      teamB: team === 'teamB' ? prev.teamB + 1 : prev.teamB,
      total: prev.total + 1,
    }));
  };

  const voteAPercent = Math.round((voteStats.teamA / voteStats.total) * 100);
  const voteBPercent = 100 - voteAPercent;

  const currentInning = scorecard && scorecard.length > 0 ? scorecard[selectedInningIndex] || scorecard[0] : null;

  return (
    <div className="min-h-screen bg-[#080d14] text-white pb-24 font-sans select-none">
      {/* 1. TOP HEADER: Back Arrow | Match Title | GET DATA Button */}
      <header className="sticky top-0 z-40 bg-[#0c1421] border-b border-white/10 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
              {match.teamA.code} Vs {match.teamB.code}, {match.matchNumber || match.format}, {match.seriesName} Info
            </h1>
          </div>
        </div>

        {/* High-Contrast "GET DATA" Button to fetch real-time data on demand */}
        <button
          onClick={handleGetData}
          disabled={isRefreshing}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 text-xs font-black tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.5)] hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'FETCHING...' : 'GET DATA'}</span>
        </button>
      </header>

      {/* Real-time Data Toast Notification */}
      {refreshNotice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-black shadow-xl flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* 2. MATCH SCORE HERO BANNER (Teams, Flags, Live Status/Result) */}
      <section className="bg-[#0c1421] px-4 pt-3 pb-4 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Team A */}
          <div className="flex items-center gap-2.5">
            <FlagIcon code={match.teamA.code} name={match.teamA.name} size="lg" className="w-9 h-9 sm:w-10 sm:h-10 border border-white/20 shadow-md" />
            <div>
              <span className="text-base sm:text-lg font-black text-white tracking-wide">{match.teamA.code}</span>
              {match.teamAScore && (
                <div className="text-xs sm:text-sm font-bold text-amber-300">{match.teamAScore.display}</div>
              )}
            </div>
          </div>

          {/* Match Center: Date / Time or Result */}
          <div className="text-center">
            {match.status === 'live' ? (
              <div>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/50">
                  LIVE
                </span>
                <div className="text-xs text-neutral-300 mt-1 font-semibold">{match.statusText}</div>
              </div>
            ) : match.status === 'completed' ? (
              <div>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">COMPLETED</span>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5 max-w-[180px] sm:max-w-xs truncate">
                  {match.statusText || `${match.winnerId ? match.winnerId.toUpperCase() : 'Match'} won`}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] text-neutral-400 font-medium">Scheduled</div>
                <div className="text-base sm:text-lg font-black text-white mt-0.5">
                  {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {new Date(match.startTime).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </div>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <span className="text-base sm:text-lg font-black text-white tracking-wide">{match.teamB.code}</span>
              {match.teamBScore && (
                <div className="text-xs sm:text-sm font-bold text-amber-300">{match.teamBScore.display}</div>
              )}
            </div>
            <FlagIcon code={match.teamB.code} name={match.teamB.name} size="lg" className="w-9 h-9 sm:w-10 sm:h-10 border border-white/20 shadow-md" />
          </div>
        </div>
      </section>

      {/* 3. SUB-TABS NAVIGATION: Match info | Scorecard | Live | Stats */}
      <div className="sticky top-[49px] z-30 bg-[#0c1421] border-b border-white/10 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-start gap-6 overflow-x-auto no-scrollbar text-xs font-bold py-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`relative py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'info' ? 'text-white font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Match info
            {activeTab === 'info' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`relative py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'scorecard' ? 'text-white font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Scorecard
            {activeTab === 'scorecard' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`relative py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'live' ? 'text-white font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Live
            {activeTab === 'live' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`relative py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'stats' ? 'text-white font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Series Stats
            {activeTab === 'stats' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* ======================================================== */}
        {/* TAB 1: MATCH INFO (Matching attached user screenshots 2,3,4,5) */}
        {/* ======================================================== */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Top Match Series Card */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                  {match.matchNumber || match.format}
                </span>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {match.seriesName} &gt;
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-white/10 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
            </div>

            {/* Date, Venue, Broadcast Info List */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3.5 text-xs text-neutral-300">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>
                  {new Date(match.startTime).toLocaleDateString([], {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  ,{' '}
                  {new Date(match.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="truncate">{match.venue}, {match.city}</span>
              </div>

              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Star Sports Network, DD Sports, JioHotstar</span>
              </div>
            </div>

            {/* Squads Accordion */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">
                {match.teamA.code} &amp; {match.teamB.code} Squad
              </h3>

              {/* Team A Squad */}
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSquad(expandedSquad === 'teamA' ? null : 'teamA')}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FlagIcon code={match.teamA.code} size="sm" />
                    <span className="text-xs font-bold text-white">{match.teamA.name}</span>
                  </div>
                  {expandedSquad === 'teamA' ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {expandedSquad === 'teamA' && squads?.teamA && (
                  <div className="p-3 bg-black/30 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-neutral-300">
                    {squads.teamA.players.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team B Squad */}
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSquad(expandedSquad === 'teamB' ? null : 'teamB')}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FlagIcon code={match.teamB.code} size="sm" />
                    <span className="text-xs font-bold text-white">{match.teamB.name}</span>
                  </div>
                  {expandedSquad === 'teamB' ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {expandedSquad === 'teamB' && squads?.teamB && (
                  <div className="p-3 bg-black/30 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-neutral-300">
                    {squads.teamB.players.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* "Who will win?" Prediction Poll (Screenshot 2 & 3) */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Who will win?</h3>
                <span className="text-[11px] text-neutral-400">
                  Total Votes: {voteStats.total.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVote('teamA')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 ${
                    userVote === 'teamA'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{match.teamA.code}</span>
                  {userVote && <span className="text-[10px] text-neutral-400">{voteAPercent}%</span>}
                </button>

                <button
                  onClick={() => handleVote('teamB')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 ${
                    userVote === 'teamB'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{match.teamB.code}</span>
                  {userVote && <span className="text-[10px] text-neutral-400">{voteBPercent}%</span>}
                </button>
              </div>

              {userVote && (
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden flex mt-2">
                  <div style={{ width: `${voteAPercent}%` }} className="h-full bg-amber-400 transition-all duration-500" />
                  <div style={{ width: `${voteBPercent}%` }} className="h-full bg-sky-400 transition-all duration-500" />
                </div>
              )}
            </div>

            {/* Team Form (Last 5 matches - Screenshot 2 & 5) */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {match.teamA.code} &amp; {match.teamB.code} Team Form
                </h3>
                <span className="text-[11px] text-neutral-400">(Last 5 matches)</span>
              </div>

              <div className="space-y-2.5">
                {/* Team A Form */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlagIcon code={match.teamA.code} size="xs" />
                    <span className="text-xs font-bold text-white">{match.teamA.code}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(teamForm?.teamA || ['W', 'L', 'W', 'W', 'W']).map((res, idx) => (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                          res === 'W'
                            ? 'bg-emerald-600 text-white'
                            : res === 'L'
                            ? 'bg-red-600 text-white'
                            : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team B Form */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlagIcon code={match.teamB.code} size="xs" />
                    <span className="text-xs font-bold text-white">{match.teamB.code}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(teamForm?.teamB || ['L', 'W', 'L', 'W', 'L']).map((res, idx) => (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                          res === 'W'
                            ? 'bg-emerald-600 text-white'
                            : res === 'L'
                            ? 'bg-red-600 text-white'
                            : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Head to Head (Last 10 matches - Screenshot 4 & 5) */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {match.teamA.code} vs {match.teamB.code} Head to Head
                </h3>
                <span className="text-[11px] text-neutral-400">(Last 10 matches)</span>
              </div>

              {/* Big Score Header */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-around">
                <div className="flex items-center gap-2">
                  <FlagIcon code={match.teamA.code} size="md" />
                  <span className="text-sm font-black text-white">{match.teamA.code}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {headToHead?.teamAWins || 6} - {headToHead?.teamBWins || 4}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{match.teamB.code}</span>
                  <FlagIcon code={match.teamB.code} size="md" />
                </div>
              </div>

              {/* Recent Head to Head Match Cards */}
              <div className="space-y-2">
                {(headToHead?.recentMatches || []).map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-1 truncate">
                      <div className="text-[10px] text-neutral-400 truncate">{m.title}</div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <FlagIcon code={match.teamA.code} size="xs" />
                        <span>{match.teamA.code} {m.teamAScore}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <FlagIcon code={match.teamB.code} size="xs" />
                        <span>{match.teamB.code} {m.teamBScore}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-sky-400">{m.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Comparison (Screenshot 4) */}
            <div className="rounded-xl border border-white/10 bg-[#0f1724] p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {match.teamA.code} vs {match.teamB.code} Team Comparison
                </h3>
              </div>

              {/* Filter Tabs: Overall | On Venue */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setComparisonTab('overall')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    comparisonTab === 'overall'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  Overall
                </button>
                <button
                  onClick={() => setComparisonTab('venue')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    comparisonTab === 'venue'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  On Venue
                </button>
              </div>

              {/* Comparison Stats Table */}
              {teamComparison && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-400 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <FlagIcon code={match.teamA.code} size="xs" />
                      <span>{match.teamA.code}</span>
                    </div>
                    <span>Metric</span>
                    <div className="flex items-center gap-1.5">
                      <span>{match.teamB.code}</span>
                      <FlagIcon code={match.teamB.code} size="xs" />
                    </div>
                  </div>

                  {/* Matches Played */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamAMatches : teamComparison.onVenue.teamAMatches}
                    </span>
                    <span className="text-neutral-400">Matches Played</span>
                    <span className="font-bold text-white">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamBMatches : teamComparison.onVenue.teamBMatches}
                    </span>
                  </div>

                  {/* Win % */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamAWinRate : teamComparison.onVenue.teamAWinRate}
                    </span>
                    <span className="text-neutral-400">Win Rate</span>
                    <span className="font-bold text-emerald-400">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamBWinRate : teamComparison.onVenue.teamBWinRate}
                    </span>
                  </div>

                  {/* Average Score */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamAAvgScore : teamComparison.onVenue.teamAAvgScore}
                    </span>
                    <span className="text-neutral-400">Avg Score</span>
                    <span className="font-bold text-amber-400">
                      {comparisonTab === 'overall' ? teamComparison.overall.teamBAvgScore : teamComparison.onVenue.teamBAvgScore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2 & 3: SCORECARD & LIVE (Full Batsmen & Bowler Real-time Data) */}
        {/* ======================================================== */}
        {(activeTab === 'scorecard' || activeTab === 'live') && (
          <div className="space-y-4">
            {scorecard && scorecard.length > 0 ? (
              <>
                {/* Inning Switcher Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {scorecard.map((inn, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedInningIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                        selectedInningIndex === idx
                          ? 'bg-amber-400 text-neutral-950 shadow-md'
                          : 'bg-[#0f1724] text-neutral-300 hover:bg-[#162235]'
                      }`}
                    >
                      {inn.inning}
                    </button>
                  ))}
                </div>

                {currentInning && (
                  <div className="space-y-4">
                    {/* Batsmen Table */}
                    <div className="rounded-xl border border-white/10 bg-[#0f1724] overflow-hidden shadow-sm">
                      <div className="bg-white/[0.04] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          Batting — {currentInning.inning}
                        </span>
                        {currentInning.totalScore && (
                          <span className="text-xs font-extrabold text-white">
                            Total: {currentInning.totalScore}
                          </span>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-neutral-400 text-[11px] font-bold">
                              <th className="py-2 px-3 sm:px-4">Batter</th>
                              <th className="py-2 px-2 text-right">R</th>
                              <th className="py-2 px-2 text-right">B</th>
                              <th className="py-2 px-2 text-right">4s</th>
                              <th className="py-2 px-2 text-right">6s</th>
                              <th className="py-2 px-3 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentInning.batting.map((b: BatsmanDetail) => (
                              <tr key={b.id} className="hover:bg-white/[0.02]">
                                <td className="py-2 px-3 sm:px-4">
                                  <div className="font-bold text-white">{b.name}</div>
                                  <div className="text-[10px] text-neutral-400 truncate max-w-[140px] sm:max-w-xs">
                                    {b.dismissal}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-right font-black text-white">{b.runs}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{b.balls}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{b.fours}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{b.sixes}</td>
                                <td className="py-2 px-3 text-right font-semibold text-neutral-300">{b.strikeRate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowlers Table */}
                    <div className="rounded-xl border border-white/10 bg-[#0f1724] overflow-hidden shadow-sm">
                      <div className="bg-white/[0.04] px-4 py-2.5 border-b border-white/10">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          Bowling
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-neutral-400 text-[11px] font-bold">
                              <th className="py-2 px-3 sm:px-4">Bowler</th>
                              <th className="py-2 px-2 text-right">O</th>
                              <th className="py-2 px-2 text-right">M</th>
                              <th className="py-2 px-2 text-right">R</th>
                              <th className="py-2 px-2 text-right font-black text-amber-300">W</th>
                              <th className="py-2 px-3 text-right">ECO</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentInning.bowling.map((bw: BowlerDetail) => (
                              <tr key={bw.id} className="hover:bg-white/[0.02]">
                                <td className="py-2 px-3 sm:px-4 font-bold text-white">{bw.name}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{bw.overs}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{bw.maidens}</td>
                                <td className="py-2 px-2 text-right text-neutral-300">{bw.runs}</td>
                                <td className="py-2 px-2 text-right font-black text-amber-400">{bw.wickets}</td>
                                <td className="py-2 px-3 text-right font-semibold text-neutral-300">{bw.economy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 rounded-xl border border-white/10 bg-[#0f1724] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-2xl">
                  🏏
                </div>
                <h3 className="text-base font-bold text-white">Scorecard will be available when play begins</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Hit the <span className="font-bold text-amber-300">GET DATA</span> button at the top to fetch the latest real-time updates directly from the live API.
                </p>
                <button
                  onClick={handleGetData}
                  disabled={isRefreshing}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-black text-xs hover:from-amber-300 hover:to-yellow-400 transition-all shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'FETCHING...' : 'GET DATA'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SERIES STATS */}
        {/* ======================================================== */}
        {activeTab === 'stats' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0f1724] space-y-3">
            <h3 className="text-sm font-bold text-white">Series Information</h3>
            <p className="text-xs text-neutral-300">
              Tournament: <span className="font-semibold text-amber-300">{match.seriesName}</span>
            </p>
            <p className="text-xs text-neutral-300">
              Format: <span className="font-semibold text-white">{match.format}</span>
            </p>
            <p className="text-xs text-neutral-300">
              Venue: <span className="font-semibold text-white">{match.venue}, {match.city}</span>
            </p>
            <p className="text-xs text-neutral-300">
              Status: <span className="font-semibold text-emerald-400">{match.statusText}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
