'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendCard, TREND_CATEGORY_LABELS } from '@igshorts/shared';
import { fetchTrendsTicker } from '@/lib/api/client';

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function TrendingTicker() {
  const [items, setItems] = useState<TrendCard[]>([]);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    fetchTrendsTicker(12)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (items.length === 0) return null;

  const renderItem = (item: TrendCard, index: number, hidden = false) => {
    const href = item.sourceUrl || `/trending/${item.category.replace(/_/g, '-')}`;
    const external = isExternal(href);
    return (
      <Link
        key={`${item.id}-${hidden ? 'clone' : 'main'}-${index}`}
        href={href}
        className="hover:text-[var(--accent)] shrink-0"
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {TREND_CATEGORY_LABELS[item.category]} · {item.title}
      </Link>
    );
  };

  return (
    <div
      role="region"
      aria-label="Trending topics"
      className="border-b border-[var(--line)] bg-[var(--ink)] text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={`relative h-9 flex items-center ${reduceMotion ? 'overflow-x-auto' : ''}`}>
        <div
          className={`flex gap-8 whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            reduceMotion ? '' : `animate-discovery-ticker ${paused ? 'is-paused' : ''}`
          }`}
        >
          {items.map((item, index) => renderItem(item, index))}
          {!reduceMotion && items.map((item, index) => renderItem(item, index, true))}
        </div>
      </div>
    </div>
  );
}
