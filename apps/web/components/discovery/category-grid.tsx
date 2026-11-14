import React from 'react';
import Link from 'next/link';
import { TREND_CATEGORY_LABELS, TREND_CATEGORY_PAGE_SLUGS, TrendCategory } from '@igshorts/shared';
import { CATEGORY_BLURBS, DiscoveryMedia } from './discovery-media';

const SLUG_TO_CATEGORY: Record<string, TrendCategory> = {
  music: 'music',
  news: 'news',
  'internet-culture': 'internet_culture',
  entertainment: 'entertainment',
  technology: 'technology',
  'sports-gaming': 'sports_gaming',
};

const CATEGORY_IMAGES: Partial<Record<TrendCategory, string>> = {
  music:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
  news: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
  internet_culture:
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
  entertainment:
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
  technology:
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
  sports_gaming:
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80',
};

export function CategoryGrid() {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="chart-title text-3xl sm:text-4xl">Explore categories</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Six discovery lanes — Music, News, Culture, Entertainment, Tech, Sports & Gaming.
          </p>
        </div>
        <Link href="/trending" className="text-xs font-bold uppercase tracking-[0.16em] hover:underline shrink-0">
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
              className="group border border-[var(--line)] bg-[var(--surface)] overflow-hidden hover-lift hover:border-[var(--ink)] transition-all"
            >
              <div className="aspect-[16/10] relative">
                <DiscoveryMedia
                  imageUrl={CATEGORY_IMAGES[category]}
                  category={category}
                  alt={TREND_CATEGORY_LABELS[category]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                  <span className="chart-title text-xl sm:text-2xl leading-none block">
                    {TREND_CATEGORY_LABELS[category]}
                  </span>
                  <span className="mt-1 hidden sm:block text-[11px] text-white/80 leading-snug">
                    {CATEGORY_BLURBS[category]}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)] group-hover:text-[var(--ink)]">
                <span>Browse</span>
                <span>Open →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
