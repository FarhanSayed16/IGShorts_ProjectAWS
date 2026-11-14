import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ReactQueryProvider } from '@/lib/api/query-provider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { CommandPalette } from '@/components/chrome/command-palette';
import { AudioPlayerProvider } from '@/lib/audio-player-context';
import { InteractiveMediaDock } from '@/components/discovery/interactive-media-dock';
import { PageViewBeacon } from '@/components/analytics/page-view-beacon';
import { RouteEventBeacon } from '@/components/analytics/route-event-beacon';
import { SessionExpiredProvider } from '@/components/feedback/session-expired-provider';
import './globals.css';

// Self-hosted fonts avoid next/font/google build flakes when Google returns
// extensionless /l/font?kit= URLs (Next.js #99114).
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});

const oswald = localFont({
  src: './fonts/oswald-latin-wght-normal.woff2',
  weight: '200 700',
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: './fonts/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'IGshorts — Public Instagram people charts',
    template: '%s · IGshorts',
  },
  description:
    'Public charts of famous Instagram people on a tracked watchlist, ranked by public follower count. Not all of Instagram. Not impressions.',
  keywords: [
    'Instagram rankings',
    'India Top Instagram',
    'Instagram followers leaderboard',
    'IGshorts',
  ],
  openGraph: {
    title: 'IGshorts — Public Instagram people charts',
    description:
      'Watchlist charts ranked by public follower count. Global and India persons boards.',
    url: siteUrl,
    siteName: 'IGshorts',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'IGshorts — Public Instagram people charts',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col antialiased bg-[var(--color-canvas)] text-[var(--color-ink)] overflow-x-hidden w-full max-w-full"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('igshorts-theme');var d=t==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',d);if(d==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){};if(typeof navigator!=='undefined'&&'serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(r){for(var s of r){s.unregister()}})}",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand-navy)] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] text-xs font-bold"
        >
          Skip to main content
        </a>
        <ReactQueryProvider>
          <ThemeProvider>
            <SessionExpiredProvider>
              <AudioPlayerProvider>
                <CommandPalette />
                <PageViewBeacon />
                <RouteEventBeacon />
                <div className="flex-1 flex flex-col">{children}</div>
                <InteractiveMediaDock />
              </AudioPlayerProvider>
            </SessionExpiredProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
