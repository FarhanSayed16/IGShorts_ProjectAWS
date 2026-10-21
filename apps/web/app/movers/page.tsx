import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CHART_KEYS, ChartEntry } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { Avatar } from '@/components/rank/avatar';
import { FollowerCount } from '@/components/rank/follower-count';
import { RankDeltaChip } from '@/components/rank/rank-delta-chip';
import { FollowerDelta } from '@/components/rank/follower-delta';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { fetchChartMovers } from '@/lib/api/client';

export const metadata: Metadata = {
  title: 'Movers',
  description: 'Who climbed and who slipped on the IGshorts people charts since last chart.',
};

function MoverRow({ entry }: { entry: ChartEntry }) {
  return (
    <Link
      href={`/profiles/${entry.username}`}
      className="flex items-center gap-3 sm:gap-4 bg-[var(--surface)] border border-[var(--line)] px-3 sm:px-4 py-3 hover:border-[var(--ink)] transition-colors"
    >
      <div className="w-8 text-center shrink-0 font-display text-lg text-[var(--ink)]">
        {entry.rank}
      </div>
      <Avatar src={entry.avatar_url} name={entry.display_name} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="block font-semibold text-sm text-[var(--ink)] truncate">
          {entry.display_name}
        </span>
        <span className="block text-xs text-[var(--ink-muted)] truncate">@{entry.username}</span>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold tabular-nums">
          <FollowerCount count={entry.follower_count} />
        </div>
        <FollowerDelta previousCount={entry.previous_follower_count} delta={entry.follower_delta} />
        <RankDeltaChip previousRank={entry.previous_rank} delta={entry.rank_delta} />
      </div>
    </Link>
  );
}

function EmptyMovers({ label }: { label: string }) {
  return (
    <div className="py-12 px-4 text-center border border-[var(--line)] bg-[var(--surface)]">
      <p className="inline-block border border-[var(--ink)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]">
        Debut
      </p>
      <p className="text-xs text-[var(--ink-muted)] mt-2 max-w-sm mx-auto">
        {label} appear after the next ranking run. There is no previous chart to compare yet.
      </p>
    </div>
  );
}

export default async function MoversPage({
  searchParams,
}: {
  searchParams?: Promise<{ scope?: string }>;
}) {
  const resolvedParams = await searchParams;
  const scope = resolvedParams?.scope === 'india' ? 'india' : 'global';
  const chartKey = scope === 'india' ? CHART_KEYS.INDIA_PERSONS : CHART_KEYS.GLOBAL_PERSONS;

  let gainers: ChartEntry[] = [];
  let decliners: ChartEntry[] = [];
  let hasApiError = false;

  try {
    const moversRes = await fetchChartMovers(chartKey);
    gainers = (moversRes.gainers || []).filter((entry) => entry.rank_delta > 0);
    decliners = (moversRes.losers || []).filter((entry) => entry.rank_delta < 0);
  } catch {
    hasApiError = true;
  }

  const isIndia = scope === 'india';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        {hasApiError && (
          <div className="mb-6">
            <ErrorBanner message="We couldn’t load movers from the backend API. No placeholder ranks are shown." />
          </div>
        )}

        <div className="mb-8">
          <h1 className="chart-title text-5xl sm:text-7xl text-[var(--ink)]">Movers</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-3 max-w-2xl leading-relaxed">
            Largest rank changes since last chart. A first snapshot has no previous run to compare.
          </p>

          <div className="inline-flex mt-6 border border-[var(--ink)]">
            <Link
              href="/movers?scope=global"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                !isIndia ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink)]'
              }`}
            >
              Global
            </Link>
            <Link
              href="/movers?scope=india"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                isIndia ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--ink)]'
              }`}
            >
              India
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <section>
            <h2 className="chart-title text-2xl mb-4">Gainers</h2>
            {gainers.length > 0 ? (
              <div className="space-y-2">
                {gainers.map((entry) => (
                  <MoverRow key={entry.username} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyMovers label="Gainers" />
            )}
          </section>

          <section>
            <h2 className="chart-title text-2xl mb-4">Decliners</h2>
            {decliners.length > 0 ? (
              <div className="space-y-2">
                {decliners.map((entry) => (
                  <MoverRow key={entry.username} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyMovers label="Decliners" />
            )}
          </section>
        </div>

        <p>
          <Link
            href={isIndia ? '/charts/india' : '/charts/global'}
            className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4"
          >
            Full {isIndia ? 'India' : 'Global'} 100 →
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
