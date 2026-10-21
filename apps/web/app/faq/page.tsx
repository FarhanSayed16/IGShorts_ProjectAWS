import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { fetchProfiles } from '@/lib/api/client';
import copy from '@/messages/en.json';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'How IGshorts ranks public Instagram people, and what we do not claim.',
};

export default async function FAQPage() {
  let watchlistSize: number | null = null;
  try {
    const res = await fetchProfiles({ limit: 1, offset: 0 });
    watchlistSize = res.meta.total;
  } catch {
    watchlistSize = null;
  }

  const sizeCopy =
    watchlistSize != null ? `${watchlistSize} tracked accounts` : 'a curated watchlist';

  const faqs = [
    { q: copy.faq.official_q, a: copy.faq.official_a },
    { q: copy.faq.impressions_q, a: copy.faq.impressions_a },
    {
      q: 'Why isn’t someone on the board?',
      a: `This is a watchlist chart, not all of Instagram. We currently list ${sizeCopy}.`,
    },
    {
      q: 'Where are brands like Nike?',
      a: 'Default charts are persons-only. Brands and teams are cataloged separately.',
    },
    {
      q: 'What does “listed, not yet ranked” mean?',
      a: 'They are on the watchlist, but we do not have a verified follower snapshot yet. Missing stays blank.',
    },
    {
      q: 'How often does this update?',
      a: 'On each observation run. The as-of date on the chart is the source of truth.',
    },
    {
      q: 'How are ties handled?',
      a: 'Competition rank: 1, 2, 2, 4. Equal follower counts share a rank.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-8">FAQ</h1>

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-[var(--ink)]">
                {faq.q}
                <span className="text-[var(--ink-faint)] group-open:hidden">+</span>
                <span className="text-[var(--ink-faint)] hidden group-open:inline">–</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-10">
          <Link href="/methodology" className="text-sm font-bold uppercase tracking-[0.16em] underline underline-offset-4">
            Full methodology
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
