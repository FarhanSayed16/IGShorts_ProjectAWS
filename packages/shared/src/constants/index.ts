/**
 * IGshorts Product & Engineering Constants
 */

export const CHART_KEYS = {
  GLOBAL_PERSONS: 'global_persons',
  INDIA_PERSONS: 'india_persons',
} as const;

export type ChartKey = (typeof CHART_KEYS)[keyof typeof CHART_KEYS];

export const CHART_KEY_VALUES: ChartKey[] = [CHART_KEYS.GLOBAL_PERSONS, CHART_KEYS.INDIA_PERSONS];

export function isChartKey(value: string): value is ChartKey {
  return (CHART_KEY_VALUES as string[]).includes(value);
}

export const ALGORITHM_VERSIONS = {
  FOLLOWERS_V1: 'followers_v1',
  SCORING_V2: 'scoring_v2', // Future weighted score
} as const;

export type AlgorithmVersion = (typeof ALGORITHM_VERSIONS)[keyof typeof ALGORITHM_VERSIONS];

export const ENTITY_TYPES = {
  PERSON: 'person',
  BRAND: 'brand',
  TEAM: 'team',
  PLATFORM: 'platform',
  OTHER: 'other',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const CHART_SCOPES = {
  INDIA: 'india',
  GLOBAL: 'global',
} as const;

export type ChartScope = (typeof CHART_SCOPES)[keyof typeof CHART_SCOPES];

export const DATA_SOURCES = {
  SEED_XLSX: 'seed_xlsx',
  META_GRAPH: 'meta_graph',
  EDITORIAL: 'editorial',
  VENDOR: 'vendor',
} as const;

export type DataSourceCode = (typeof DATA_SOURCES)[keyof typeof DATA_SOURCES];

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNRANKED: 'UNRANKED',
  PROVIDER_FAILED: 'PROVIDER_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const API_PATHS = {
  login: '/auth/login',
  adminLogin: '/auth/admin/login',
  me: '/auth/me',
  charts: '/charts',
  chart: (key: string) => `/charts/${key}`,
  chartMeta: (key: string) => `/charts/${key}/meta`,
  chartMovers: (key: string) => `/charts/${key}/movers`,
  profiles: '/profiles',
  profile: (username: string) => `/profiles/${username}`,
  profileHistory: (username: string) => `/profiles/${username}/history`,
  adminOverview: '/admin/overview',
  adminWatchlist: '/admin/watchlist',
  adminImport: '/admin/import',
  adminImportUpload: '/admin/import/upload',
  adminSync: '/admin/ingestion/sync',
  adminRebuild: '/admin/ranking/rebuild',
  adminJobsRun: '/admin/jobs/run',
  internalDailyJob: '/internal/jobs/daily',
} as const;

export const ADMIN_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

/** Unofficial or memorial accounts: keep in DB, hide from public people charts. */
export const LEGACY_HIDE_RULES: { id: string; pattern: RegExp; reason: string }[] = [
  {
    id: 'ranbir_fan',
    pattern: /ranbir.*(fan|official)|fan.*ranbir/i,
    reason: 'Unofficial fan/availability handle, not the person account',
  },
  {
    id: 'danish_zehen',
    pattern: /danish.?zehen/i,
    reason: 'Legacy/memorial row; hide from live people charts',
  },
  {
    id: 'avicii',
    pattern: /(^|[^a-z])avicii([^a-z]|$)/i,
    reason: 'Legacy/memorial row; hide from live people charts',
  },
];

export function legacyHideReason(username: string, displayName?: string | null): string | null {
  const haystack = `${username} ${displayName || ''}`;
  const match = LEGACY_HIDE_RULES.find((rule) => rule.pattern.test(haystack));
  return match?.reason ?? null;
}
