import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppLayoutShell } from '@/components/layout/AppLayoutShell';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'LiveCricket - Fast Live Cricket Scores, Live Ball-by-Ball & Analysis',
  description:
    'Ultra-low latency live cricket scores, ball-by-ball commentary, win probability, worm charts, and match schedules. Zero betting, real-time sports analytics.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D7263D' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1013' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('livecricket-theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-surface-text font-sans antialiased selection:bg-brand-50 selection:text-brand-700">
        <Providers>
          {/* Top Navigation & App Header */}
          <AppHeader />

          {/* Main Content Area: dynamically handled by AppLayoutShell */}
          <AppLayoutShell>
            {children}
          </AppLayoutShell>

          {/* Mobile Bottom Navigation Bar */}
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  );
}
