'use client';

import React, { useEffect, useState } from 'react';
import { TrendCard as TrendCardDto, TrendCategory, TrendSort } from '@igshorts/shared';
import { fetchTrends } from '@/lib/api/client';
import { TrendCard } from './trend-card';

const SORTS: { id: TrendSort; label: string }[] = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'rising', label: 'Fastest Rising' },
  { id: 'new', label: 'Newly Trending' },
];

const PAGE_SIZE = 24;

export function TrendingExplorer({ category }: { category?: TrendCategory }) {
  const [sort, setSort] = useState<TrendSort>('popular');
  const [region, setRegion] = useState<'india' | 'global' | 'both'>('both');
  const [items, setItems] = useState<TrendCardDto[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTrends({
      category,
      sort,
      region: region === 'both' ? undefined : region,
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setHasMore(res.meta.has_more);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, sort, region]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetchTrends({
        category,
        sort,
        region: region === 'both' ? undefined : region,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      setItems((prev) => [...prev, ...res.data]);
      setHasMore(res.meta.has_more);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Region">
        {(['both', 'india', 'global'] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={region === r}
            onClick={() => setRegion(r)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] border ${
              region === r
                ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--canvas)]'
                : 'border-[var(--line)] text-[var(--ink-muted)]'
            }`}
          >
            {r === 'both' ? 'All regions' : r}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--line)] pb-3" role="tablist" aria-label="Sort">
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={sort === s.id}
            onClick={() => setSort(s.id)}
            className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] border-b-2 -mb-[13px] ${
              sort === s.id
                ? 'border-[var(--accent)] text-[var(--ink)]'
                : 'border-transparent text-[var(--ink-muted)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {loading ? (
          <p className="text-sm text-[var(--ink-muted)]">Loading trends…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">No trending topics right now. Check back soon.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--canvas)] disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
