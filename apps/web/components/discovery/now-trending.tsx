'use client';

import React, { useEffect, useState } from 'react';
import { TrendCard as TrendCardDto, TrendSort } from '@igshorts/shared';
import { fetchTrends } from '@/lib/api/client';
import { TrendCard } from './trend-card';

const SORTS: { id: TrendSort; label: string }[] = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'rising', label: 'Fastest Rising' },
  { id: 'new', label: 'Newly Trending' },
];

export function NowTrending() {
  const [sort, setSort] = useState<TrendSort>('popular');
  const [region, setRegion] = useState<'india' | 'global' | 'both'>('both');
  const [items, setItems] = useState<TrendCardDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrends({
      sort,
      region: region === 'both' ? undefined : region,
      limit: 6,
    })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sort, region]);

  return (
    <section className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <h2 className="chart-title text-3xl sm:text-4xl">Now trending</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Region">
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
              {r === 'both' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--line)] pb-3" role="tablist" aria-label="Sort">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
