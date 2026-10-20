import { Injectable, Logger } from '@nestjs/common';
import { DATA_SOURCES } from '@igshorts/shared';
import { IngestionAdapter, IngestionResult } from './adapter.interface.js';

/** Editorial counts are written through AdminService, not batch sync. */
@Injectable()
export class EditorialAdapter implements IngestionAdapter {
  readonly code = DATA_SOURCES.EDITORIAL;
  private readonly logger = new Logger(EditorialAdapter.name);

  async fetchProfileData(username: string): Promise<IngestionResult> {
    this.logger.debug(`Editorial adapter is opt-in per profile, skipped @${username}`);
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
