export type TrendCategory =
  | 'music'
  | 'news'
  | 'internet_culture'
  | 'entertainment'
  | 'technology'
  | 'sports_gaming';

export type TrendRegion = 'india' | 'global' | 'both';

export type TrendSort = 'popular' | 'rising' | 'new';

export type TrendStatus = 'popular' | 'rising' | 'new';

export interface TrendCard {
  id: string;
  title: string;
  slug: string;
  category: TrendCategory;
  region: TrendRegion;
  summary: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  sourceLabel: string;
  status: TrendStatus;
  publishedAt: string | null;
  observedAt: string;
}

export interface TrendCategoryCount {
  category: TrendCategory;
  count: number;
}

export type MusicCollection =
  | 'trending'
  | 'viral'
  | 'emerging'
  | 'india_chart'
  | 'global_chart'
  | 'new_release'
  | 'on_repeat';

export interface MusicTrackCard {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  region: TrendRegion;
  collections: MusicCollection[];
  popularityScore: number | null;
  creatorUsageCount: number | null;
  sourceLabel: string;
  observedAt: string;
}

export type PulseKind = 'song' | 'story' | 'trend' | 'creator' | 'moment';

export interface DailyPulseItemCard {
  kind: PulseKind;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sourceLabel: string;
}

export interface DailyPulseDay {
  date: string;
  items: DailyPulseItemCard[];
}

export interface VisitDiff {
  newTrendTopics: number;
  newMusicTracks: number;
  creatorMoves: {
    username: string;
    displayName: string;
    direction: 'up' | 'down';
    delta: number;
  }[];
  newProfiles: number;
  significantStories: { title: string; category: string }[];
}

export const TREND_CATEGORY_SLUGS: Record<string, TrendCategory> = {
  music: 'music',
  news: 'news',
  'internet-culture': 'internet_culture',
  entertainment: 'entertainment',
  technology: 'technology',
  'sports-gaming': 'sports_gaming',
};

export const TREND_CATEGORY_LABELS: Record<TrendCategory, string> = {
  music: 'Music',
  news: 'News',
  internet_culture: 'Internet Culture',
  entertainment: 'Entertainment',
  technology: 'Technology',
  sports_gaming: 'Sports & Gaming',
};

export const TREND_CATEGORY_PAGE_SLUGS = [
  'music',
  'news',
  'internet-culture',
  'entertainment',
  'technology',
  'sports-gaming',
] as const;
