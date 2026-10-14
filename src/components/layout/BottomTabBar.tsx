'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { CricketBatBallIcon, AceCardIcon } from '../icons/NavIcons';

export function BottomTabBar() {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      try {
        setIsAuth(Boolean(localStorage.getItem('playin_auth') && sessionStorage.getItem('playin_session_active')));
      } catch {
        setIsAuth(true);
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

  // Hide mobile bottom tab bar on full-screen login, intro, admin portal, or on root before login
  if (pathname === '/login' || pathname === '/intro' || pathname.startsWith('/admin')) return null;
  if (pathname === '/' && !isAuth) return null;

  // 0 = Sports/Cricket, 1 = Casino
  const activeIndex = pathname.startsWith('/casino') ? 1 : 0;

  const navItems = [
    {
      id: 'sports',
      label: 'Cricket Live Scores',
      href: '/',
      icon: <CricketBatBallIcon className="w-8 h-8" />,
    },
    {
      id: 'casino',
      label: 'Live Casino Lounge',
      href: '/casino',
      icon: <AceCardIcon className="w-8 h-8" />,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="lg:hidden fixed bottom-4 left-0 right-0 z-40 flex justify-center items-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom)]"
    >
      {/* Increased height (h-[68px]), wide layout spanning available space */}
      <div className="relative pointer-events-auto flex items-center h-[68px] w-full max-w-md mx-auto rounded-2xl bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-2 border-surface-border shadow-2xl shadow-black/30">
        {/* Guaranteed Spotlight Beam using Motion & Percentage (25% for tab 0, 75% for tab 1) */}
        <motion.div
          animate={{
            left: activeIndex === 0 ? '25%' : '75%',
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 32,
          }}
          style={{ transform: 'translateX(-50%)' }}
          className="absolute top-0 w-24 pointer-events-none z-10 flex flex-col items-center"
        >
          {/* Top Red Spotlight Pill */}
          <div className="w-20 h-1.5 rounded-full bg-brand-600 shadow-[0_0_20px_var(--brand-600),0_0_8px_var(--brand-600)] ring-1 ring-white/40" />

          {/* Downward Angled Light Beam Cone */}
          <div className="w-24 h-14 [clip-path:polygon(15%_100%,32%_0,68%_0,85%_100%)] bg-gradient-to-b from-brand-600/50 via-brand-600/18 to-transparent" />
        </motion.div>

        {/* Tab Items */}
        {navItems.map((item, index) => {
          const isCurrent = activeIndex === index;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className={`relative z-20 flex-1 flex h-full items-center justify-center cursor-pointer transition-all duration-200 select-none ${
                isCurrent
                  ? 'text-brand-600 dark:text-brand-500 scale-110 drop-shadow-[0_2px_12px_rgba(215,38,61,0.5)]'
                  : 'text-surface-muted-text hover:text-surface-text opacity-40 hover:opacity-80 scale-100'
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomTabBar;
