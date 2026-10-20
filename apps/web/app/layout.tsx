import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import { ReactQueryProvider } from '@/lib/api/query-provider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { CommandPalette } from '@/components/chrome/command-palette';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
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
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col antialiased bg-[var(--color-canvas)] text-[var(--color-ink)]"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('igshorts-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){}",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-navy)] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-xs font-bold"
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
