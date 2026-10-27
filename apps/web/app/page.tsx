import React from 'react';
import Link from 'next/link';
import { CHART_KEYS, ChartEntry, ChartMeta } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { BillboardList } from '@/components/rank/billboard-list';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { GroupMix, GroupMixData } from '@/components/rank/group-mix';
import { fetchAudienceMix, fetchChartEntries, fetchChartMeta } from '@/lib/api/client';
import copy from '@/messages/en.json';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const chart = await fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 3, offset: 0 });
    const leader = chart.entries[0];
    const top3 = chart.entries.map((row) => row.display_name).join(', ');
    return {
      title: leader ? `#${leader.rank} ${leader.display_name}` : copy.brand.name,
      description: top3 ? `${copy.brand.mission} Leading names: ${top3}.` : copy.brand.mission,
    };
  } catch {
    return { title: copy.brand.name, description: copy.brand.mission };
  }
}

function ChartHeading({
  title,
  asOf,
  href,
}: {
  title: string;
  asOf?: string;
  href: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="chart-title text-5xl sm:text-7xl text-[var(--ink)]">
          {title}
        </h1>
        {asOf && (
          <p className="mt-3 inline-block border border-[var(--ink)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]">
            As of {new Date(asOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      <Link href={href} className="text-xs font-bold uppercase tracking-[0.16em] hover:underline">
        Full chart →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  let globalEntries: ChartEntry[] = [];
  let indiaEntries: ChartEntry[] = [];
  let globalMeta: ChartMeta | null = null;
  let savedMix: GroupMixData | null = null;
  let hasApiError = false;

  try {
    const [globalRes, indiaRes, metaRes, mixRes] = await Promise.all([
      fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 10, offset: 0 }),
      fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 5, offset: 0 }),
      fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
      fetchAudienceMix().catch(() => null),
    ]);
    globalEntries = globalRes.entries;
    indiaEntries = indiaRes.entries;
    globalMeta = metaRes;
    savedMix = mixRes;
  } catch {
    hasApiError = true;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        {hasApiError && (
          <div className="mb-8">
            <ErrorBanner message={copy.states.error_banner} />
          </div>
        )}

        {savedMix && (
          <GroupMix
            mix={savedMix}
            title="Audience groups in the saved list"
            context="Counts are the saved public index: FastSocial Top Charts, CC BY 4.0, together with the IGshorts seed lists."
          />
        )}

        <section className="mb-16">
          <ChartHeading
            title="Global 100"
            asOf={globalMeta?.as_of}
            href="/charts/global"
          />
          <BillboardList entries={globalEntries} featured caption="Global top 10" />
        </section>

        <section className="mb-16">
          <ChartHeading title="India 100" href="/charts/india" />
          <BillboardList entries={indiaEntries} featured={false} caption="India top 5" />
        </section>

        <section className="border-t border-[var(--line)] pt-10 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-display text-xl mb-2">Tracked watchlist</h3>
            <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
              A curated universe of public figures. We do not rank all of Instagram.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl mb-2">Public followers</h3>
            <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
              Rank is competition rank by verified public follower count. Missing counts stay blank.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl mb-2">How it works</h3>
            <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
              <Link href="/methodology" className="underline underline-offset-4">
                Read the methodology
              </Link>
              . Portraits are from Wikipedia, not Instagram.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
