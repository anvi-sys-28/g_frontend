'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or default to light (White + Red)
    const savedTheme = localStorage.getItem('livecricket-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light mode (White + Red)
      setTheme('light');
      applyTheme('light');
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('livecricket-theme', nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full border border-white/20 ${className}`} aria-hidden="true" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to White + Red theme' : 'Switch to Black + Red theme'}
      title={isDark ? 'Switch to White + Red theme' : 'Switch to Black + Red theme'}
      className={`flex items-center gap-1.5 p-1.5 px-2.5 rounded-full border border-white/50 text-white hover:bg-white hover:text-brand-600 text-xs font-semibold transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-300 animate-in spin-in-180 duration-200" />
          <span className="hidden sm:inline text-[11px] font-bold">White + Red</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-100 animate-in spin-in-180 duration-200" />
          <span className="hidden sm:inline text-[11px] font-bold">Black + Red</span>
        </>
      )}
      {showLabel && <span className="text-[11px] font-medium">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
