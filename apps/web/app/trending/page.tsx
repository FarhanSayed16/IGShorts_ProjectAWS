import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { TrendingExplorer } from '@/components/discovery/trending-explorer';

export const metadata: Metadata = {
  title: 'IGshorts · Trending',
  description:
    'Topics gaining attention across music, news, internet culture, entertainment, technology, and sports.',
  openGraph: {
    title: 'IGshorts · Trending',
    description: 'Browse editorial and attributed trending topics by category and region.',
  },
};

export default function TrendingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="chart-title text-5xl sm:text-7xl mb-8">Trending</h1>
        <TrendingExplorer />
      </main>
      <PublicFooter />
    </div>
  );
}
