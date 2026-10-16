'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { SearchPill } from '../ui/SearchPill';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ChevronDown, LogOut } from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setIsAuth(Boolean(localStorage.getItem('playin_auth') && sessionStorage.getItem('playin_session_active')));
      } catch {
        setIsAuth(false);
      }
    };
    check();
    window.addEventListener('storage', check);
    window.addEventListener('playin_auth_changed', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('playin_auth_changed', check);
    };
  }, []);

  // Removed red AppHeader as requested
  return null;

  const handleLogout = () => {
    try {
      localStorage.removeItem('playin_auth');
      localStorage.removeItem('playin_user_id');
      localStorage.removeItem('playin_role');
      sessionStorage.removeItem('playin_session_active');
      sessionStorage.removeItem('playin_intro_seen');
      window.dispatchEvent(new Event('playin_auth_changed'));
    } catch (e) {}
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'Sports', href: '/' },
    { label: 'Casino', href: '/casino' },
    { label: 'Series', href: '/series' },
    { label: 'Teams', href: '/teams' },
    { label: 'Fixtures', href: '/fixtures' },
    { label: 'Stats Corner', href: '/stats' },
    { label: 'Rankings', href: '/rankings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Main Header / Nav Bar (Solid Brand Red --brand-600) */}
      <div className="bg-brand-600 text-white border-b border-brand-700">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Logo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-14 flex items-center transition-colors border-b-2 ${
                    isActive
                      ? 'font-bold text-white border-white'
                      : 'text-white/80 hover:text-white border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* "More" dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="h-14 flex items-center gap-1 text-white/80 hover:text-white transition-colors"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showMoreMenu && (
                <div
                  className="absolute right-0 top-12 w-44 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowMoreMenu(false)}
                >
                  <Link
                    href="/settings"
                    onClick={() => setShowMoreMenu(false)}
                    className="block px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Notification Settings
                  </Link>
                  <Link
                    href="/dev/components"
                    onClick={() => setShowMoreMenu(false)}
                    className="block px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Component Library (/dev)
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Theme Toggle, Search Pill & Logout */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <SearchPill variant="nav" className="hidden lg:flex" />
            <SearchPill variant="mobile" className="lg:hidden" />
            <button
              type="button"
              onClick={handleLogout}
              title="Logout to Login Screen"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
