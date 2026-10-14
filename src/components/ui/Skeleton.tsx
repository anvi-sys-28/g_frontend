import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-muted rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

export function MatchCardSkeleton({ variant = 'carousel' }: { variant?: 'carousel' | 'list' }) {
  return (
    <div
      className={`rounded-card border border-surface-border bg-surface overflow-hidden shadow-card ${
        variant === 'carousel' ? 'w-[280px] shrink-0' : 'w-full'
      }`}
      aria-hidden="true"
    >
      {/* Header Band */}
      <div className="bg-surface-muted px-4 py-2 border-b border-surface-border flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-36" />

        <div className="space-y-2 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export function NewsItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-surface-border" aria-hidden="true">
      <Skeleton className="w-full sm:w-44 h-32 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
