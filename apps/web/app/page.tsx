import React from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Globe, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { CHART_KEYS, ChartEntry, ChartMeta, ChartMovers } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { StatusRibbon } from '@/components/chrome/status-ribbon';
import { PublicFooter } from '@/components/chrome/public-footer';
import { PodiumCard } from '@/components/rank/podium-card';
import { RankTable } from '@/components/rank/rank-table';
import { RankDeltaChip } from '@/components/rank/rank-delta-chip';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { fetchChartEntries, fetchChartMeta, fetchChartMovers } from '@/lib/api/client';
import copy from '@/messages/en.json';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const chart = await fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 3, offset: 0 });
    const leader = chart.entries[0];
    const top3 = chart.entries.map((row) => row.display_name).join(', ');
    return {
      title: leader
        ? `#${leader.rank} ${leader.display_name} · ${copy.brand.name}`
        : copy.brand.name,
      description: top3 ? `${copy.brand.mission} Leading names: ${top3}.` : copy.brand.mission,
    };
  } catch {
    return { title: copy.brand.name, description: copy.brand.mission };
  }
}

export default async function HomePage() {
  let globalEntries: ChartEntry[] = [];
  let indiaEntries: ChartEntry[] = [];
  let globalMeta: ChartMeta | null = null;
  let movers: ChartMovers | null = null;
  let hasApiError = false;

  try {
    const [globalRes, indiaRes, metaRes, moversRes] = await Promise.all([
      fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 10, offset: 0 }),
      fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 10, offset: 0 }),
      fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
      fetchChartMovers(CHART_KEYS.GLOBAL_PERSONS),
    ]);

    globalEntries = globalRes.entries;
    indiaEntries = indiaRes.entries;
    globalMeta = metaRes;
    movers = moversRes;
  } catch {
    hasApiError = true;
  }

  const globalPodium = globalEntries.slice(0, 3);
  const gainers = movers?.gainers?.slice(0, 4) || [];

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <PublicHeader />
      <StatusRibbon meta={globalMeta || undefined} />

      {/* API Notice / Fallback Banner if API unreachable */}
      {hasApiError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 w-full">
          <ErrorBanner message={copy.states.error_banner} />
        </div>
      )}

      <main id="main-content" className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-navy text-white pt-16 pb-20 px-4 sm:px-6 border-b border-navy-2">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30">
              <Trophy className="w-3.5 h-3.5" />
              {copy.brand.tagline}
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              Who leads Instagram today.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {copy.brand.mission}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/charts/global"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gold text-navy hover:bg-gold/90 transition-all shadow-lg shadow-gold/20 hover:scale-[1.02]"
              >
                <Globe className="w-4 h-4" />
                View Global Chart
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                How ranking works
              </Link>
              <Link
                href="/charts/india"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-gold" />
                View India Chart
              </Link>
            </div>
          </div>
        </section>

        {/* Global Podium Showcase */}
        {globalPodium.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {globalPodium.map((entry) => (
                <PodiumCard key={entry.username} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Movers Ticker Strip (Honest empty state or movers list) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Activity className="w-4 h-4 text-gold" />
                <span>Trending Movers & Gainers</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Updated weekly vs previous run
              </span>
            </div>

            {gainers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {gainers.map((m) => (
                  <div
                    key={m.username}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-slate-800 text-sm">#{m.rank}</span>
                      <span className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {m.display_name}
                      </span>
                    </div>
                    <RankDeltaChip delta={m.rank_delta} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                Baseline snapshot active. Movers will appear after the subsequent scheduled run.
              </div>
            )}
          </div>
        </section>

        {/* Twin Top-10 Snapshot Tables */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Global Top 10 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-navy" />
                  <h2 className="text-xl font-bold font-serif text-slate-900">Global Top 10</h2>
                </div>
                <Link
                  href="/charts/global"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold transition-colors"
                >
                  See Full Chart <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <RankTable entries={globalEntries} compact caption="Global top 10" />
            </div>

            {/* India Top 10 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-bold font-serif text-slate-900">India Top 10</h2>
                </div>
                <Link
                  href="/charts/india"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold transition-colors"
                >
                  See Full Chart <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <RankTable entries={indiaEntries} compact caption="India top 10" />
            </div>
          </div>
        </section>

        {/* Trust & Transparency Strip */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">How IGshorts Ranks Accounts</h3>
                <p className="text-xs text-slate-500">
                  Transparent standards and verifiable public metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">Tracked Watchlist</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We monitor a dedicated universe of famous creators and public figures across India
                  and Global spheres. We do not claim to scrape the entire Instagram firehose.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">Persons-Only by Default</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Corporate brands, sports clubs, and platforms are categorized separately and kept
                  off the default people leaderboard.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">Honest Precision</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accounts with missing follower counts are marked as unranked and omitted from
                  charts. We never convert unknown numbers to zero.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
