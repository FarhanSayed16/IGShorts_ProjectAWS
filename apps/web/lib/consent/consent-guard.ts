'use client';

import { useCallback, useEffect, useState } from 'react';

export const CONSENT_STORAGE_KEY = 'igshorts_cookie_consent';

export type CookieConsent = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
};

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  preferences: false,
  analytics: false,
};

function parseConsent(raw: string | null): CookieConsent {
  if (!raw) return { ...DEFAULT_CONSENT };
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return {
      essential: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
    };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

export function readCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') return { ...DEFAULT_CONSENT };
  return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
}

export function writeCookieConsent(next: Omit<CookieConsent, 'essential'> & { essential?: true }) {
  if (typeof window === 'undefined') return;
  const value: CookieConsent = {
    essential: true,
    preferences: Boolean(next.preferences),
    analytics: Boolean(next.analytics),
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('igshorts-consent', { detail: value }));
}

export function canUsePreferenceStorage(consent?: CookieConsent): boolean {
  const c = consent ?? readCookieConsent();
  return c.preferences === true;
}

export function canUseAnalyticsStorage(consent?: CookieConsent): boolean {
  const c = consent ?? readCookieConsent();
  return c.analytics === true;
}

export function useConsentGuard() {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readCookieConsent());
    setReady(true);
    const onChange = () => setConsent(readCookieConsent());
    window.addEventListener('igshorts-consent', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('igshorts-consent', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const refresh = useCallback(() => {
    setConsent(readCookieConsent());
  }, []);

  const save = useCallback((next: Omit<CookieConsent, 'essential'> & { essential?: true }) => {
    writeCookieConsent(next);
    setConsent(readCookieConsent());
  }, []);

  return {
    consent,
    ready,
    refresh,
    save,
    canUsePreferenceStorage: canUsePreferenceStorage(consent),
    canUseAnalyticsStorage: canUseAnalyticsStorage(consent),
  };
}
