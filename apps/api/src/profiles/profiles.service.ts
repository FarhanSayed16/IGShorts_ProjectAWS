import { Injectable, NotFoundException } from '@nestjs/common';
import { ChartKey } from '@igshorts/shared';
import { LATEST_NON_NULL_FOLLOWERS } from '../common/db/snapshot-query.js';
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
    const latest = profile.metricSnapshots[0];
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

    const where: Record<string, unknown> = {
      isListed: true,
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (scope) {
      where.scopes = {
        some: { scope },
      };
    }

    if (q) {
      where.OR = [
        { igUsername: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [profiles, total] = await Promise.all([
      this.db.creatorProfile.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { igUsername: 'asc' },
        include: {
          scopes: true,
          metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
        },
      }),
      this.db.creatorProfile.count({ where }),
    ]);

    return {
      data: profiles.map((p) => this.toPublicDto(p, false)),
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
