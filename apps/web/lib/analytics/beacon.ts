'use client';

import { API_PATHS } from '@igshorts/shared';
import { canUseAnalyticsStorage } from '@/lib/consent/consent-guard';

export const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'profile_view',
  'chart_view',
  'music_preview',
  'search',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '/api/v1';

function currentPath(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname}${window.location.search}`;
}

/**
 * Fire-and-forget analytics beacon.
 * Skips when analytics consent is off, on /admin paths, or when offline.
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  options?: { path?: string; meta?: Record<string, unknown> },
): void {
  if (typeof window === 'undefined') return;
  if (!canUseAnalyticsStorage()) return;

  const path = options?.path ?? currentPath();
  if (!path || path.startsWith('/admin')) return;

  const payload = {
    eventType,
    path,
    meta: options?.meta,
  };

  const url = `${API_BASE_URL}${API_PATHS.analyticsEvents}`;
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
