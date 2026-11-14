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
    const accessToken = this.configService.get<string>('META_ACCESS_TOKEN');
    const providerIsMeta = this.configService.get<string>('app.provider') === 'meta';
    this.config = {
      appId: this.configService.get<string>('META_APP_ID'),
      appSecret: this.configService.get<string>('META_APP_SECRET'),
      accessToken,
      rateLimitPerHour: 200,
      // Live Meta only when PROVIDER=meta AND a token exists. Never invent tokens.
      isLiveEnabled: providerIsMeta && Boolean(accessToken),
    };

    // TODO(meta-live): five-check / ownership verification and live Graph fetches stay OFF
    // until META_ACCESS_TOKEN is present and App Review is complete. Do not invent tokens.
    if (this.config.isLiveEnabled) {
      this.logger.log('Meta Graph adapter initialized in LIVE mode (requires valid tokens)');
    } else {
      this.logger.log(
        'Meta Graph adapter STUB — five-check stays off until META_ACCESS_TOKEN exists (PROVIDER=meta alone is not enough)',
      );
    }
  }

  /**
   * Fetches profile data from Meta Graph API
   */
  async fetchProfileData(username: string): Promise<IngestionResult> {
    // TODO(meta-live): implement Graph call only when this.config.isLiveEnabled && accessToken.
    // Until then, never fabricate follower counts — return null.
    this.logger.debug(
      `Meta Graph live path gated. Skipping live fetch for @${username} (token present: ${Boolean(this.config.accessToken)}).`,
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
