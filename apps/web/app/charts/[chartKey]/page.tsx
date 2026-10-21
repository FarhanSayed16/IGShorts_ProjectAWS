import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { isChartKey } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chart coming soon',
  robots: { index: false, follow: false },
};

export default async function FutureChartPage({
  params,
}: {
  params: Promise<{ chartKey: string }>;
}) {
  const { chartKey } = await params;
  if (isChartKey(chartKey)) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center">
        <h1 className="chart-title text-4xl sm:text-5xl mb-3">This chart is not live yet</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          <code className="font-mono text-[var(--ink)]">{chartKey}</code> is reserved for a later
          tab (brands, teams, or scoring v2). v1 only publishes Global and India people charts.
        </p>
        <Link
          href="/charts"
          className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4"
        >
          Back to charts
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
