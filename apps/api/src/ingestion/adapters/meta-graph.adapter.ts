import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestionAdapter, IngestionResult } from './adapter.interface.js';

export interface MetaAdapterConfig {
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  igBusinessId?: string;
  graphApiVersion: string;
  rateLimitPerHour: number;
  /** True when Page token + IG business id are present — live Graph calls allowed. */
  isLiveEnabled: boolean;
}

interface MetaBusinessDiscoveryUser {
  username?: string;
  name?: string;
  biography?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  website?: string;
  id?: string;
}

interface MetaGraphResponse {
  business_discovery?: MetaBusinessDiscoveryUser;
  id?: string;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
}

@Injectable()
export class MetaGraphAdapter implements IngestionAdapter {
  private readonly logger = new Logger(MetaGraphAdapter.name);
  readonly code = 'meta_graph';

  private readonly config: MetaAdapterConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken =
      this.configService.get<string>('META_ACCESS_TOKEN') ||
      this.configService.get<string>('IG_PAGE_ACCESS_TOKEN') ||
      undefined;
    const igBusinessId = this.configService.get<string>('IG_BUSINESS_ID') || undefined;
    const graphApiVersion = this.configService.get<string>('GRAPH_API_VERSION') || 'v21.0';

    this.config = {
      appId: this.configService.get<string>('META_APP_ID') || undefined,
      appSecret: this.configService.get<string>('META_APP_SECRET') || undefined,
      accessToken: accessToken?.trim() || undefined,
      igBusinessId: igBusinessId?.trim() || undefined,
      graphApiVersion,
      rateLimitPerHour: 200,
      isLiveEnabled: Boolean(accessToken?.trim() && igBusinessId?.trim()),
    };

    if (this.config.isLiveEnabled) {
      this.logger.log(
        `Meta Graph adapter LIVE (Business Discovery via IG ${this.config.igBusinessId}, ${this.config.graphApiVersion})`,
      );
    } else {
      this.logger.log(
        'Meta Graph adapter STUB — set META_ACCESS_TOKEN (or IG_PAGE_ACCESS_TOKEN) + IG_BUSINESS_ID to enable live lookups',
      );
    }
  }

  /** Normalize handle: strip @, trim, lowercase. */
  normalizeUsername(username: string): string {
    return username.replace(/^@+/, '').trim().toLowerCase();
  }

  isEnabled(): boolean {
    return this.config.isLiveEnabled;
  }

  /**
   * Fetches public professional-account metrics via Instagram Graph Business Discovery.
   * Missing / non-professional / private targets return followerCount: null (never invent 0).
   */
  async fetchProfileData(username: string): Promise<IngestionResult> {
    const normalized = this.normalizeUsername(username);
    const empty: IngestionResult = {
      username: normalized,
      observedAt: new Date(),
      sourceCode: this.code,
      followerCount: null,
    };

    if (!normalized) {
      return empty;
    }

    if (!this.config.isLiveEnabled || !this.config.accessToken || !this.config.igBusinessId) {
      this.logger.debug(`Meta live path gated. Skipping @${normalized}`);
      return empty;
    }

    const fields = [
      'username',
      'name',
      'biography',
      'profile_picture_url',
      'followers_count',
      'follows_count',
      'media_count',
      'website',
    ].join(',');

    const url =
      `https://graph.facebook.com/${this.config.graphApiVersion}/${this.config.igBusinessId}` +
      `?fields=business_discovery.username(${encodeURIComponent(normalized)}){${fields}}` +
      `&access_token=${encodeURIComponent(this.config.accessToken)}`;

    let body: MetaGraphResponse;
    try {
      const res = await fetch(url);
      body = (await res.json()) as MetaGraphResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      this.logger.warn(`Meta Graph network failure for @${normalized}: ${message}`);
      throw new Error(`Meta Graph network failure for @${normalized}: ${message}`);
    }

    if (body.error) {
      const code = body.error.code;
      const message = body.error.message || 'Unknown Meta error';

      // Common non-fatal discovery misses: treat as null, do not invent counts.
      if (code === 110 || code === 803 || code === 24 || /user not found|invalid user|unsupported get request/i.test(message)) {
        this.logger.warn(`Meta Business Discovery miss for @${normalized}: [${code}] ${message}`);
        return empty;
      }

      // Auth / permission problems should fail the sync loudly.
      if (code === 10 || code === 190 || code === 102) {
        throw new Error(`Meta auth/permission error for @${normalized}: [${code}] ${message}`);
      }

      this.logger.warn(`Meta Graph error for @${normalized}: [${code}] ${message}`);
      return empty;
    }

    const discovered = body.business_discovery;
    if (!discovered) {
      this.logger.warn(`Meta returned no business_discovery payload for @${normalized}`);
      return empty;
    }

    const followers = discovered.followers_count;
    const followerCount =
      typeof followers === 'number' && Number.isFinite(followers) && followers >= 0
        ? BigInt(Math.trunc(followers))
        : null;

    return {
      username: (discovered.username || normalized).toLowerCase(),
      displayName: discovered.name || undefined,
      profileUrl: `https://www.instagram.com/${(discovered.username || normalized).toLowerCase()}/`,
      avatarUrl: discovered.profile_picture_url || undefined,
      followerCount,
      observedAt: new Date(),
      sourceCode: this.code,
    };
  }

  /**
   * Batch fetches with simple throttle to stay near Meta rate budgets.
   */
  async fetchBatch(usernames: string[]): Promise<IngestionResult[]> {
    this.logger.log(`Meta Graph batch: ${usernames.length} username(s)`);
    const results: IngestionResult[] = [];
    const delayMs = 250;

    for (let i = 0; i < usernames.length; i += 1) {
      const username = usernames[i];
      try {
        results.push(await this.fetchProfileData(username));
      } catch (err: unknown) {
        this.logger.warn(
          `Failed Meta fetch for @${username}: ${err instanceof Error ? err.message : 'Unknown'}`,
        );
        results.push({
          username: this.normalizeUsername(username),
          observedAt: new Date(),
          sourceCode: this.code,
          followerCount: null,
        });
      }

      if (i < usernames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}
