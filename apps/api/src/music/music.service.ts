import { Injectable } from '@nestjs/common';
import { MusicCollection, MusicTrackCard, TrendRegion } from '@igshorts/shared';
import { DatabaseService } from '../database/database.service.js';

function toCard(row: {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  region: string;
  collections: string[];
  popularityScore: number | null;
  creatorUsageCount: number | null;
  sourceLabel: string;
  observedAt: Date;
}): MusicTrackCard {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    artworkUrl: row.artworkUrl,
    spotifyUrl: row.spotifyUrl,
    youtubeUrl: row.youtubeUrl,
    region: row.region as TrendRegion,
    collections: row.collections as MusicCollection[],
    popularityScore: row.popularityScore,
    creatorUsageCount: row.creatorUsageCount,
    sourceLabel: row.sourceLabel,
    observedAt: row.observedAt.toISOString(),
  };
}

@Injectable()
export class MusicService {
  constructor(private readonly db: DatabaseService) {}

  async listTracks(options: {
    collection?: string;
    region?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(options.limit ?? 24, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const where: {
      collections?: { has: string };
      OR?: Array<{ region: string }>;
    } = {};

    if (options.collection) {
      where.collections = { has: options.collection };
    }
    if (options.region === 'india' || options.region === 'global') {
      where.OR = [{ region: options.region }, { region: 'both' }];
    }

    const [rows, total] = await Promise.all([
      this.db.musicTrack.findMany({
        where,
        orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.db.musicTrack.count({ where }),
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

  async ticker(limit = 8): Promise<MusicTrackCard[]> {
    const rows = await this.db.musicTrack.findMany({
      orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 30),
    });
    return rows.map(toCard);
  }

  async featured(): Promise<MusicTrackCard | null> {
    const row = await this.db.musicTrack.findFirst({
      where: { collections: { has: 'trending' } },
      orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
    });
    if (row) return toCard(row);
    const fallback = await this.db.musicTrack.findFirst({
      orderBy: [{ popularityScore: 'desc' }, { observedAt: 'desc' }],
    });
    return fallback ? toCard(fallback) : null;
  }
}
