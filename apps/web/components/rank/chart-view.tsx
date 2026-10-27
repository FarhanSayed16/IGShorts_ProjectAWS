'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChartEntry, ChartMeta } from '@igshorts/shared';
import { StatusRibbon } from '@/components/chrome/status-ribbon';
import { BillboardList } from '@/components/rank/billboard-list';
import { GroupMix } from '@/components/rank/group-mix';
import { TableSkeleton } from '@/components/feedback/table-skeleton';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { EmptyState } from '@/components/feedback/empty-state';
import { fetchAudienceMix, fetchChartEntries, fetchChartMeta, ChartEntriesResponse } from '@/lib/api/client';
import copy from '@/messages/en.json';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Actors', value: 'Actor' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Music', value: 'Music' },
  { label: 'Creators', value: 'Creator' },
  { label: 'Fashion', value: 'Model' },
];

interface ChartViewProps {
  chartKey: string;
  scope: 'global' | 'india';
  initialMeta?: ChartMeta | null;
  initialEntries?: ChartEntriesResponse | null;
}

export function ChartView({ chartKey, scope, initialMeta, initialEntries }: ChartViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const PAGE_SIZE = 50;

  const { data: mix } = useQuery({
    queryKey: ['audience-mix', 'saved'],
    queryFn: () => fetchAudienceMix(),
    staleTime: 15 * 1000,
  });

  const { data: meta } = useQuery({
    queryKey: ['chart-meta', chartKey],
    queryFn: () => fetchChartMeta(chartKey),
    initialData: initialMeta || undefined,
    staleTime: 15 * 1000,
  });

  const {
    data: chartData,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['chart-entries', chartKey, page, activeCategory, searchQuery],
    queryFn: () =>
      fetchChartEntries(chartKey, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        category: activeCategory || undefined,
        q: searchQuery.trim() || undefined,
      }),
    initialData:
      page === 1 &&
      !activeCategory &&
      !searchQuery &&
      initialEntries &&
      initialEntries.entries.length > 0
        ? initialEntries
        : undefined,
    placeholderData: (previousData) => previousData,
    staleTime: 15 * 1000,
  });

  const entries: ChartEntry[] = useMemo(() => chartData?.entries || [], [chartData]);
  const total = chartData?.meta.total ?? (initialEntries?.meta.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const isIndia = scope === 'india';
  const pageTitle = isIndia ? 'India 100' : 'Global 100';
  const pageSubtitle = isIndia ? copy.charts.india_subtitle : copy.charts.global_subtitle;

  const jsonLd = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: pageSubtitle,
      numberOfItems: total,
      itemListElement: entries.slice(0, 50).map((entry, idx) => ({
        '@type': 'ListItem',
        position: entry.rank || idx + 1,
        name: entry.display_name || entry.username,
        url: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ''}/profiles/${entry.username}`,
      })),
    };
  }, [entries, pageTitle, pageSubtitle, total]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <StatusRibbon meta={meta} />

      {meta?.is_stale && (
        <div className="border-b border-[var(--warn)] bg-[var(--warn-bg)] px-4 py-2 text-center text-xs font-semibold text-[var(--warn)] flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Last refreshed {meta.freshness_hours} hours ago.
        </div>
      )}

      <div className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="chart-title text-5xl sm:text-7xl">{pageTitle}</h1>
          <p className="mt-3 text-sm text-[var(--ink-muted)] max-w-2xl">{pageSubtitle}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
            <span className="border border-[var(--ink)] px-2 py-0.5 font-bold">
              {total} ranked
            </span>
            <span className="text-[var(--ink-muted)]">followers_v1</span>
          </div>
        </div>

        {mix && (
          <GroupMix
            mix={mix}
            title="Saved list split"
            context="Names on this chart are already Major. The ring counts every saved profile, including people who are not on the chart."
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search names or @usernames"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  setSearchQuery(val);
                  setPage(1);
                });
              }}
              className="search-input pl-10 pr-9 py-2.5 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-xs text-[var(--ink-muted)]">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of{' '}
            {total}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  startTransition(() => {
                    setActiveCategory(cat.value);
                    setPage(1);
                  });
                }}
                className={isSelected ? 'filter-chip filter-chip--active' : 'filter-chip'}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {isError ? (
          <ErrorBanner
            message={
              error instanceof Error
                ? error.message
                : 'Unable to load leaderboard data from API.'
            }
            onRetry={() => refetch()}
          />
        ) : isLoading && entries.length === 0 ? (
          <TableSkeleton rows={8} />
        ) : entries.length === 0 ? (
          <EmptyState
            title="No ranked people"
            description={
              searchQuery || activeCategory
                ? 'Nothing matched these filters.'
                : 'No ranked entries for this chart yet.'
            }
          />
        ) : (
          <div className={isPlaceholderData ? 'opacity-60' : 'opacity-100'}>
            <BillboardList
              entries={entries}
              featured={page === 1 && !searchQuery && !activeCategory}
              caption={`${pageTitle} ranked by public follower count`}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--line)]">
                <span className="text-xs text-[var(--ink-muted)]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-secondary !py-2 !px-3 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-secondary !py-2 !px-3 disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-[11px] text-[var(--ink-faint)]">
          {isIndia ? (
            <Link href="/charts/global" className="underline">
              Switch to Global 100
            </Link>
          ) : (
            <Link href="/charts/india" className="underline">
              Switch to India 100
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
