import { Injectable } from '@nestjs/common';
import {
  TrendCard,
  TrendCategory,
  TrendCategoryCount,
  TrendRegion,
  TrendSort,
  TrendStatus,
} from '@igshorts/shared';
import { DatabaseService } from '../database/database.service.js';

function toCard(row: {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  summary: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  sourceLabel: string;
  status: string;
  publishedAt: Date | null;
  observedAt: Date;
}): TrendCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category as TrendCategory,
    region: row.region as TrendRegion,
    summary: row.summary,
    imageUrl: row.imageUrl,
    sourceUrl: row.sourceUrl,
    sourceName: row.sourceName,
    sourceLabel: row.sourceLabel,
    status: row.status as TrendStatus,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    observedAt: row.observedAt.toISOString(),
  };
}

@Injectable()
export class TrendsService {
  constructor(private readonly db: DatabaseService) {}

  async list(options: {
    category?: string;
    region?: string;
    sort?: TrendSort;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(options.limit ?? 24, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);
    const sort = options.sort ?? 'popular';

    const where: {
      category?: string;
      OR?: Array<{ region: string }>;
    } = {};

    if (options.category) where.category = options.category;
    if (options.region === 'india' || options.region === 'global') {
      where.OR = [{ region: options.region }, { region: 'both' }];
    }

    const orderBy =
      sort === 'rising'
        ? [{ velocityScore: 'desc' as const }, { observedAt: 'desc' as const }]
        : sort === 'new'
          ? [{ observedAt: 'desc' as const }]
          : [{ popularityScore: 'desc' as const }, { observedAt: 'desc' as const }];

    const [rows, total] = await Promise.all([
      this.db.trendTopic.findMany({ where, orderBy, take: limit, skip: offset }),
      this.db.trendTopic.count({ where }),
    ]);

    return {
      data: rows.map(toCard),
      meta: {
        total,
        limit,
        offset,
        has_more: offset + rows.length < total,
      },
    };
  }

  async featured(): Promise<TrendCard | null> {
    const row = await this.db.trendTopic.findFirst({
      where: { isFeatured: true },
      orderBy: { observedAt: 'desc' },
    });
    if (row) return toCard(row);
    const fallback = await this.db.trendTopic.findFirst({
      orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
    });
    return fallback ? toCard(fallback) : null;
  }

  async ticker(limit = 10): Promise<TrendCard[]> {
    const rows = await this.db.trendTopic.findMany({
      orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 30),
    });
    return rows.map(toCard);
  }

  async categories(): Promise<TrendCategoryCount[]> {
    const groups = await this.db.trendTopic.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    return groups.map((g) => ({
      category: g.category as TrendCategory,
      count: g._count._all,
    }));
  }
}
