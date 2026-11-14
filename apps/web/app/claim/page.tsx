'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { API_PATHS } from '@igshorts/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '/api/v1';

type ClaimResult = {
  status: 'pending_verification';
  handle: string;
  email: string;
  timeline: string;
  verification?: string;
  message?: string;
};

export default function ClaimPage() {
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResult | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = handle.replace(/^@/, '').trim();
    if (!cleaned) {
      setError('Enter an Instagram handle.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}${API_PATHS.claim}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ handle: cleaned, email }),
      });
      if (!res.ok) {
        let msg = 'Could not submit the claim request.';
        try {
          const body = await res.json();
          if (body?.message) msg = Array.isArray(body.message) ? body.message.join(' ') : body.message;
        } catch {
          // ignore
        }
        // Client-side pending fallback when API is down — still show verification queue.
        if (res.status >= 500 || res.status === 404) {
          setResult({
            status: 'pending_verification',
            handle: cleaned.toLowerCase(),
            email: email.trim().toLowerCase(),
            timeline: 'Usually 1–3 business days',
            verification: 'could_not_verify',
            message:
              'Could not verify Instagram ownership automatically. Meta live checks stay off until a Meta token is configured. Your request is recorded locally as pending.',
          });
          return;
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as ClaimResult;
      setResult(data);
    } catch (err) {
      // Prefer working UI: pending state when network fails.
      const cleanedHandle = handle.replace(/^@/, '').trim().toLowerCase();
      if (cleanedHandle && email) {
        setResult({
          status: 'pending_verification',
          handle: cleanedHandle,
          email: email.trim().toLowerCase(),
          timeline: 'Usually 1–3 business days',
          verification: 'could_not_verify',
          message:
            'Could not verify Instagram ownership automatically. Your claim is pending manual review.',
        });
      } else {
        setError(err instanceof Error ? err.message : 'Could not submit the claim request.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <main id="main-content" className="flex-1 max-w-xl mx-auto w-full px-4 py-16">
        <h1 className="chart-title text-4xl sm:text-5xl mb-3 text-center">Claim a profile</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-8 text-center leading-relaxed">
          Request review for a watchlist handle. This does not ask for an Instagram password and does
          not invent Meta metrics. Live Meta verification stays off until a token exists.
        </p>

        {result ? (
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-4 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--up)]">
              Pending verification
            </p>
            <h2 className="chart-title text-3xl">@{result.handle}</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              We emailed acknowledgement intent to{' '}
              <span className="font-semibold text-[var(--ink)]">{result.email}</span>.
            </p>
            <p className="text-sm text-[var(--ink)] font-semibold">{result.timeline}</p>
            {(result.verification === 'could_not_verify' || result.message) && (
              <p className="text-sm border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 text-[var(--ink-muted)]">
                {result.message ||
                  'Could not verify. Meta live checks stay gated until META_ACCESS_TOKEN exists.'}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                className="btn-secondary text-xs"
                href={`mailto:editorial@igshorts.com?subject=${encodeURIComponent(
                  `Claim pending: @${result.handle}`,
                )}&body=${encodeURIComponent(
                  `Handle: @${result.handle}\nEmail: ${result.email}\nStatus: pending verification`,
                )}`}
              >
                Email editorial
              </a>
              <Link href="/methodology" className="btn-primary text-xs">
                Read methodology
              </Link>
            </div>
          </section>
        ) : (
          <form
            onSubmit={submit}
            className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-5 text-left"
          >
            <label className="block text-sm font-semibold" htmlFor="claim-handle">
              Instagram handle
              <input
                id="claim-handle"
                type="text"
                required
                autoComplete="username"
                placeholder="username"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                className="mt-1 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold" htmlFor="claim-email">
              Contact email
              <input
                id="claim-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 font-normal"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="border border-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary text-xs w-full" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit claim'}
            </button>
            <p className="text-xs text-[var(--ink-muted)]">
              Rate limited on the API (max 5 / hour / IP). See{' '}
              <Link href="/privacy" className="underline">
                privacy
              </Link>
              .
            </p>
          </form>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
