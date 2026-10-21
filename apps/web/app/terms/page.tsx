import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for the IGshorts public people charts.',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-3">Terms</h1>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-10">
          Last updated October 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--ink-muted)]">
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Editorial use</h2>
            <p>
              Rankings and follower counts are for editorial and research use. Handles and brand
              names belong to their owners. IGshorts is independent and is not affiliated with
              Instagram or Meta Platforms, Inc.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">No harvesting</h2>
            <p>
              Do not scrape or flood the public site or API. Programmatic access is only via
              authorized endpoints.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">As-is snapshots</h2>
            <p>
              Counts are point-in-time. They can lag. The service is provided as-is, without a
              warranty of uninterrupted availability.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
