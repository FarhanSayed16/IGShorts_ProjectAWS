'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendCard, TREND_CATEGORY_LABELS } from '@igshorts/shared';
import { fetchTrendsTicker } from '@/lib/api/client';

export function TrendingTicker() {
  const [items, setItems] = useState<TrendCard[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchTrendsTicker(12)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div
      className="border-b border-[var(--line)] bg-[var(--ink)] text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-9 flex items-center">
        <div
          className={`flex gap-8 whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.14em] animate-discovery-ticker ${
            paused ? 'is-paused' : ''
          }`}
        >
          {loop.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={item.sourceUrl || `/trending/${item.category.replace(/_/g, '-')}`}
              className="hover:text-[var(--accent)] shrink-0"
            >
              {TREND_CATEGORY_LABELS[item.category]} · {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
