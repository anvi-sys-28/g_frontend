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
        setIsAuth(!!localStorage.getItem('playin_auth'));
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

  const isIntroPage = pathname === '/intro';
  const isLoginPage = pathname === '/login';
  const isUnauthRoot = pathname === '/' && !isAuth;
  const isFullScreenPage = isIntroPage || isLoginPage || isUnauthRoot;

  // Protect internal pages like /casino or /admin if unauthenticated
  useEffect(() => {
    try {
      const auth = localStorage.getItem('playin_auth');
      if (!auth && (pathname.startsWith('/casino') || pathname.startsWith('/admin'))) {
        router.replace('/login');
      }
    } catch {}
  }, [pathname, router]);

  if (isFullScreenPage) {
    return <main className="w-full min-h-screen p-0 m-0">{children}</main>;
  }

  return (
    <main className="flex-1 w-full pb-24 lg:pb-8">
      {children}
    </main>
  );
}

export default AppLayoutShell;
