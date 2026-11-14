import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { EditorialDiscoveryAdapter } from './adapters/editorial.adapter.js';
import { NewsDiscoveryAdapter } from './adapters/news.adapter.js';
import { SpotifyDiscoveryAdapter } from './adapters/spotify.adapter.js';
import { PulseService } from '../pulse/pulse.service.js';

@Injectable()
export class DiscoveryRefreshService {
  private readonly logger = new Logger(DiscoveryRefreshService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly editorial: EditorialDiscoveryAdapter,
    private readonly spotify: SpotifyDiscoveryAdapter,
    private readonly news: NewsDiscoveryAdapter,
    private readonly pulse: PulseService,
  ) {}

  async runDiscoveryRefresh() {
    const job = await this.db.jobRun.create({
      data: {
        jobName: 'discovery_refresh',
        status: 'running',
        startedAt: new Date(),
      },
    });

    try {
      const music = this.spotify.enabled ? await this.spotify.fetchMusic() : [];
      const trends = this.news.enabled ? await this.news.fetchTrends() : [];

      await this.db.jobRun.update({
        where: { id: job.id },
        data: {
          status: 'success',
          finishedAt: new Date(),
          stats: JSON.stringify({
            adapters: {
              editorial: this.editorial.enabled,
              spotify: this.spotify.enabled,
              news: this.news.enabled,
            },
            musicFetched: music.length,
            trendsFetched: trends.length,
            note: 'Live rows are only written when adapters return permitted data',
          }),
        },
      });

      this.logger.log(
        `Discovery refresh complete (spotify=${music.length}, news=${trends.length})`,
      );
      return { musicFetched: music.length, trendsFetched: trends.length };
    } catch (err) {
      await this.db.jobRun.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          error: err instanceof Error ? err.message : 'discovery refresh failed',
        },
      });
      throw err;
    }
  }

  async runPulseAssembly() {
    return this.pulse.assembleToday();
  }
}
