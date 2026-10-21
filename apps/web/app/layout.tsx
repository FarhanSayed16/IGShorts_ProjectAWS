import type { Metadata } from 'next';
import { Inter, Oswald, JetBrains_Mono } from 'next/font/google';
import { ReactQueryProvider } from '@/lib/api/query-provider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { CommandPalette } from '@/components/chrome/command-palette';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
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
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col antialiased bg-[var(--color-canvas)] text-[var(--color-ink)]"
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
            <CommandPalette />
            <div className="flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
