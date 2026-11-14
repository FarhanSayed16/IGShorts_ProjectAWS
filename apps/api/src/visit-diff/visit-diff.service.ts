import { Injectable } from '@nestjs/common';
import { VisitDiff } from '@igshorts/shared';
import { DatabaseService } from '../database/database.service.js';
import { ChartsService } from '../charts/charts.service.js';
import { CHART_KEYS } from '@igshorts/shared';

@Injectable()
export class VisitDiffService {
  constructor(
    private readonly db: DatabaseService,
    private readonly charts: ChartsService,
  ) {}

  async since(sinceIso: string): Promise<VisitDiff> {
    const since = new Date(sinceIso);
    if (Number.isNaN(since.getTime())) {
      return {
        newTrendTopics: 0,
        newMusicTracks: 0,
        creatorMoves: [],
        newProfiles: 0,
        significantStories: [],
      };
    }

    const [newTrendTopics, newMusicTracks, newProfiles, recentStories, latestRun] =
      await Promise.all([
        this.db.trendTopic.count({ where: { createdAt: { gt: since } } }),
        this.db.musicTrack.count({ where: { createdAt: { gt: since } } }),
        this.db.creatorProfile.count({
          where: { createdAt: { gt: since }, isListed: true, isActive: true },
        }),
        this.db.trendTopic.findMany({
          where: {
            createdAt: { gt: since },
            category: { in: ['news', 'technology', 'entertainment'] },
          },
          orderBy: { observedAt: 'desc' },
          take: 5,
          select: { title: true, category: true },
        }),
        this.db.rankingRun.findFirst({
          where: { chartKey: CHART_KEYS.GLOBAL_PERSONS, status: 'success' },
          orderBy: { finishedAt: 'desc' },
          select: { finishedAt: true },
        }),
      ]);

    let creatorMoves: VisitDiff['creatorMoves'] = [];
    const runFinishedAfterVisit =
      !!latestRun?.finishedAt && latestRun.finishedAt.getTime() > since.getTime();

    if (runFinishedAfterVisit) {
      try {
        const movers = await this.charts.getChartMovers(CHART_KEYS.GLOBAL_PERSONS);
        creatorMoves = [
          ...movers.gainers.slice(0, 3).map((g) => ({
            username: g.username,
            displayName: g.display_name,
            direction: 'up' as const,
            delta: g.rank_delta,
          })),
          ...movers.losers.slice(0, 2).map((g) => ({
            username: g.username,
            displayName: g.display_name,
            direction: 'down' as const,
            delta: g.rank_delta,
          })),
        ];
      } catch {
        creatorMoves = [];
      }
    }

    return {
      newTrendTopics,
      newMusicTracks,
      creatorMoves,
      newProfiles,
      significantStories: recentStories.map((s) => ({
        title: s.title,
        category: s.category,
      })),
    };
  }
}
