'use client';

import React from 'react';
import Link from 'next/link';
import { Match } from '@/types/models';
import { FlagIcon } from './FlagIcon';
import { formatMatchTime } from '@/lib/format-date';
import { ChevronRight, MapPin } from 'lucide-react';
import { StarBorder } from '@/components/ui/StarBorder';

interface MatchCardProps {
  match: Match;
  variant?: 'carousel' | 'list';
  className?: string;
  cardIndex?: number;
  bgImage?: string;
}

const listVisuals = ['/mb3.webp', '/mb2.webp', '/mb1.webp'];

export function MatchCard({
  match,
  variant = 'carousel',
  className = '',
  cardIndex = 0,
  bgImage,
}: MatchCardProps) {
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

  // Live top matches get red star border; all other matches get gold star border
  const isRedBorder = isLive && variant === 'carousel';

  // Select mb3.webp, mb2.webp, mb1.webp for boxes under All Matches & Series
  const selectedBg = bgImage || listVisuals[cardIndex % listVisuals.length];

  const cardContent = (
    <Link
      href={`/match/${match.id}`}
      className="relative rounded-card bg-neutral-950/95 hover:bg-neutral-900/95 transition-all group flex flex-col justify-between overflow-hidden w-full h-full text-white"
    >
      {/* Background Stadium Atmosphere Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/60 pointer-events-none" />

      {/* Background Artwork for List Boxes (mb1.webp, mb2.webp, mb3.webp) matching reference */}
      {variant === 'list' && (
        <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 pointer-events-none overflow-hidden flex items-center justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedBg}
            alt="Match Stadium Visual"
            className="w-full h-full object-cover object-right opacity-60 mix-blend-screen scale-105 transition-transform duration-500 group-hover:scale-110"
          />
          {/* Left smooth fade gradient so team text & scores remain 100% legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/30" />
        </div>
      )}

      {/* Header Band */}
      <div className="relative z-10 bg-white/[0.03] px-3.5 py-2 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          {isLive && (
            <span className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase shadow-xs shadow-red-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          )}
          <span className="font-semibold text-neutral-300 truncate text-[11px] sm:text-xs" title={match.seriesName}>
            {match.seriesName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-medium shrink-0">
            {stageLabel}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors shrink-0" />
      </div>

      {/* Card Body */}
      <div className="relative z-10 p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        {/* Venue with MapPin Icon */}
        <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>

        {/* Live Top Match Horizontal Layout with VS pill */}
        {isLive && variant === 'carousel' ? (
          <div className="flex items-center justify-between py-1 px-1">
            {/* Team A */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                <FlagIcon code={match.teamA.code} name={match.teamA.name} size="sm" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{match.teamA.code}</div>
                <div className="text-[11px] font-bold text-amber-300">{team1Score || '-'}</div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-500/40 text-[9px] font-black text-amber-400 shadow-xs">
              VS
            </div>

            {/* Team B */}
            <div className="flex items-center gap-2 flex-row-reverse text-right">
              <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-400/40 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                <FlagIcon code={match.teamB.code} name={match.teamB.name} size="sm" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{match.teamB.code}</div>
                <div className="text-[11px] font-bold text-amber-300">{team2Score || '-'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Team A */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FlagIcon code={match.teamA.code} name={match.teamA.name} size="sm" />
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="text-sm font-black text-white">{match.teamA.code}</span>
                  <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                    {match.teamA.name}
                  </span>
                </div>
              </div>
              {team1Score ? (
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight">{team1Score}</span>
                </div>
              ) : isUpcoming ? (
                <span className="text-xs text-neutral-500">-</span>
              ) : null}
            </div>

            {/* Team B */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FlagIcon code={match.teamB.code} name={match.teamB.name} size="sm" />
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="text-sm font-black text-white">{match.teamB.code}</span>
                  <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                    {match.teamB.name}
                  </span>
                </div>
              </div>
              {team2Score ? (
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight">{team2Score}</span>
                </div>
              ) : isUpcoming ? (
                <span className="text-xs text-neutral-500">-</span>
              ) : null}
            </div>
          </div>
        )}

        {/* Footer Status & Progress Bar */}
        <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            {isLive ? (
              <span className="truncate font-semibold text-red-400 text-[11px] sm:text-xs">
                {match.statusText}
              </span>
            ) : isFinished ? (
              <span className="truncate font-semibold text-emerald-400 text-[11px] sm:text-xs">
                {match.statusText}
              </span>
            ) : isAbandoned ? (
              <span className="truncate font-medium text-neutral-400 text-[11px]">
                {match.statusText}
              </span>
            ) : (
              <div className="flex items-center justify-between w-full text-neutral-400 text-[11px]">
                <span>{timeFormatted.dayLabel}</span>
                <span className="font-bold text-neutral-200">{timeFormatted.timeLabel}</span>
              </div>
            )}
          </div>

          {/* Progress / Status Line Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLive
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 w-2/5 animate-pulse'
                  : isFinished
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 w-full'
                  : 'bg-white/20 w-1/4'
              }`}
            />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <StarBorder
      as="div"
      color={isRedBorder ? '#ef4444' : '#D4AF37'}
      trailColor={isRedBorder ? '#f87171' : '#FFDF73'}
      duration={isRedBorder ? 3 : 4}
      direction="clockwise"
      stars={1}
      trailLength={0.35}
      thickness={isRedBorder ? 1.8 : 1.4}
      radius={16}
      glow={isRedBorder ? 0.85 : 0.65}
      sparkle={true}
      hover="lap"
      clickPulse={true}
      className={`${variant === 'carousel' ? 'w-[290px] shrink-0' : 'w-full'} p-0 rounded-card bg-neutral-950/90 shadow-card ${className}`}
    >
      {cardContent}
    </StarBorder>
  );
}

export default MatchCard;
