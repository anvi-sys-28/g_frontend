'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchPalette } from './SearchPalette';

interface SearchPillProps {
  variant?: 'nav' | 'mobile' | 'surface';
  className?: string;
}

export function SearchPill({ variant = 'nav', className = '' }: SearchPillProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Search"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-brand-600 border border-white/40 text-xs font-semibold transition-all ${className}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
        <SearchPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/60 text-white hover:bg-white hover:text-brand-600 text-xs font-medium transition-all shadow-sm ${className}`}
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.2 rounded bg-white/20 text-[10px] text-white">⌘K</kbd>
      </button>
      <SearchPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
