import React from 'react';
import Link from 'next/link';
import { CHART_KEYS, ChartEntry, ChartMeta, DailyPulseDay, MusicTrackCard, TrendCard } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { BillboardList } from '@/components/rank/billboard-list';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { GroupMix, GroupMixData } from '@/components/rank/group-mix';
import { TrendingTicker } from '@/components/discovery/trending-ticker';
import { FeaturedTrend } from '@/components/discovery/featured-trend';
import { CategoryGrid } from '@/components/discovery/category-grid';
import { NowTrending } from '@/components/discovery/now-trending';
import { MusicStrip } from '@/components/discovery/music-strip';
import { CreatorSpotlight } from '@/components/discovery/creator-spotlight';
import { DailyPulse } from '@/components/discovery/daily-pulse';
import { SinceLastVisit } from '@/components/discovery/since-last-visit';
import {
  fetchAudienceMix,
  fetchChartEntries,
  fetchChartMeta,
  fetchChartMovers,
  fetchFeaturedTrend,
  fetchMusicTracks,
  fetchPulseToday,
} from '@/lib/api/client';
import copy from '@/messages/en.json';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const featured = await fetchFeaturedTrend();
    if (featured) {
      return {
        title: `${copy.brand.name} · ${featured.title}`,
        description: featured.summary || copy.brand.mission,
      };
    }
  } catch {
    // fall through
  }
  return { title: copy.brand.name, description: copy.brand.mission };
}

export default async function HomePage() {
  let globalEntries: ChartEntry[] = [];
  let indiaEntries: ChartEntry[] = [];
  let globalMeta: ChartMeta | null = null;
  let savedMix: GroupMixData | null = null;
  let featured: TrendCard | null = null;
  let onRepeat: MusicTrackCard[] = [];
  let spotlight: ChartEntry[] = [];
  let pulse: DailyPulseDay | null = null;
  let hasApiError = false;

  const [
    globalRes,
    indiaRes,
    metaRes,
    mixRes,
    featuredRes,
    musicRes,
    moversRes,
    pulseRes,
  ] = await Promise.allSettled([
    fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 10, offset: 0 }),
    fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 5, offset: 0 }),
    fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
    fetchAudienceMix(),
    fetchFeaturedTrend(),
    fetchMusicTracks({ collection: 'on_repeat', limit: 12 }),
    fetchChartMovers(CHART_KEYS.GLOBAL_PERSONS),
    fetchPulseToday(),
  ]);

  if (globalRes.status === 'fulfilled') {
    globalEntries = globalRes.value.entries;
  } else {
    hasApiError = true;
  }
  if (indiaRes.status === 'fulfilled') {
    indiaEntries = indiaRes.value.entries;
  } else {
    hasApiError = true;
  }
  if (metaRes.status === 'fulfilled') globalMeta = metaRes.value;
  if (mixRes.status === 'fulfilled') savedMix = mixRes.value;
  if (featuredRes.status === 'fulfilled') featured = featuredRes.value;
  if (musicRes.status === 'fulfilled') onRepeat = musicRes.value.data;
  const moverGainers =
    moversRes.status === 'fulfilled' ? moversRes.value.gainers?.slice(0, 6) || [] : [];
  spotlight = moverGainers.length > 0 ? moverGainers : globalEntries.slice(0, 6);
  const spotlightMode: 'movers' | 'chart' = moverGainers.length > 0 ? 'movers' : 'chart';
  if (pulseRes.status === 'fulfilled') pulse = pulseRes.value;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <TrendingTicker />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        {hasApiError && (
          <div className="mb-8">
            <ErrorBanner message={copy.states.error_banner} />
          </div>
        )}

        <FeaturedTrend trend={featured} />
        <CategoryGrid />
        <NowTrending />
        <MusicStrip title="Music on Repeat" tracks={onRepeat} />
        <CreatorSpotlight creators={spotlight} mode={spotlightMode} />
        <DailyPulse pulse={pulse} />
        <SinceLastVisit />

        <section className="mb-14 border-t border-[var(--line)] pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="chart-title text-3xl sm:text-4xl">Charts</h2>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Global 100 and India 100 remain the curated ranking lists.
                {globalMeta?.as_of
                  ? ` As of ${new Date(globalMeta.as_of).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}.`
                  : ''}
              </p>
            </div>
            <Link href="/charts/global" className="text-xs font-bold uppercase tracking-[0.16em] hover:underline">
              Open charts →
            </Link>
          </div>
          <div className="mb-10">
            <BillboardList entries={globalEntries} featured caption="Global top 10" />
          </div>
          <div className="mb-10">
            <h3 className="chart-title text-2xl mb-4">India top 5</h3>
            <BillboardList entries={indiaEntries} featured={false} caption="India top 5" />
          </div>
          {savedMix && (
            <GroupMix
              mix={savedMix}
              title="Audience groups in the saved list"
              context="Counts are the saved public index: FastSocial Top Charts, CC BY 4.0, together with the IGshorts seed lists."
            />
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
