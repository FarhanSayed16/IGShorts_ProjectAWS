import React from 'react';
import Link from 'next/link';
import { TREND_CATEGORY_LABELS, TrendCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';

export function FeaturedTrend({ trend }: { trend: TrendCard | null }) {
  if (!trend) {
    return (
      <section className="mb-12 border border-[var(--line)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--ink-muted)]">No featured trend yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <section className="mb-12 border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="grid md:grid-cols-[1.25fr_1fr]">
        <div className="min-h-[240px] md:min-h-[320px] bg-[var(--canvas)] border-b md:border-b-0 md:border-r border-[var(--line)]">
          <DiscoveryMedia
            imageUrl={trend.imageUrl}
            category={trend.category}
            alt={trend.title}
            className="min-h-[240px] md:min-h-[320px]"
          />
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {TREND_CATEGORY_LABELS[trend.category]} · Featured
            {trend.sourceLabel === 'editorial' ? ' · Editorial selection' : ''}
          </p>
          <h2 className="chart-title text-4xl sm:text-5xl leading-[0.95]">{trend.title}</h2>
          {trend.summary && (
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{trend.summary}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={trend.sourceUrl || `/trending/${trend.category.replace(/_/g, '-')}`}
              className="inline-flex items-center border border-[var(--ink)] bg-[var(--ink)] text-[var(--canvas)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-transparent hover:text-[var(--ink)] transition-colors"
            >
              Explore →
            </Link>
            <Link
              href="/trending"
              className="inline-flex items-center border border-[var(--line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] hover:border-[var(--ink)]"
            >
              All trending
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
