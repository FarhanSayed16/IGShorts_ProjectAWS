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
      const now = new Date();
      let musicWritten = 0;
      let trendsWritten = 0;

      for (const track of music) {
        if (!track.title || !track.artist) continue;
        const existing = await this.db.musicTrack.findFirst({
          where: {
            title: track.title,
            artist: track.artist,
            sourceLabel: track.sourceLabel || 'spotify',
          },
        });
        const data = {
          title: track.title,
          artist: track.artist,
          artworkUrl: track.artworkUrl ?? null,
          spotifyUrl: track.spotifyUrl ?? null,
          youtubeUrl: track.youtubeUrl ?? null,
          region: track.region || 'global',
          collections: (track.collections as string[]) || ['trending'],
          popularityScore: track.popularityScore ?? null,
          creatorUsageCount: track.creatorUsageCount ?? null,
          sourceLabel: track.sourceLabel || 'spotify',
          observedAt: now,
        };
        if (existing) {
          await this.db.musicTrack.update({ where: { id: existing.id }, data });
        } else {
          await this.db.musicTrack.create({ data });
        }
        musicWritten += 1;
      }

      for (const trend of trends) {
        if (!trend.title || !trend.slug || !trend.category) continue;
        await this.db.trendTopic.upsert({
          where: { slug: trend.slug },
          create: {
            title: trend.title,
            slug: trend.slug,
            category: trend.category,
            region: trend.region || 'global',
            summary: trend.summary ?? null,
            imageUrl: trend.imageUrl ?? null,
            sourceUrl: trend.sourceUrl ?? null,
            sourceName: trend.sourceName ?? null,
            sourceLabel: trend.sourceLabel || 'news',
            status: trend.status || 'new',
            popularityScore: null,
            velocityScore: null,
            isFeatured: false,
            publishedAt: trend.publishedAt ? new Date(trend.publishedAt) : now,
            observedAt: now,
          },
          update: {
            title: trend.title,
            category: trend.category,
            region: trend.region || 'global',
            summary: trend.summary ?? null,
            imageUrl: trend.imageUrl ?? null,
            sourceUrl: trend.sourceUrl ?? null,
            sourceName: trend.sourceName ?? null,
            sourceLabel: trend.sourceLabel || 'news',
            status: trend.status || 'new',
            publishedAt: trend.publishedAt ? new Date(trend.publishedAt) : undefined,
            observedAt: now,
          },
        });
        trendsWritten += 1;
      }

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
            musicWritten,
            trendsWritten,
            note: 'Live rows are only written when adapters return permitted data',
          }),
        },
      });

      this.logger.log(
        `Discovery refresh complete (spotify=${music.length}/${musicWritten}, news=${trends.length}/${trendsWritten})`,
      );
      return {
        musicFetched: music.length,
        trendsFetched: trends.length,
        musicWritten,
        trendsWritten,
      };
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
