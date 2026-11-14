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
        className="hover:text-[var(--accent)] shrink-0 transition-colors flex items-center gap-1.5"
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <span className="text-[var(--accent)] text-[10px] font-mono">[{TREND_CATEGORY_LABELS[item.category] || item.category}]</span>
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div
      role="region"
      aria-label="Live trending topics ticker"
      className="border-b border-[var(--solid-line)] bg-[var(--solid)] text-[var(--on-solid)] overflow-hidden flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Pinned Left Radar Indicator */}
      <div className="z-10 bg-[var(--solid)] border-r border-[var(--solid-line)] px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 text-[10px] font-mono font-bold tracking-widest text-[var(--accent)] uppercase shadow-md">
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
        <span className="sm:hidden">LIVE</span>
        <span className="hidden sm:inline">LIVE FEED</span>
      </div>

      <div className={`relative h-9 flex items-center flex-1 min-w-0 ${reduceMotion ? 'overflow-x-auto' : ''}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-[1] bg-gradient-to-r from-[var(--solid)] to-transparent"
        />
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
