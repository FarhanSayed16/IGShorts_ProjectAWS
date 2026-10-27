import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@igshorts/db';
import { ChartKey } from '@igshorts/shared';
import { LATEST_NON_NULL_FOLLOWERS, preferredFollowerSnapshot } from '../common/db/snapshot-query.js';
import { DatabaseService } from '../database/database.service.js';

function bigintToNumber(value: bigint | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export interface PublicProfileDto {
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
  rankingEntries: {
    rank: number;
    previousRank: number | null;
    rankDelta: number;
    chartKey: ChartKey | string;
    metricValue: number | null;
  }[];
}

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DatabaseService) {}

  normalizeUsername(username: string): string {
    return username.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '').replace(/\/+$/, '');
  }

  private toPublicDto(
    profile: {
      id: string;
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
      createdAt: Date;
      shortBio?: string | null;
      avatarSource?: string | null;
      scopes: { scope: string }[];
      metricSnapshots: Array<{
        metricValue: bigint | null;
        observedAt: Date;
        source?: { code: string } | null;
      }>;
      rankingEntries?: Array<{
        rank: number;
        previousRank: number | null;
        rankDelta: number;
        metricValue: bigint | null;
        run?: { chartKey: string; status: string };
      }>;
    },
    listedOnly = true,
  ): PublicProfileDto | null {
    if (listedOnly && (!profile.isListed || !profile.isActive)) {
      return null;
    }
    const latest = preferredFollowerSnapshot(profile.metricSnapshots);
    const latestSuccessRanks = (profile.rankingEntries || []).filter(
      (entry) => entry.run?.status === 'success',
    );
    const seen = new Set<string>();
    const rankingEntries = latestSuccessRanks.filter((entry) => {
      const key = entry.run?.chartKey || '';
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      id: profile.id,
      username: profile.igUsername,
      igUsername: profile.igUsername,
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      avatarUrl: profile.avatarUrl,
      category: profile.category,
      countryRegion: profile.countryRegion,
      entityType: profile.entityType,
      isVerifiedHandle: profile.isVerifiedHandle,
      isListed: profile.isListed,
      isActive: profile.isActive,
      createdAt: profile.createdAt.toISOString(),
      shortBio: profile.shortBio ?? null,
      avatarSource: profile.avatarSource ?? null,
      scopes: profile.scopes,
      latestFollowerCount: bigintToNumber(latest?.metricValue),
      observedAt: latest?.observedAt?.toISOString() ?? null,
      source: latest?.source?.code ?? null,
      rankingEntries: rankingEntries.map((entry) => ({
        rank: entry.rank,
        previousRank: entry.previousRank,
        rankDelta: entry.rankDelta,
        chartKey: entry.run?.chartKey || '',
        metricValue: bigintToNumber(entry.metricValue),
      })),
    };
  }

  async findByUsername(username: string) {
    const normalized = this.normalizeUsername(username);
    const profile = await this.db.creatorProfile.findUnique({
      where: { igUsername: normalized },
      include: {
        scopes: true,
        metricSnapshots: {
          ...LATEST_NON_NULL_FOLLOWERS,
          take: 10,
        },
        rankingEntries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            run: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile @${normalized} not found in watchlist`);
    }

    const dto = this.toPublicDto(profile, true);
    if (!dto) {
      throw new NotFoundException(`Profile @${normalized} not found in watchlist`);
    }
    return dto;
  }

  async listProfiles(params: {
    limit?: number;
    offset?: number;
    category?: string;
    entityType?: string;
    scope?: string;
    q?: string;
  }) {
    const { limit = 50, offset = 0, category, entityType, scope, q } = params;

    const filters = [
      Prisma.sql`p.is_listed = TRUE`,
      Prisma.sql`p.is_active = TRUE`,
    ];
    if (category) filters.push(Prisma.sql`p.category = ${category}`);
    if (entityType) filters.push(Prisma.sql`p.entity_type = ${entityType}`);
    if (scope) {
      filters.push(
        Prisma.sql`EXISTS (SELECT 1 FROM profile_scopes sc WHERE sc.profile_id = p.id AND sc.scope = ${scope})`,
      );
    }
    if (q) {
      const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
      filters.push(
        Prisma.sql`(p.ig_username ILIKE ${like} ESCAPE '\\' OR p.display_name ILIKE ${like} ESCAPE '\\')`,
      );
    }
    const whereSql = Prisma.join(filters, ' AND ');
    const [idRows, countRows] = await Promise.all([
      this.db.$queryRaw<Array<{ id: string }>>`
        SELECT p.id
        FROM creator_profiles p
        LEFT JOIN LATERAL (
          SELECT s.metric_value
          FROM metric_snapshots s
          INNER JOIN data_sources d ON d.id = s.source_id
          WHERE s.profile_id = p.id
            AND s.metric_name = 'follower_count'
            AND s.metric_value IS NOT NULL
          ORDER BY CASE WHEN d.code = 'fastsocial' THEN 0 ELSE 1 END, s.observed_at DESC
          LIMIT 1
        ) lat ON TRUE
        WHERE ${whereSql}
        ORDER BY lat.metric_value DESC NULLS LAST, p.ig_username ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.db.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*)::bigint AS total
        FROM creator_profiles p
        WHERE ${whereSql}
      `,
    ]);
    const ids = idRows.map((row) => row.id);
    const profiles = ids.length
      ? await this.db.creatorProfile.findMany({
          where: { id: { in: ids } },
          include: {
            scopes: true,
            metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
          },
        })
      : [];
    const byId = new Map(profiles.map((profile) => [profile.id, profile]));
    const ordered = ids.map((id) => byId.get(id)).filter((profile) => profile != null);
    const total = Number(countRows[0]?.total ?? 0);

    return {
      data: ordered.map((p) => this.toPublicDto(p, false)),
      meta: {
        total,
        limit,
        offset,
        has_more: offset + profiles.length < total,
      },
    };
  }

  async setListedStatus(id: string, isListed: boolean) {
    const profile = await this.db.creatorProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile ID ${id} not found`);
    }

    return this.db.creatorProfile.update({
      where: { id },
      data: { isListed },
    });
  }

  async updateProfile(
    id: string,
    data: {
      displayName?: string;
      category?: string;
      countryRegion?: string;
      entityType?: string;
      isListed?: boolean;
    },
  ) {
    const profile = await this.db.creatorProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile ID ${id} not found`);
    }

    return this.db.creatorProfile.update({
      where: { id },
      data,
    });
  }
}
