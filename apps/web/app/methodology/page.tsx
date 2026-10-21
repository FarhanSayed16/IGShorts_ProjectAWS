import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { fetchProfiles } from '@/lib/api/client';
import copy from '@/messages/en.json';

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How IGshorts ranks famous Instagram people: a tracked watchlist, public follower counts, honest nulls.',
};

export default async function MethodologyPage() {
  let watchlistSize: number | null = null;
  try {
    const res = await fetchProfiles({ limit: 1, offset: 0 });
    watchlistSize = res.meta.total;
  } catch {
    watchlistSize = null;
  }
  const universeCopy =
    watchlistSize != null
      ? `${watchlistSize} names`
      : 'a curated set of high-visibility people';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-6">Methodology</h1>
        <p className="text-lg text-[var(--ink-muted)] leading-relaxed mb-12">
          {copy.methodology.subtitle}
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-[var(--ink-muted)]">
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">1. A tracked watchlist</h2>
            <p>
              We do not rank all of Instagram. The board is a hand-curated universe of public
              figures — currently {universeCopy}. Brands, clubs, and the platform account stay off
              the default people charts.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">2. Public followers only</h2>
            <p>
              Version <span className="font-mono text-[var(--ink)]">followers_v1</span> ranks by
              verified public follower count. No engagement scores, no impressions, no invented
              reach. Anyone can audit a number by visiting the public profile.
            </p>
            <p className="mt-3">
              Chart portraits and short bios come from Wikipedia / Wikimedia Commons. They are not
              Instagram photos. Live Instagram avatars and counts stay off until Meta App Review.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">3. Persons, not brands</h2>
            <p>
              Default boards compare people. Corporate brands, sports clubs, and platform accounts
              are cataloged separately so the chart stays a people ranking.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">4. Missing stays blank</h2>
            <p>
              If we do not have a verified count, the metric is{' '}
              <span className="font-mono text-[var(--ink)]">null</span> — never coerced to zero.
              Those names stay on the watchlist as listed, not yet ranked.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">5. Competition rank</h2>
            <p>
              Ties share a rank (1, 2, 2, 4). The next name skips ahead. Handle order is only a
              display tie-break so tables stay deterministic.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">6. Snapshots, then movers</h2>
            <p>
              Each observation is appended, never overwritten. LAST / MOVE / PEAK fill in after a
              second ranking run. A first import is a debut snapshot — dashes, not fake movement.
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link
            href="/charts/global"
            className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4"
          >
            See the Global 100 →
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
