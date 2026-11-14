'use client';

import { API_PATHS } from '@igshorts/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '/api/v1';

const ADMIN_TOKEN_KEY = 'igshorts_admin_token';
const ADMIN_EMAIL_KEY = 'igshorts_admin_email';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_EMAIL_KEY);
}

export function storeAdminSession(token: string, email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_EMAIL_KEY, email);
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
}

async function adminRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getStoredAdminToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('igshorts-session-expired', { detail: { kind: 'admin' } }),
      );
    }
    throw new Error('Admin session required');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('igshorts-session-expired', { detail: { kind: 'admin' } }),
      );
    }
    throw new Error('Admin session expired');
  }

  if (!res.ok) {
    let msg = `Admin request failed: ${res.statusText}`;
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export async function adminLogin(email: string, password: string) {
  const url = `${API_BASE_URL}${API_PATHS.login}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let msg = 'Invalid admin credentials';
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = await res.json();
  storeAdminSession(data.accessToken, data.user?.email || email);
  return data;
}

export async function getAdminOverview() {
  return adminRequest<{
    totalProfiles: number;
    listedProfiles: number;
    unlistedProfiles: number;
    rankedProfiles: number;
    unrankedProfiles: number;
    dataSources: number;
    latestGlobalRun: { id: string; profileCount: number; finishedAt: string } | null;
    latestIndiaRun: { id: string; profileCount: number; finishedAt: string } | null;
    hoursSinceLastRun: number | null;
    isStale: boolean;
    recentAuditCount: number;
    systemStatus: string;
    timestamp: string;
    /** Present when API exposes Render/cron config */
    cronEnabled?: boolean;
  }>('/admin/overview');
}

export async function getAdminWatchlist(params?: {
  limit?: number;
  offset?: number;
  q?: string;
  category?: string;
  entityType?: string;
  scope?: string;
  isListed?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.entityType) searchParams.set('entityType', params.entityType);
  if (params?.scope) searchParams.set('scope', params.scope);
  if (params?.isListed !== undefined) searchParams.set('isListed', String(params.isListed));

  const query = searchParams.toString();
  return adminRequest<{
    data: Array<{
      id: string;
      igUsername: string;
      displayName: string;
      profileUrl: string;
      avatarUrl: string | null;
      category: string | null;
      countryRegion: string | null;
      entityType: string;
      isListed: boolean;
      isActive: boolean;
      scopes: string[];
      latestFollowerCount: number | null;
      createdAt: string;
    }>;
    meta: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  }>(`/admin/watchlist${query ? `?${query}` : ''}`);
}

export async function createWatchlistProfile(data: {
  igUsername: string;
  displayName: string;
  category?: string;
  countryRegion?: string;
  entityType?: string;
  scopes?: string[];
}) {
  return adminRequest('/admin/watchlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWatchlistProfile(
  id: string,
  data: {
    displayName?: string;
    category?: string;
    countryRegion?: string;
    entityType?: string;
    isListed?: boolean;
    scopes?: string[];
  },
) {
  return adminRequest(`/admin/watchlist/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function toggleWatchlistListed(id: string, isListed: boolean) {
  return adminRequest(`/admin/watchlist/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ isListed }),
  });
}

export async function uploadSeedImport(file: File) {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error('Admin session required');
  }
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE_URL}${API_PATHS.adminImportUpload}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: form,
  });
  if (!res.ok) {
    let msg = 'Import upload failed';
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<{
    status: string;
    createdProfiles: number;
    mergedProfiles: number;
    skipped: number;
    missingFollowerCounts: number;
    badUsernames: string[];
    totalRowsParsed: number;
    durationMs: number;
  }>;
}

export async function triggerSeedImport(filePath?: string) {
  return adminRequest<{
    status: string;
    createdProfiles: number;
    mergedProfiles: number;
    skipped: number;
    missingFollowerCounts: number;
    badUsernames: string[];
    totalRowsParsed: number;
    durationMs: number;
    error?: string;
  }>('/admin/import', {
    method: 'POST',
    body: JSON.stringify({ filePath }),
  });
}

export async function triggerWatchlistSync(usernames?: string[]) {
  return adminRequest<{
    provider: string;
    total: number;
    synced: number;
    skipped: number;
    failed: number;
    failedHandles: string[];
  }>('/admin/ingestion/sync', {
    method: 'POST',
    body: JSON.stringify({ usernames }),
  });
}

export async function triggerDailyPipeline(usernames?: string[]) {
  return adminRequest('/admin/jobs/run', {
    method: 'POST',
    body: JSON.stringify({ usernames }),
  });
}

export async function triggerRebuildRankings(chartKey?: string) {
  return adminRequest('/admin/ranking/rebuild', {
    method: 'POST',
    body: JSON.stringify({ chartKey }),
  });
}

export async function getAdminRankingRuns() {
  return adminRequest<
    Array<{
      id: string;
      chartKey: string;
      status: string;
      profileCount: number;
      algorithmVersion: string;
      startedAt: string;
      finishedAt: string | null;
      error: string | null;
    }>
  >('/admin/ranking/runs');
}

export async function getAdminJobRuns() {
  return adminRequest<
    Array<{
      id: string;
      jobName: string;
      status: string;
      startedAt: string;
      finishedAt: string | null;
      stats: string | null;
      error: string | null;
    }>
  >('/admin/jobs');
}

export async function getAdminAuditLogs() {
  return adminRequest<
    Array<{
      id: string;
      actor: string;
      action: string;
      entityType: string | null;
      entityId: string | null;
      beforeSummary: string | null;
      afterSummary: string | null;
      createdAt: string;
    }>
  >('/admin/audit');
}

export async function triggerWikipediaEnrichment() {
  return adminRequest<{
    scanned?: number;
    updated?: number;
    skipped?: number;
    failed?: number;
    [key: string]: unknown;
  }>('/admin/enrichment/wikipedia', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function triggerDiscoveryRefresh() {
  return adminRequest<Record<string, unknown>>('/admin/jobs/discovery', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export type ScheduleIntent = {
  jobKey: string;
  label: string;
  cronExpr: string;
  intentTime: string;
  description: string;
  runEndpoint: 'pipeline' | 'discovery';
  enabledByDefault: boolean;
  enabled?: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  lastStatus?: string | null;
  lastError?: string | null;
  disabledByEnv?: boolean;
  disabledByOperator?: boolean;
};

export async function getAdminSchedules() {
  return adminRequest<{
    cronEnabled: boolean;
    note?: string;
    intents: ScheduleIntent[];
  }>('/admin/schedules');
}

export async function setAdminScheduleEnabled(jobKey: string, enabled: boolean) {
  return adminRequest(`/admin/schedules/${encodeURIComponent(jobKey)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export async function getAdminMembers(params?: { limit?: number; offset?: number; q?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params?.q) searchParams.set('q', params.q);
  const query = searchParams.toString();
  return adminRequest<{
    data: Array<{
      id: string;
      email: string;
      createdAt: string;
      lastVisitedAt: string | null;
      trackCount: number;
    }>;
    meta: { total: number; limit: number; offset: number; has_more: boolean };
  }>(`/admin/members${query ? `?${query}` : ''}`);
}

export async function updateMusicPreviewUrl(id: string, previewAudioUrl: string | null) {
  return adminRequest(`/admin/music/${id}/preview`, {
    method: 'PATCH',
    body: JSON.stringify({ previewAudioUrl }),
  });
}

export async function getAdminAnalyticsSummary() {
  return adminRequest<{
    total: number;
    byType: Record<string, number>;
    available: boolean;
  }>('/admin/analytics/summary');
}

export async function recordEditorialMetric(
  profileId: string,
  data: { followerCount: number; note: string },
) {
  return adminRequest(`/admin/watchlist/${profileId}/editorial-metric`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
