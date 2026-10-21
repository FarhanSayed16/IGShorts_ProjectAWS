import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'IGshorts is a public chart of famous Instagram people, ranked by follower count on a tracked watchlist.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-6">About</h1>
        <p className="text-lg text-[var(--ink-muted)] leading-relaxed mb-10">
          Billboard tells you who leads music. This site tells you who leads Instagram — on a
          curated watchlist, ranked only by public follower count.
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--ink)]">
          <section>
            <h2 className="chart-title text-2xl mb-3">What it is</h2>
            <p className="text-[var(--ink-muted)]">
              IGshorts is an independent editorial chart. Not Meta. Not a scraper of private data.
              People only on the default boards — brands and clubs stay off.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl mb-3">How we rank</h2>
            <p className="text-[var(--ink-muted)]">
              Competition rank by verified public followers. Missing counts stay blank, never zero.
              Ties share a rank (1, 2, 2, 4).
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl mb-3">Portraits</h2>
            <p className="text-[var(--ink-muted)]">
              Photos come from Wikipedia / Wikimedia Commons until live Instagram media is allowed
              through Meta App Review.
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link href="/methodology" className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4">
            Read the methodology
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
