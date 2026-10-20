import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CHART_KEYS,
  ChartEntry,
  ChartKey,
  ChartMeta,
  ChartMovers,
  DATA_SOURCES,
  HistoryDataPoint,
  isChartKey,
  ProfileHistoryResponse,
} from '@igshorts/shared';
import { LATEST_NON_NULL_FOLLOWERS } from '../common/db/snapshot-query.js';
import { DatabaseService } from '../database/database.service.js';

const SOURCE_LABELS: Record<string, string> = {
  seed_xlsx: 'Seed list',
  meta_graph: 'Meta Graph',
  editorial: 'Editorial',
  vendor: 'Licensed vendor',
};

function bigintToNumber(value: bigint | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

@Injectable()
export class ChartsService {
  constructor(private readonly db: DatabaseService) {}

  getAvailableCharts() {
    return [
      {
        key: CHART_KEYS.GLOBAL_PERSONS,
        title: 'Global Top Persons',
        description: 'Famous global Instagram personalities ranked by public follower count',
      },
      {
        key: CHART_KEYS.INDIA_PERSONS,
        title: 'India Top Persons',
        description:
          'Leading Indian Instagram creators and personalities ranked by public follower count',
      },
    ];
  }

  private assertChartKey(chartKey: string): ChartKey {
    if (!isChartKey(chartKey)) {
      throw new BadRequestException(`Unknown chart key: ${chartKey}`);
    }
    return chartKey;
  }

  private formatEntry(entry: {
    rank: number;
    previousRank: number | null;
    rankDelta: number;
    metricValue: bigint | null;
    previousMetricValue: bigint | null;
    metricDelta: bigint;
    createdAt: Date;
    profile: {
      displayName: string;
      igUsername: string;
      avatarUrl: string | null;
      profileUrl: string;
      category: string | null;
      countryRegion: string | null;
      entityType: string;
      metricSnapshots?: Array<{
        observedAt: Date;
        source?: { code: string } | null;
      }>;
    };
  }): ChartEntry {
    const snapshot = entry.profile.metricSnapshots?.[0];
    return {
      rank: entry.rank,
      previous_rank: entry.previousRank,
      rank_delta: entry.rankDelta,
      display_name: entry.profile.displayName,
      username: entry.profile.igUsername,
      avatar_url: entry.profile.avatarUrl,
      profile_url: entry.profile.profileUrl,
      category: entry.profile.category,
      country_region: entry.profile.countryRegion,
      entity_type: entry.profile.entityType as ChartEntry['entity_type'],
      follower_count: bigintToNumber(entry.metricValue),
      previous_follower_count: bigintToNumber(entry.previousMetricValue),
      follower_delta: Number(entry.metricDelta),
      observed_at: (snapshot?.observedAt || entry.createdAt).toISOString(),
      source: snapshot?.source?.code || DATA_SOURCES.SEED_XLSX,
    };
  }

  async getChartEntries(
    chartKey: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      q?: string;
    } = {},
  ) {
    const validKey = this.assertChartKey(chartKey);
    const { limit = 50, offset = 0, category, q } = options;

    // Find the latest successful run for this chart key
    const latestRun = await this.db.rankingRun.findFirst({
      where: {
        chartKey: validKey,
        status: 'success',
      },
      orderBy: { finishedAt: 'desc' },
    });

    if (!latestRun) {
      return {
        chartKey: validKey,
        as_of: new Date().toISOString(),
        entries: [],
        meta: {
          total: 0,
          limit,
          offset,
          has_more: false,
        },
      };
    }

    const where: any = {
      runId: latestRun.id,
    };

    if (category) {
      where.profile = {
        category,
      };
    }

    if (q) {
      where.profile = {
        ...where.profile,
        OR: [
          { igUsername: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const [entries, total] = await Promise.all([
      this.db.rankingEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { rank: 'asc' },
        include: {
          profile: {
            include: {
              metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
            },
          },
        },
      }),
      this.db.rankingEntry.count({ where }),
    ]);

    const formattedEntries: ChartEntry[] = entries.map((entry) => this.formatEntry(entry));

    return {
      chartKey: validKey,
      as_of: latestRun.finishedAt?.toISOString() || latestRun.startedAt.toISOString(),
      entries: formattedEntries,
      meta: {
        total,
        limit,
        offset,
        has_more: offset + entries.length < total,
      },
    };
  }

  async getChartMeta(chartKey: ChartKey | string): Promise<ChartMeta> {
    const validKey = this.assertChartKey(chartKey);
    const isIndia = validKey === CHART_KEYS.INDIA_PERSONS;
    const scope = isIndia ? 'india' : 'global';

    const latestRun = await this.db.rankingRun.findFirst({
      where: {
        chartKey: validKey,
        status: 'success',
      },
      orderBy: { finishedAt: 'desc' },
    });

    const totalProfilesInScope = await this.db.creatorProfile.count({
      where: {
        isListed: true,
        isActive: true,
        scopes: { some: { scope } },
      },
    });

    const now = Date.now();
    const runDate = latestRun?.finishedAt || latestRun?.startedAt || new Date();
    const freshnessHours = Math.max(0, Math.round((now - runDate.getTime()) / (1000 * 60 * 60)));

    const sourceCode =
      latestRun === null
        ? DATA_SOURCES.SEED_XLSX
        : (
            await this.db.rankingEntry.findFirst({
              where: { runId: latestRun.id },
              include: {
                profile: {
                  include: {
                    metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
                  },
                },
              },
            })
          )?.profile.metricSnapshots[0]?.source?.code || DATA_SOURCES.SEED_XLSX;

    return {
      chart_key: validKey,
      title: isIndia ? 'India Top Persons' : 'Global Top Persons',
      description: isIndia
        ? 'Famous Indian Instagram personalities ranked by public follower count'
        : 'Famous global Instagram personalities ranked by public follower count',
      algorithm_version: 'followers_v1',
      as_of: runDate.toISOString(),
      total_profiles: totalProfilesInScope,
      ranked_profiles: latestRun?.profileCount || 0,
      source_label: SOURCE_LABELS[sourceCode] || sourceCode,
      freshness_hours: freshnessHours,
      is_stale: !latestRun || freshnessHours > 36,
    };
  }

  async getChartMovers(chartKey: ChartKey | string): Promise<ChartMovers> {
    const validKey = this.assertChartKey(chartKey);
    const latestRun = await this.db.rankingRun.findFirst({
      where: {
        chartKey: validKey,
        status: 'success',
      },
      orderBy: { finishedAt: 'desc' },
    });

    const previousRun = latestRun
      ? await this.db.rankingRun.findFirst({
          where: {
            chartKey: validKey,
            status: 'success',
            id: { not: latestRun.id },
          },
          orderBy: { finishedAt: 'desc' },
        })
      : null;

    if (!latestRun || !previousRun) {
      return {
        chart_key: validKey,
        as_of: latestRun?.finishedAt?.toISOString() || new Date().toISOString(),
        gainers: [],
        losers: [],
      };
    }

    const snapshotInclude = {
      profile: {
        include: {
          metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
        },
      },
    };

    const [gainersEntries, losersEntries] = await Promise.all([
      this.db.rankingEntry.findMany({
        where: { runId: latestRun.id, rankDelta: { gt: 0 } },
        orderBy: [{ rankDelta: 'desc' }, { metricDelta: 'desc' }],
        take: 5,
        include: snapshotInclude,
      }),
      this.db.rankingEntry.findMany({
        where: { runId: latestRun.id, rankDelta: { lt: 0 } },
        orderBy: [{ rankDelta: 'asc' }, { metricDelta: 'asc' }],
        take: 5,
        include: snapshotInclude,
      }),
    ]);

    return {
      chart_key: validKey,
      as_of: latestRun.finishedAt?.toISOString() || latestRun.startedAt.toISOString(),
      gainers: gainersEntries.map((entry) => this.formatEntry(entry)),
      losers: losersEntries.map((entry) => this.formatEntry(entry)),
    };
  }

  async getProfileHistory(
    username: string,
    metricName = 'follower_count',
  ): Promise<ProfileHistoryResponse> {
    const normalized = username.trim().toLowerCase().replace(/^@+/, '');

    const profile = await this.db.creatorProfile.findUnique({
      where: { igUsername: normalized },
      include: {
        metricSnapshots: {
          where: { metricName },
          orderBy: { observedAt: 'asc' },
          take: 50,
        },
        rankingEntries: {
          where: { run: { status: 'success' } },
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { run: true },
        },
      },
    });

    if (!profile || !profile.isListed || !profile.isActive) {
      throw new NotFoundException(`Profile @${normalized} not found`);
    }

    const data: HistoryDataPoint[] = profile.metricSnapshots.map((snapshot) => {
      const matchingRank = profile.rankingEntries.find(
        (re) => Math.abs(re.createdAt.getTime() - snapshot.observedAt.getTime()) < 3600000,
      );

      return {
        observed_at: snapshot.observedAt.toISOString(),
        follower_count: snapshot.metricValue === null ? null : Number(snapshot.metricValue),
        rank: matchingRank ? matchingRank.rank : null,
      };
    });

    return {
      username: normalized,
      metric_name: metricName,
      data,
    };
  }
}
