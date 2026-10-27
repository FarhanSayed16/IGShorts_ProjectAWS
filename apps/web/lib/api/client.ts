import {
  API_PATHS,
  ChartEntry,
  ChartKey,
  ChartMeta,
  ChartMovers,
  ProfileHistoryResponse,
} from '@igshorts/shared';

function resolveApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (typeof window === 'undefined') {
    return (
      process.env.API_INTERNAL_URL?.replace(/\/+$/, '') ||
      publicUrl ||
      'http://localhost:4000/api/v1'
    );
  }
  return publicUrl || '/api/v1';
}

const API_BASE_URL = resolveApiBaseUrl();

export interface ChartEntriesResponse {
  chartKey: string;
  as_of: string;
  entries: ChartEntry[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface AvailableChart {
  key: string;
  title: string;
  description: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMessage = `API request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // ignore json parse error on non-json body
      }
      throw new ApiClientError(errorMessage, res.status, false);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiClientError(`Unable to reach IGshorts API: ${message}`, undefined, true);
  }
}

/**
 * Fetch available charts metadata
 */
export async function fetchAvailableCharts(): Promise<AvailableChart[]> {
  return request<AvailableChart[]>(API_PATHS.charts, { next: { revalidate: 60 } } as RequestInit);
}

/**
 * Fetch entries for a specific chart with pagination, category filter, and search
 */
export async function fetchChartEntries(
  chartKey: string,
  params?: {
    limit?: number;
    offset?: number;
    category?: string;
    q?: string;
  },
): Promise<ChartEntriesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.q) searchParams.set('q', params.q);

  const query = searchParams.toString();
  const endpoint = `${API_PATHS.chart(chartKey)}${query ? `?${query}` : ''}`;
  return request<ChartEntriesResponse>(endpoint, { cache: 'no-store' });
}

/**
 * Fetch metadata for a chart (status ribbon, algorithm, freshness)
 */
export async function fetchChartMeta(chartKey: ChartKey | string): Promise<ChartMeta> {
  return request<ChartMeta>(API_PATHS.chartMeta(chartKey), { cache: 'no-store' });
}

/**
 * Fetch top movers (gainers and decliners) for a chart
 */
export async function fetchAudienceMix(chartKey?: string): Promise<import('@/components/rank/group-mix').GroupMixData> {
  const query = chartKey ? `?chartKey=${encodeURIComponent(chartKey)}` : '';
  return request(`/analytics/groups${query}`, { cache: 'no-store' });
}

export async function fetchChartMovers(chartKey: ChartKey | string): Promise<ChartMovers> {
  return request<ChartMovers>(API_PATHS.chartMovers(chartKey), { cache: 'no-store' });
}

/**
 * Fetch metric history for a specific profile
 */
export async function fetchProfileHistory(username: string): Promise<ProfileHistoryResponse> {
  return request<ProfileHistoryResponse>(API_PATHS.profileHistory(username), {
    cache: 'no-store',
  });
}

export interface ProfileDetail {
  id: string;
  username: string;
  igUsername: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string | null;
  category: string | null;
  countryRegion: string | null;
  entityType: string;
  isVerifiedHandle: boolean;
  isListed: boolean;
  isActive: boolean;
  createdAt: string;
  shortBio: string | null;
  avatarSource: string | null;
  scopes: { scope: string }[];
  latestFollowerCount: number | null;
  observedAt: string | null;
  source: string | null;
  rankingEntries?: {
    rank: number;
    previousRank: number | null;
    rankDelta: number;
    chartKey: string;
    metricValue: number | null;
  }[];
}

export interface ProfilesListResponse {
  data: (ProfileDetail & { latestFollowerCount: number | null })[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * Fetch creators from watchlist directory
 */
export async function fetchProfiles(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  entityType?: string;
  scope?: string;
  q?: string;
}): Promise<ProfilesListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.entityType) searchParams.set('entityType', params.entityType);
  if (params?.scope) searchParams.set('scope', params.scope);
  if (params?.q) searchParams.set('q', params.q);

  const query = searchParams.toString();
  return request<ProfilesListResponse>(`${API_PATHS.profiles}${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });
}

/**
 * Fetch individual creator profile by username
 */
export async function fetchProfile(username: string): Promise<ProfileDetail> {
  return request<ProfileDetail>(API_PATHS.profile(username), {
    cache: 'no-store',
  });
}
