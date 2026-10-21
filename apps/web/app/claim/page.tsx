import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'Claim profile — coming soon',
  robots: { index: false, follow: false },
};

export default function ClaimShellPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="chart-title text-4xl sm:text-5xl mb-3">Claim a profile</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Creator claim and Insights are v2. v1 is an editorial watchlist chart only.
        </p>
        <Link
          href="/methodology"
          className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4"
        >
          Read methodology
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
