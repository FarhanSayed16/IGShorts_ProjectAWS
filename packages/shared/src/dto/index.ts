import {
  AlgorithmVersion,
  ChartKey,
  DataSourceCode,
  EntityType,
  ErrorCode,
} from '../constants/index.js';

/**
 * Public Chart Entry (Row in Leaderboard)
 */
export interface ChartEntry {
  rank: number;
  previous_rank: number | null;
  rank_delta: number; // positive = moved up, negative = moved down, 0 = no change
  display_name: string;
  username: string;
  avatar_url: string | null;
  profile_url: string;
  category: string | null;
  country_region: string | null;
  entity_type: EntityType;
  follower_count: number | null;
  previous_follower_count: number | null;
  /** Null when there is no previous count. Never treat missing as zero. */
  follower_delta: number | null;
  observed_at: string; // ISO date string
  source: DataSourceCode | string;
}

/**
 * Chart Metadata (Status Ribbon / Header)
 */
export interface ChartMeta {
  chart_key: ChartKey;
  title: string;
  description: string;
  algorithm_version: AlgorithmVersion;
  as_of: string; // ISO date string
  total_profiles: number;
  ranked_profiles: number;
  source_label: string;
  freshness_hours: number;
  is_stale: boolean;
}

/**
 * Movers (Biggest gainers and losers)
 */
export interface ChartMovers {
  chart_key: ChartKey;
  as_of: string;
  gainers: ChartEntry[];
  losers: ChartEntry[];
}

/**
 * Public Profile Card / Detail
 */
export interface ProfilePublic {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  profile_url: string;
  category: string | null;
  country_region: string | null;
  entity_type: EntityType;
  is_verified_handle: boolean;
  follower_count: number | null;
  follower_delta: number | null;
  observed_at: string | null;
  ranks: {
    chart_key: ChartKey;
    rank: number;
    previous_rank: number | null;
    rank_delta: number;
  }[];
}

/**
 * Historical Data Point for Sparklines / Trendlines
 */
export interface HistoryDataPoint {
  observed_at: string;
  follower_count: number | null;
  rank: number | null;
}

/**
 * Profile History Response
 */
export interface ProfileHistoryResponse {
  username: string;
  metric_name: string;
  data: HistoryDataPoint[];
}

/**
 * Pagination & Search Query Parameters
 */
export interface ChartQueryDto {
  limit?: number;
  offset?: number;
  category?: string;
  q?: string;
}

/**
 * Standard Paginated Response Envelope
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * Standard API Success Envelope
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Standard API Error Shape
 */
export interface ApiErrorResponse {
  success: false;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown> | Array<unknown> | null;
  timestamp: string;
}
