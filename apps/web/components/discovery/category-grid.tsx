import React from 'react';
import Link from 'next/link';
import { TREND_CATEGORY_LABELS, TREND_CATEGORY_PAGE_SLUGS, TrendCategory } from '@igshorts/shared';

const SLUG_TO_CATEGORY: Record<string, TrendCategory> = {
  music: 'music',
  news: 'news',
  'internet-culture': 'internet_culture',
  entertainment: 'entertainment',
  technology: 'technology',
  'sports-gaming': 'sports_gaming',
};

export function CategoryGrid() {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="chart-title text-3xl sm:text-4xl">Explore categories</h2>
        <Link href="/trending" className="text-xs font-bold uppercase tracking-[0.16em] hover:underline">
          All trending →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {TREND_CATEGORY_PAGE_SLUGS.map((slug) => {
          const category = SLUG_TO_CATEGORY[slug];
          return (
            <Link
              key={slug}
              href={`/trending/${slug}`}
              className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 hover:border-[var(--ink)] transition-colors min-h-[110px] flex flex-col justify-between"
            >
              <span className="chart-title text-2xl sm:text-3xl leading-none">
                {TREND_CATEGORY_LABELS[category]}
              </span>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                Open →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
