import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { IngestionService } from '../ingestion/ingestion.service.js';
import { RankingService } from '../ranking/ranking.service.js';

export interface PipelineExecutionReport {
  jobRunId: string;
  status: 'success' | 'failed' | 'partial';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  stats: {
    totalTracked: number;
    synced: number;
    skipped: number;
    globalRanked: number;
    indiaRanked: number;
    failedHandles: string[];
  };
  error?: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly rankingService: RankingService,
    private readonly ingestionService: IngestionService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  @Cron('0 2 * * *')
  async scheduledDailyPipeline() {
    if (!this.config.get<boolean>('app.cronEnabled')) {
      return;
    }
    this.logger.log('Cron-triggered daily pipeline starting');
    await this.runDailyPipeline();
  }

  async checkStaleStatus(): Promise<{
    isStale: boolean;
    lastRunAt: Date | null;
    hoursAgo: number | null;
  }> {
    const lastSuccess = await this.db.jobRun.findFirst({
      where: { jobName: 'daily_ranking_pipeline', status: { in: ['success', 'partial'] } },
      orderBy: { finishedAt: 'desc' },
    });

    if (!lastSuccess || !lastSuccess.finishedAt) {
      return { isStale: true, lastRunAt: null, hoursAgo: null };
    }

    const hoursAgo = Math.round((Date.now() - lastSuccess.finishedAt.getTime()) / (1000 * 60 * 60));
    return {
      isStale: hoursAgo > 36,
      lastRunAt: lastSuccess.finishedAt,
      hoursAgo,
    };
  }

  async runDailyPipeline(usernames?: string[]): Promise<PipelineExecutionReport> {
    const startedAt = new Date();
    this.logger.log(`Starting daily pipeline at ${startedAt.toISOString()}`);

    const jobRun = await this.db.jobRun.create({
      data: {
        jobName: 'daily_ranking_pipeline',
        status: 'running',
        startedAt,
      },
    });

    let totalTracked = 0;
    let synced = 0;
    let skipped = 0;
    let globalRanked = 0;
    let indiaRanked = 0;
    let failedHandles: string[] = [];

    const previousSuccess = await this.db.jobRun.findFirst({
      where: {
        jobName: 'daily_ranking_pipeline',
        status: { in: ['success', 'partial'] },
        id: { not: jobRun.id },
      },
      orderBy: { finishedAt: 'desc' },
    });
    const hoursSincePreviousSuccess = previousSuccess?.finishedAt
      ? Math.max(
          0,
          Math.round((Date.now() - previousSuccess.finishedAt.getTime()) / (1000 * 60 * 60)),
        )
      : 0;

    try {
      const syncReport = await this.ingestionService.syncProfiles(usernames);
      totalTracked = syncReport.total;
      synced = syncReport.synced;
      skipped = syncReport.skipped;
      failedHandles = syncReport.failedHandles;

      const rankingResults = await this.rankingService.rebuildAllCharts();
      const globalResult = rankingResults.find((r) => r.chartKey === 'global_persons');
      const indiaResult = rankingResults.find((r) => r.chartKey === 'india_persons');
      globalRanked = globalResult?.rankedProfilesCount || 0;
      indiaRanked = indiaResult?.rankedProfilesCount || 0;

      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();
      const status: PipelineExecutionReport['status'] =
        failedHandles.length === 0 ? 'success' : 'partial';

      const stats = {
        totalTracked,
        synced,
        skipped,
        globalRanked,
        indiaRanked,
        failedHandles,
      };

      await this.db.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status,
          finishedAt,
          stats: JSON.stringify(stats),
        },
      });

      this.emitPipelineMetrics({ failed: false, hoursSinceLastRun: 0 }); // just completed: fresh

      await this.audit.logEvent({
        actor: 'system:pipeline_runner',
        action: 'ranking_pipeline_executed',
        entityType: 'job_run',
        entityId: jobRun.id,
        afterSummary: `Pipeline ${status}: synced ${synced}, ranked global ${globalRanked} / india ${indiaRanked} (${durationMs}ms)`,
      });

      return {
        jobRunId: jobRun.id,
        status,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs,
        stats,
      };
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : 'Pipeline execution encountered a critical error';
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      await this.db.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'failed',
          finishedAt,
          error,
        },
      });

      this.emitPipelineMetrics({
        failed: true,
        hoursSinceLastRun: hoursSincePreviousSuccess || 999,
      });
      this.logger.error(`Pipeline execution failed: ${error}`);

      return {
        jobRunId: jobRun.id,
        status: 'failed',
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs,
        stats: {
          totalTracked,
          synced,
          skipped,
          globalRanked,
          indiaRanked,
          failedHandles,
        },
        error,
      };
    }
  }

  private emitPipelineMetrics(input: { failed: boolean; hoursSinceLastRun: number }) {
    const payload = {
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: 'IGshorts/Pipeline',
            Dimensions: [],
            Metrics: [
              { Name: 'HoursSinceLastRankingRun', Unit: 'Hours' },
              { Name: 'JobFailed', Unit: 'Count' },
            ],
          },
        ],
      },
      HoursSinceLastRankingRun: input.hoursSinceLastRun,
      JobFailed: input.failed ? 1 : 0,
    };
    this.logger.log(JSON.stringify(payload));
  }
}
