import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CHART_KEYS, ChartKey, isChartKey } from '@igshorts/shared';
import { LATEST_NON_NULL_FOLLOWERS } from '../common/db/snapshot-query.js';
import { DatabaseService } from '../database/database.service.js';
import {
  ComputedRankEntry,
  FollowersV1Engine,
  PreviousRankEntry,
  RankingCandidate,
} from './algorithms/followers-v1.engine.js';

export interface RankingRunResult {
  runId: string;
  chartKey: string;
  algorithmVersion: string;
  rankedProfilesCount: number;
  durationMs: number;
  timestamp: string;
}

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);
  private readonly engine = new FollowersV1Engine();

  constructor(private readonly db: DatabaseService) {}

  /**
   * Computes and persists rankings for a target chartKey using followers_v1 algorithm
   */
  async runRankingForChart(chartKey: ChartKey): Promise<RankingRunResult> {
    if (!isChartKey(chartKey)) {
      throw new BadRequestException(`Unknown chart key: ${chartKey}`);
    }

    const startTime = Date.now();
    this.logger.log(`Starting ranking computation for ${chartKey}...`);

    const targetScope: 'india' | 'global' =
      chartKey === CHART_KEYS.INDIA_PERSONS ? 'india' : 'global';

    // 1. Fetch previous successful run and index its entries
    const previousRun = await this.db.rankingRun.findFirst({
      where: {
        chartKey,
        status: 'success',
      },
      orderBy: { finishedAt: 'desc' },
      include: {
        entries: true,
      },
    });

    const previousEntriesMap = new Map<string, PreviousRankEntry>();
    if (previousRun) {
      for (const entry of previousRun.entries) {
        previousEntriesMap.set(entry.profileId, {
          profileId: entry.profileId,
          rank: entry.rank,
          metricValue: entry.metricValue,
        });
      }
    }

    // 2. Fetch candidate profiles, their scopes, and their latest metric snapshots
    const profiles = await this.db.creatorProfile.findMany({
      where: {
        isListed: true,
        isActive: true,
      },
      include: {
        scopes: true,
        metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
      },
    });

    const candidates: RankingCandidate[] = profiles.map((p) => {
      const latestSnapshot = p.metricSnapshots[0];
      return {
        id: p.id,
        username: p.igUsername,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        profileUrl: p.profileUrl,
        category: p.category,
        countryRegion: p.countryRegion,
        entityType: p.entityType,
        isListed: p.isListed,
        isActive: p.isActive,
        scopes: p.scopes.map((s) => s.scope),
        followerCount: latestSnapshot?.metricValue ?? null,
        observedAt: latestSnapshot?.observedAt ?? null,
        sourceCode: latestSnapshot?.source?.code ?? 'seed_xlsx',
      };
    });

    // 3. Calculate ranks using followers_v1 engine
    const computedEntries: ComputedRankEntry[] = this.engine.computeRanking(
      candidates,
      targetScope,
      previousEntriesMap,
    );

    const startedAt = new Date();
    const run = await this.db.rankingRun.create({
      data: {
        chartKey,
        algorithmVersion: this.engine.version,
        status: 'running',
        startedAt,
        profileCount: computedEntries.length,
      },
    });

    let finishedAt = new Date();
    try {
      if (computedEntries.length > 0) {
        await this.db.rankingEntry.createMany({
          data: computedEntries.map((e) => ({
            runId: run.id,
            profileId: e.profileId,
            rank: e.rank,
            previousRank: e.previousRank,
            rankDelta: e.rankDelta,
            metricValue: e.metricValue,
            previousMetricValue: e.previousMetricValue,
            metricDelta: e.metricDelta,
            isTied: e.isTied,
          })),
        });
      }

      finishedAt = new Date();
      await this.db.rankingRun.update({
        where: { id: run.id },
        data: {
          status: 'success',
          finishedAt,
        },
      });
    } catch (error) {
      await this.db.rankingRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          notes: error instanceof Error ? error.message : 'Ranking persist failed',
        },
      });
      throw error;
    }

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Ranking complete for ${chartKey}: ${computedEntries.length} ranked profiles in ${durationMs}ms`,
    );

    return {
      runId: run.id,
      chartKey,
      algorithmVersion: this.engine.version,
      rankedProfilesCount: computedEntries.length,
      durationMs,
      timestamp: finishedAt.toISOString(),
    };
  }

  /**
   * Rebuilds all v1 charts (global_persons and india_persons)
   */
  async rebuildAllCharts(): Promise<RankingRunResult[]> {
    const globalResult = await this.runRankingForChart(CHART_KEYS.GLOBAL_PERSONS);
    const indiaResult = await this.runRankingForChart(CHART_KEYS.INDIA_PERSONS);
    return [globalResult, indiaResult];
  }
}
