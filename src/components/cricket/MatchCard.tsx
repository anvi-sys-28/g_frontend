'use client';

import React from 'react';
import Link from 'next/link';
import { Match } from '@/types/models';
import { FlagIcon } from './FlagIcon';
import { formatMatchTime } from '@/lib/format-date';
import { ChevronRight } from 'lucide-react';
import { StarBorder } from '@/components/ui/StarBorder';

interface MatchCardProps {
  match: Match;
  variant?: 'carousel' | 'list';
  className?: string;
}

export function MatchCard({ match, variant = 'carousel', className = '' }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';
  const isAbandoned = match.status === 'abandoned';

  const timeFormatted = formatMatchTime(match.startTime);

  // Score display helpers
  const team1Score = match.teamAScore?.display;
  const team2Score = match.teamBScore?.display;

  // Format label: T20, ODI, TEST, etc.
  const stageLabel = match.matchNumber || match.format;

  const cardContent = (
    <Link
      href={`/match/${match.id}`}
      className={`rounded-card bg-surface hover:border-brand-500/50 transition-all shadow-card group flex flex-col justify-between overflow-hidden w-full h-full ${
        variant === 'list' ? 'border border-surface-border' : ''
      }`}
    >
      {/* Header Band */}
      <div className="bg-surface-muted px-4 py-2 border-b border-surface-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          {isLive && (
            <span className="flex items-center gap-1.5 shrink-0 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold text-[10px] tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              LIVE
            </span>
          )}
          <span className="font-semibold text-surface-muted-text truncate" title={match.seriesName}>
            {match.seriesName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-border/50 text-surface-muted-text font-medium shrink-0">
            {stageLabel}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-surface-muted-text group-hover:text-brand-600 transition-colors shrink-0" />
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="text-[11px] text-surface-muted-text truncate">
          {match.venue}
        </div>

        <div className="space-y-2.5">
          {/* Team A */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <FlagIcon code={match.teamA.code} name={match.teamA.name} size="sm" />
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="text-sm font-bold text-surface-text">{match.teamA.code}</span>
                <span className="text-xs text-surface-muted-text truncate hidden sm:inline">
                  {match.teamA.name}
                </span>
              </div>
            </div>
            {team1Score ? (
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-surface-text">{team1Score}</span>
              </div>
            ) : isUpcoming ? (
              <span className="text-xs text-surface-muted-text">-</span>
            ) : null}
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <FlagIcon code={match.teamB.code} name={match.teamB.name} size="sm" />
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="text-sm font-bold text-surface-text">{match.teamB.code}</span>
                <span className="text-xs text-surface-muted-text truncate hidden sm:inline">
                  {match.teamB.name}
                </span>
              </div>
            </div>
            {team2Score ? (
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-surface-text">{team2Score}</span>
              </div>
            ) : isUpcoming ? (
              <span className="text-xs text-surface-muted-text">-</span>
            ) : null}
          </div>
        </div>

        {/* Footer Status or Time */}
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
          {isLive ? (
            <div className="flex items-center justify-between w-full font-medium text-brand-600">
              <span className="truncate">{match.statusText}</span>
            </div>
          ) : isFinished ? (
            <span className="font-semibold text-win truncate">{match.statusText}</span>
          ) : isAbandoned ? (
            <span className="font-medium text-surface-muted-text truncate">{match.statusText}</span>
          ) : (
            <div className="flex items-center justify-between w-full text-surface-muted-text">
              <span>{timeFormatted.dayLabel}</span>
              <span className="font-bold text-surface-text">{timeFormatted.timeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  // Apply StarBorder ONLY for Top Matches carousel boxes, styled in gold
  if (variant === 'carousel') {
    return (
      <StarBorder
        as="div"
        color="#D4AF37"
        trailColor="#FFDF73"
        duration={4}
        direction="clockwise"
        stars={1}
        trailLength={0.35}
        thickness={1.5}
        radius={16}
        glow={0.7}
        sparkle={true}
        hover="lap"
        clickPulse={true}
        className={`w-[290px] shrink-0 p-0 rounded-card overflow-hidden bg-surface shadow-card ${className}`}
      >
        {cardContent}
      </StarBorder>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {cardContent}
    </div>
  );
}

export default MatchCard;
