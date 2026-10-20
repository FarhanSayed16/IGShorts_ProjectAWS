import React from 'react';
import type { Metadata } from 'next';
import { CHART_KEYS } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { ChartView } from '@/components/rank/chart-view';
import { fetchChartEntries, fetchChartMeta } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const entries = await fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 3, offset: 0 });
    const leader = entries.entries[0];
    const top3 = entries.entries.map((row) => row.display_name).join(', ');
    return {
      title: leader ? `#${leader.rank} ${leader.display_name} · India persons` : 'India persons',
      description: top3
        ? `India watchlist chart. Top names: ${top3}. Ranked by public follower count.`
        : 'India watchlist chart ranked by public follower count.',
    };
  } catch {
    return {
      title: 'India persons',
      description: 'India watchlist chart ranked by public follower count.',
    };
  }
}

export default async function IndiaChartPage() {
  let initialMeta = null;
  let initialEntries = null;

  try {
    const [metaRes, entriesRes] = await Promise.all([
      fetchChartMeta(CHART_KEYS.INDIA_PERSONS),
      fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 50, offset: 0 }),
    ]);
    initialMeta = metaRes;
    initialEntries = entriesRes;
  } catch {
    initialMeta = null;
    initialEntries = null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <ChartView
          chartKey={CHART_KEYS.INDIA_PERSONS}
          scope="india"
          initialMeta={initialMeta}
          initialEntries={initialEntries}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
