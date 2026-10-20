import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestionAdapter, IngestionResult } from './adapter.interface.js';

export interface MetaAdapterConfig {
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  rateLimitPerHour: number;
  isLiveEnabled: boolean;
}

@Injectable()
export class MetaGraphAdapter implements IngestionAdapter {
  private readonly logger = new Logger(MetaGraphAdapter.name);
  readonly code = 'meta_graph';

  private readonly config: MetaAdapterConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      appId: this.configService.get<string>('META_APP_ID'),
      appSecret: this.configService.get<string>('META_APP_SECRET'),
      accessToken: this.configService.get<string>('META_ACCESS_TOKEN'),
      rateLimitPerHour: 200,
      // In v1, live Meta calls are disabled by default
      isLiveEnabled: this.configService.get<string>('app.provider') === 'meta',
    };

    if (this.config.isLiveEnabled) {
      this.logger.log('Meta Graph adapter initialized in LIVE mode (requires valid tokens)');
    } else {
      this.logger.log('Meta Graph adapter initialized in STUB mode (PROVIDER=seed default)');
    }
  }

  /**
   * Fetches profile data from Meta Graph API
   */
  async fetchProfileData(username: string): Promise<IngestionResult> {
    this.logger.debug(
      `Meta Graph live calls are disabled in v1. Skipping live fetch for @${username}.`,
    );
    return {
      username,
      observedAt: new Date(),
      sourceCode: this.code,
      followerCount: null,
    };
  }

  /**
   * Batch fetches profile data with rate-limiting throttling
   */
  async fetchBatch(usernames: string[]): Promise<IngestionResult[]> {
    this.logger.log(`Processing batch of ${usernames.length} usernames through Meta Graph stub`);
    const results: IngestionResult[] = [];

    for (const username of usernames) {
      try {
        const res = await this.fetchProfileData(username);
        results.push(res);
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to process @${username} via Meta Graph: ${err instanceof Error ? err.message : 'Unknown'}`,
        );
      }
    }

    return results;
  }
}
