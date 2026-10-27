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
import { LATEST_NON_NULL_FOLLOWERS, preferredFollowerSnapshot } from '../common/db/snapshot-query.js';
import { DatabaseService } from '../database/database.service.js';

const COUNT_FRESH_MS = 14 * 24 * 60 * 60 * 1000;

const SOURCE_LABELS: Record<string, string> = {
  seed_xlsx: 'Seed list',
  fastsocial: 'FastSocial Top Charts',
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
        metricValue: bigint | null;
        observedAt: Date;
        source?: { code: string } | null;
      }>;
    };
  }): ChartEntry {
    const snapshot = preferredFollowerSnapshot(entry.profile.metricSnapshots || []);
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
      follower_count: snapshot ? bigintToNumber(snapshot.metricValue) : bigintToNumber(entry.metricValue),
      previous_follower_count: bigintToNumber(entry.previousMetricValue),
      follower_delta:
        entry.previousMetricValue === null || entry.previousMetricValue === undefined
          ? null
          : Number(entry.metricDelta),
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

    const current = await this.describeCurrentCounts(
      latestRun.id,
      latestRun.finishedAt || latestRun.startedAt,
    );

    return {
      chartKey: validKey,
      as_of: current.asOf.toISOString(),
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
    const fallbackDate = latestRun?.finishedAt || latestRun?.startedAt || new Date();
    const current = await this.describeCurrentCounts(latestRun?.id, fallbackDate);
    const freshnessHours = Math.max(0, Math.round((now - current.asOf.getTime()) / (1000 * 60 * 60)));

    return {
      chart_key: validKey,
      title: isIndia ? 'India Top Persons' : 'Global Top Persons',
      description: isIndia
        ? 'Famous Indian Instagram personalities ranked by public follower count'
        : 'Famous global Instagram personalities ranked by public follower count',
      algorithm_version: 'followers_v1',
      as_of: current.asOf.toISOString(),
      total_profiles: totalProfilesInScope,
      ranked_profiles: latestRun?.profileCount || 0,
      source_label: SOURCE_LABELS[current.sourceCode] || current.sourceCode,
      freshness_hours: freshnessHours,
      is_stale: !latestRun || now - current.asOf.getTime() > COUNT_FRESH_MS,
    };
  }

  private async describeCurrentCounts(runId: string | undefined, fallback: Date) {
    if (!runId) return { asOf: fallback, sourceCode: DATA_SOURCES.SEED_XLSX };
    const rows = await this.db.$queryRaw<Array<{ observed_at: Date; code: string }>>`
      SELECT lat.observed_at, d.code
      FROM ranking_entries e
      JOIN LATERAL (
        SELECT s.observed_at, s.source_id
        FROM metric_snapshots s
        INNER JOIN data_sources src ON src.id = s.source_id
        WHERE s.profile_id = e.profile_id
          AND s.metric_name = 'follower_count'
          AND s.metric_value IS NOT NULL
        ORDER BY CASE WHEN src.code = 'fastsocial' THEN 0 ELSE 1 END, s.observed_at DESC
        LIMIT 1
      ) lat ON TRUE
      INNER JOIN data_sources d ON d.id = lat.source_id
      WHERE e.run_id = ${runId}
    `;
    if (rows.length === 0) return { asOf: fallback, sourceCode: DATA_SOURCES.SEED_XLSX };
    let asOf = new Date(rows[0].observed_at);
    const tally = new Map<string, number>();
    for (const row of rows) {
      const observed = new Date(row.observed_at);
      if (observed > asOf) asOf = observed;
      tally.set(row.code, (tally.get(row.code) || 0) + 1);
    }
    const sourceCode = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || DATA_SOURCES.SEED_XLSX;
    return { asOf, sourceCode };
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

    const current = await this.describeCurrentCounts(
      latestRun.id,
      latestRun.finishedAt || latestRun.startedAt,
    );

    return {
      chart_key: validKey,
      as_of: current.asOf.toISOString(),
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

  async getAudienceMix(chartKey?: string) {
    const bands = [
      { id: 'major', label: 'Major', range: '10 million and above', min: 10_000_000 },
      { id: 'public', label: 'Public', range: '1 million to under 10 million', min: 1_000_000 },
      { id: 'established', label: 'Established', range: '100 thousand to under 1 million', min: 100_000 },
      { id: 'community', label: 'Community', range: '10 thousand to under 100 thousand', min: 10_000 },
    ];

    const place = (count: number | null) => {
      if (count == null) return 'not_measured';
      if (count < 10_000) return 'ungrouped';
      if (count < 100_000) return 'community';
      if (count < 1_000_000) return 'established';
      if (count < 10_000_000) return 'public';
      return 'major';
    };

    let counts: Array<number | null> = [];
    let asOf = new Date().toISOString();
    let scope: 'chart' | 'saved' = 'saved';
    let resolvedKey: string | null = null;

    if (chartKey) {
      const validKey = this.assertChartKey(chartKey);
      resolvedKey = validKey;
      scope = 'chart';
      const latestRun = await this.db.rankingRun.findFirst({
        where: { chartKey: validKey, status: 'success' },
        orderBy: { finishedAt: 'desc' },
      });
      if (latestRun) {
        asOf = latestRun.finishedAt?.toISOString() || latestRun.startedAt.toISOString();
        const entries = await this.db.rankingEntry.findMany({
          where: { runId: latestRun.id },
          select: { metricValue: true },
        });
        counts = entries.map((entry) => bigintToNumber(entry.metricValue));
      }
    } else {
      const rows = await this.db.$queryRaw<
        Array<{ metric_value: bigint | null; observed_at: Date | null }>
      >`
        SELECT lat.metric_value, lat.observed_at
        FROM creator_profiles p
        LEFT JOIN LATERAL (
          SELECT s.metric_value, s.observed_at
          FROM metric_snapshots s
          INNER JOIN data_sources d ON d.id = s.source_id
          WHERE s.profile_id = p.id
            AND s.metric_name = 'follower_count'
            AND s.metric_value IS NOT NULL
          ORDER BY CASE WHEN d.code = 'fastsocial' THEN 0 ELSE 1 END, s.observed_at DESC
          LIMIT 1
        ) lat ON TRUE
        WHERE p.is_listed = TRUE AND p.is_active = TRUE
      `;
      counts = rows.map((row) => bigintToNumber(row.metric_value));
      const newest = rows
        .map((row) => row.observed_at)
        .filter((value): value is Date => value instanceof Date)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      if (newest) asOf = newest.toISOString();
    }

    const tally = new Map<string, number>();
    for (const count of counts) {
      const id = place(count);
      tally.set(id, (tally.get(id) || 0) + 1);
    }
    const groups: { id: string; label: string; range: string; count: number }[] = bands.map((band) => ({
      id: band.id,
      label: band.label,
      range: band.range,
      count: tally.get(band.id) || 0,
    }));
    groups.push(
      {
        id: 'ungrouped',
        label: 'Not grouped yet',
        range: 'Known count under 10 thousand',
        count: tally.get('ungrouped') || 0,
      },
      {
        id: 'not_measured',
        label: 'Not measured yet',
        range: 'No usable count',
        count: tally.get('not_measured') || 0,
      },
    );

    return {
      scope,
      chartKey: resolvedKey,
      asOf,
      total: counts.length,
      groups,
    };
  }
}
