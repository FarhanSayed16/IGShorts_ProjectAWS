import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  TREND_CATEGORY_LABELS,
  TREND_CATEGORY_PAGE_SLUGS,
  TREND_CATEGORY_SLUGS,
  TrendCategory,
} from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { TrendingExplorer } from '@/components/discovery/trending-explorer';
import { CATEGORY_BLURBS } from '@/components/discovery/discovery-media';

export function generateStaticParams() {
  return TREND_CATEGORY_PAGE_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = TREND_CATEGORY_SLUGS[slug];
  if (!category) return { title: 'IGshorts · Trending' };
  return {
    title: `IGshorts · ${TREND_CATEGORY_LABELS[category]}`,
    description: `Trending topics in ${TREND_CATEGORY_LABELS[category]}.`,
    openGraph: {
      title: `IGshorts · ${TREND_CATEGORY_LABELS[category]}`,
      description: `Browse ${TREND_CATEGORY_LABELS[category]} trends on IGshorts.`,
    },
  };
}

export default async function TrendingCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = TREND_CATEGORY_SLUGS[slug] as TrendCategory | undefined;
  if (!category) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8 border-b border-[var(--line)] pb-6">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-2">
            <span>Trending Discovery</span>
            <span>·</span>
            <span>Vertical Lane</span>
          </div>
          <h1 className="chart-title text-5xl sm:text-7xl">{TREND_CATEGORY_LABELS[category]}</h1>
          <p className="mt-3 text-sm text-[var(--ink-muted)] max-w-2xl leading-relaxed">
            {CATEGORY_BLURBS[category] || 'Curated editorial topics and momentum in this vertical.'}
          </p>
        </div>
        <TrendingExplorer category={category} />
      </main>
      <PublicFooter />
    </div>
  );
}
