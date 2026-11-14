'use client';

import React, { useEffect, useState } from 'react';
import {
  CookieConsent,
  readCookieConsent,
  writeCookieConsent,
} from '@/lib/consent/consent-guard';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CookiePreferencesModal({ open, onClose }: Props) {
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!open) return;
    const current = readCookieConsent();
    setPreferences(current.preferences);
    setAnalytics(current.analytics);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const save = (next: Pick<CookieConsent, 'preferences' | 'analytics'>) => {
    writeCookieConsent(next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[var(--line)] px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--up)]">
            Cookies
          </p>
          <h2 id="cookie-prefs-title" className="chart-title text-2xl mt-1">
            Preferences
          </h2>
          <p className="mt-2 text-xs text-[var(--ink-muted)] leading-relaxed">
            Stored as <code className="font-mono text-[var(--ink)]">igshorts_cookie_consent</code> in
            localStorage. Essential stays on.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <label className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">Essential</span>
              <span className="block text-xs text-[var(--ink-muted)] mt-0.5">
                Required for theme, session, and core site function.
              </span>
            </span>
            <input type="checkbox" checked disabled className="mt-1 accent-[var(--up)]" />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-semibold">Preferences</span>
              <span className="block text-xs text-[var(--ink-muted)] mt-0.5">
                Remember non-essential UI choices beyond essentials.
              </span>
            </span>
            <input
              type="checkbox"
              checked={preferences}
              onChange={(event) => setPreferences(event.target.checked)}
              className="mt-1 accent-[var(--up)]"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-semibold">Analytics</span>
              <span className="block text-xs text-[var(--ink-muted)] mt-0.5">
                Anonymous page and chart events. Never on /admin paths.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 accent-[var(--up)]"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-5 py-4">
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => save({ preferences: false, analytics: false })}
          >
            Reject optional
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => save({ preferences: true, analytics: true })}
          >
            Accept all
          </button>
          <button
            type="button"
            className="btn-primary text-xs ml-auto"
            onClick={() => save({ preferences, analytics })}
          >
            Save choices
          </button>
        </div>
      </div>
    </div>
  );
}
