import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryAdapter } from './discovery-adapter.interface.js';
import { TrendCard } from '@igshorts/shared';

/**
 * Licensed news / RSS adapter stub.
 * Enable only when NEWS_API_KEY is set and redistribution terms allow public display.
 */
@Injectable()
export class NewsDiscoveryAdapter implements DiscoveryAdapter {
  readonly code = 'news_api';
  private readonly logger = new Logger(NewsDiscoveryAdapter.name);

  constructor(private readonly config: ConfigService) {}

  get enabled() {
    return Boolean(
      this.config.get<string>('NEWS_API_KEY') && process.env.DISCOVERY_NEWS_ENABLED === 'true',
    );
  }

  async fetchTrends(): Promise<Partial<TrendCard>[]> {
    if (!this.enabled) {
      this.logger.debug('News discovery adapter disabled');
      return [];
    }
    this.logger.warn('News live fetch not implemented yet — returning empty set');
    return [];
  }
}
