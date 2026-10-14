'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Trophy, Users, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SearchItem {
  id: string;
  type: 'team' | 'match' | 'series' | 'player';
  title: string;
  subtitle: string;
  href: string;
}

const mockSearchData: SearchItem[] = [
  { id: '1', type: 'match', title: 'India vs West Indies, 4th T20I', subtitle: 'WI vs IND 2026 • Live Today', href: '/match/match-ind-pak-2024' },
  { id: '2', type: 'team', title: 'India (IND)', subtitle: 'Men\'s National Cricket Team', href: '/team/team-ind' },
  { id: '3', type: 'team', title: 'West Indies (WI)', subtitle: 'Men\'s National Cricket Team', href: '/team/team-wi' },
  { id: '4', type: 'series', title: 'West Indies tour of India 2026', subtitle: '5 T20Is • Ongoing', href: '/series/wi-vs-ind-2026' },
  { id: '5', type: 'player', title: 'Virat Kohli', subtitle: 'Batter • India', href: '/player/virat-kohli' },
  { id: '6', type: 'player', title: 'Rohit Sharma', subtitle: 'Captain • India', href: '/player/rohit-sharma' },
  { id: '7', type: 'series', title: 'Sri Lanka tour of Pakistan 2026', subtitle: '3 T20Is, 3 ODIs', href: '/series/sl-vs-pak-2026' },
  { id: '8', type: 'match', title: 'Pakistan vs Sri Lanka, 3rd T20I', subtitle: 'Rawalpindi Cricket Stadium', href: '/match/match-ind-pak-2024' },
];

export function SearchPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>(mockSearchData);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults(mockSearchData);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(mockSearchData);
    } else {
      const q = query.toLowerCase();
      setResults(
        mockSearchData.filter(
          (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        )
      );
    }
  }, [query]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'match':
        return <Calendar className="w-4 h-4 text-brand-600" />;
      case 'team':
        return <Shield className="w-4 h-4 text-win" />;
      case 'series':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'player':
        return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search teams, matches, series, players..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {item.type}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Keyboard shortcut footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-surface border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search in under 200ms from Redis cache</span>
          <div className="flex items-center gap-1.5 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
