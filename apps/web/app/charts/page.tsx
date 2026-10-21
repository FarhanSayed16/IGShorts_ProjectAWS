import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CHART_KEYS } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { fetchChartMeta } from '@/lib/api/client';

export const metadata: Metadata = {
  title: 'Charts',
  description: 'Global 100 and India 100 — people charts ranked by public follower count.',
};

export default async function ChartsIndexPage() {
  let globalMeta = null;
  let indiaMeta = null;

  try {
    const [gRes, iRes] = await Promise.all([
      fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
      fetchChartMeta(CHART_KEYS.INDIA_PERSONS),
    ]);
    globalMeta = gRes;
    indiaMeta = iRes;
  } catch {
    // Graceful offline fallback
  }

  const asOf = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  const globalAsOf = asOf(globalMeta?.as_of);
  const indiaAsOf = asOf(indiaMeta?.as_of);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-4">Charts</h1>
        <p className="text-sm text-[var(--ink-muted)] max-w-2xl leading-relaxed mb-10">
          Public people boards. Ranked by follower count on a tracked watchlist — not all of
          Instagram, not impressions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link
            href="/charts/global"
            className="group bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 hover:border-[var(--ink)] transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-3">
              {globalAsOf ? `As of ${globalAsOf}` : 'Live board'}
            </p>
            <h2 className="chart-title text-4xl sm:text-5xl text-[var(--ink)] mb-3 group-hover:underline">
              Global 100
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mb-6">
              The most followed people on the worldwide watchlist.
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink)]">
              {globalMeta?.ranked_profiles ?? '—'} ranked · Open →
            </p>
          </Link>

          <Link
            href="/charts/india"
            className="group bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 hover:border-[var(--ink)] transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-3">
              {indiaAsOf ? `As of ${indiaAsOf}` : 'Live board'}
            </p>
            <h2 className="chart-title text-4xl sm:text-5xl text-[var(--ink)] mb-3 group-hover:underline">
              India 100
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mb-6">
              India’s most followed people on the regional watchlist.
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink)]">
              {indiaMeta?.ranked_profiles ?? '—'} ranked · Open →
            </p>
          </Link>
        </div>

        <p className="text-sm text-[var(--ink-muted)]">
          Brands, clubs, and scoring v2 are cataloged, not published on the people boards.{' '}
          <Link href="/methodology" className="text-[var(--ink)] underline underline-offset-4">
            How ranks work
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
