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
  const isAdminPage = pathname.startsWith('/admin');
  const isUnauthRoot = pathname === '/' && !isAuth;
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

  if (isFullScreenPage) {
    return <main className="w-full min-h-screen p-0 m-0">{children}</main>;
  }

  return (
    <main className="w-full min-h-screen pb-28 lg:pb-8">
      {children}
    </main>
  );
}

export default AppLayoutShell;
