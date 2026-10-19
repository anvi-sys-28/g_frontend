'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const isIntroPage = pathname?.startsWith('/intro');
  const isLoginPage = pathname?.startsWith('/login');
  const isAdminPage = pathname?.startsWith('/admin');
  const isUnauthRoot = pathname === '/' && !isAuth;
  const isCasinoRoute = pathname?.startsWith('/casino') || pathname?.startsWith('/roulette') || pathname?.startsWith('/andar-bahar');
  const isFullScreenPage = isIntroPage || isLoginPage || isAdminPage || isUnauthRoot;

  // Protect internal pages like /casino if unauthenticated (admin is accessed directly via /admin)
  useEffect(() => {
    try {
      const auth = localStorage.getItem('playin_auth');
      if (!auth && pathname.startsWith('/casino')) {
        router.replace('/login');
      }
    } catch {}
  }, [pathname, router]);

  // Keep dark background for casino routes so no white edges or overscroll bounce can ever leak
  useEffect(() => {
    if (isCasinoRoute) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0B0C0E';
      document.documentElement.style.backgroundColor = '#0B0C0E';
    } else {
      const theme = localStorage.getItem('livecricket-theme') || 'light';
      if (theme !== 'dark') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [isCasinoRoute]);

  if (isFullScreenPage) {
    return <main className="w-full min-h-screen p-0 m-0">{children}</main>;
  }

  if (isCasinoRoute) {
    return <main className="w-full min-h-screen bg-[#0B0C0E] text-white p-0 m-0">{children}</main>;
  }

  return (
    <main className="w-full min-h-screen pb-28 lg:pb-8">
      {children}
    </main>
  );
}

export default AppLayoutShell;
