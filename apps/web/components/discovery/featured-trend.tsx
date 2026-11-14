import React from 'react';
import Link from 'next/link';
import { TREND_CATEGORY_LABELS, TrendCard } from '@igshorts/shared';

export function FeaturedTrend({ trend }: { trend: TrendCard | null }) {
  if (!trend) {
    return (
      <section className="mb-12 border border-[var(--line)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--ink-muted)]">No featured trend yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <section className="mb-12 border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="min-h-[220px] bg-[var(--canvas)] border-b md:border-b-0 md:border-r border-[var(--line)] flex items-center justify-center text-xs uppercase tracking-wider text-[var(--ink-muted)]">
          {trend.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trend.imageUrl} alt="" className="w-full h-full object-cover min-h-[220px]" />
          ) : (
            TREND_CATEGORY_LABELS[trend.category]
          )}
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            {TREND_CATEGORY_LABELS[trend.category]} · Featured
            {trend.sourceLabel === 'editorial' ? ' · Editorial selection' : ''}
          </p>
          <h2 className="chart-title text-4xl sm:text-5xl leading-none">{trend.title}</h2>
          {trend.summary && (
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{trend.summary}</p>
          )}
          <div>
            <Link
              href={trend.sourceUrl || `/trending/${trend.category.replace(/_/g, '-')}`}
              className="inline-flex items-center border border-[var(--ink)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-[var(--ink)] hover:text-[var(--canvas)]"
            >
              Explore →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
