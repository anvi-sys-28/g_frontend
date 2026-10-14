'use client';

import React, { useRef } from 'react';
import Link from 'next/link';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  href?: string;
}

interface TabStripProps {
  tabs: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  variant?: 'surface' | 'header';
  rightAction?: React.ReactNode;
  className?: string;
}

export function TabStrip({
  tabs,
  activeId,
  onChange,
  variant = 'surface',
  rightAction,
  className = '',
}: TabStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHeader = variant === 'header';

  return (
    <div
      className={`w-full flex items-center justify-between border-b ${
        isHeader
          ? 'border-white/20 bg-brand-600'
          : 'border-surface-border bg-surface'
      } ${className}`}
    >
      <div
        ref={scrollContainerRef}
        role="tablist"
        className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;

          const buttonContent = (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    isHeader
                      ? isActive
                        ? 'bg-white text-brand-600'
                        : 'bg-white/20 text-white'
                      : isActive
                      ? 'bg-brand-50 text-brand-600 border border-brand-500/20'
                      : 'bg-surface-muted text-surface-muted-text'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          );

          const activeClasses = isHeader
            ? isActive
              ? 'text-white font-bold border-b-[3px] border-white pb-2.5 pt-3'
              : 'text-white/70 hover:text-white font-medium border-b-[3px] border-transparent pb-2.5 pt-3'
            : isActive
            ? 'text-brand-600 font-bold border-b-2 border-brand-600 pb-2.5 pt-3'
            : 'text-surface-muted-text hover:text-surface-text font-medium border-b-2 border-transparent pb-2.5 pt-3';

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={`text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-t ${activeClasses}`}
              >
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange?.(tab.id)}
              className={`text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-t ${activeClasses}`}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>

      {rightAction && (
        <div className="shrink-0 pl-4 py-2">
          {rightAction}
        </div>
      )}
    </div>
  );
}
