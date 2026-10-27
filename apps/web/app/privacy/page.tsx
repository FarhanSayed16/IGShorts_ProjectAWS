import React from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How IGshorts handles public chart data and visitor privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-3">Privacy</h1>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-10">
          Last updated October 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--ink-muted)]">
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Public data only</h2>
            <p>
              IGshorts tracks publicly visible follower counts, display names, and handles for
              people on a curated watchlist. We do not request private messages, stories,
              non-public accounts, or identity documents.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Visitors</h2>
            <p>
              We do not sell visitor data. Access logs and anonymous analytics may be used to keep
              the site secure and within rate limits.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Email accounts</h2>
            <p>
              An optional email and password let you see a stored follower count, track a saved
              profile, and keep that history. The audience group stays visible without an account.
              The email does not prove you own an Instagram handle. We do not ask for an Instagram
              password. You can delete the account from the account page, which removes the email
              and the tracks tied to it.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Cookies</h2>
            <p>
              No third-party tracking cookies. Client storage is for preferences such as theme and, if you sign in, the account session.
            </p>
          </section>
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Contact</h2>
            <p>
              Privacy or watchlist questions:{' '}
              <span className="font-mono text-[var(--ink)]">editorial@igshorts.com</span>
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
