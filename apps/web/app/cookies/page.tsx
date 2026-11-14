'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { CookiePreferencesModal } from '@/components/chrome/cookie-preferences-modal';
import { useConsentGuard } from '@/lib/consent/consent-guard';

export default function CookiesPage() {
  const { consent, ready } = useConsentGuard();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="chart-title text-5xl sm:text-7xl mb-3">Cookies</h1>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-10">
          Policy & preferences
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--ink-muted)]">
          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">What we use</h2>
            <p>
              IGshorts does not use third-party advertising cookies. Essential local storage keeps
              the site working (theme and, if you sign in, the account session). Preference and
              analytics storage only run when you opt in.
            </p>
          </section>

          <section>
            <h2 className="chart-title text-2xl text-[var(--ink)] mb-3">Consent flag</h2>
            <p>
              Choices are stored as{' '}
              <code className="font-mono text-[var(--ink)] text-xs">igshorts_cookie_consent</code> in
              localStorage. Essential is always on. Preferences and analytics default off.
            </p>
          </section>

          <section className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="chart-title text-2xl text-[var(--ink)]">Your preferences</h2>
            {!ready ? (
              <p className="text-sm text-[var(--ink-muted)]">Loading…</p>
            ) : (
              <ul className="space-y-2 text-sm text-[var(--ink)]">
                <li>
                  Essential: <span className="font-semibold">On</span>
                </li>
                <li>
                  Preferences:{' '}
                  <span className="font-semibold">{consent.preferences ? 'On' : 'Off'}</span>
                </li>
                <li>
                  Analytics: <span className="font-semibold">{consent.analytics ? 'On' : 'Off'}</span>
                </li>
              </ul>
            )}
            <button type="button" className="btn-primary text-xs" onClick={() => setModalOpen(true)}>
              Manage cookie preferences
            </button>
            <p className="text-xs text-[var(--ink-muted)]">
              See also the <Link href="/privacy" className="underline">privacy note</Link>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
      <CookiePreferencesModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
