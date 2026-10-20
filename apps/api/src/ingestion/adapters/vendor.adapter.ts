import { Injectable, Logger } from '@nestjs/common';
import { DATA_SOURCES } from '@igshorts/shared';
import { IngestionAdapter, IngestionResult } from './adapter.interface.js';

/** Licensed-data adapter reserved for v2. Never writes in v1. */
@Injectable()
export class VendorAdapter implements IngestionAdapter {
  readonly code = DATA_SOURCES.VENDOR;
  private readonly logger = new Logger(VendorAdapter.name);

  async fetchProfileData(username: string): Promise<IngestionResult> {
    this.logger.debug(`Vendor adapter stub skipped @${username}`);
    return {
      username,
      observedAt: new Date(),
      sourceCode: this.code,
      followerCount: undefined,
    };
  }

  async fetchBatch(usernames: string[]): Promise<IngestionResult[]> {
    return Promise.all(usernames.map((username) => this.fetchProfileData(username)));
  }
}
