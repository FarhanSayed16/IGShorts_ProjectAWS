import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryAdapter } from './discovery-adapter.interface.js';
import { MusicTrackCard } from '@igshorts/shared';

/**
 * Spotify Web API adapter stub.
 * Enable only when SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set and terms allow.
 */
@Injectable()
export class SpotifyDiscoveryAdapter implements DiscoveryAdapter {
  readonly code = 'spotify';
  private readonly logger = new Logger(SpotifyDiscoveryAdapter.name);

  constructor(private readonly config: ConfigService) {}

  get enabled() {
    return Boolean(
      this.config.get<string>('SPOTIFY_CLIENT_ID') &&
        this.config.get<string>('SPOTIFY_CLIENT_SECRET') &&
        process.env.DISCOVERY_SPOTIFY_ENABLED === 'true',
    );
  }

  async fetchMusic(): Promise<Partial<MusicTrackCard>[]> {
    if (!this.enabled) {
      this.logger.debug('Spotify discovery adapter disabled');
      return [];
    }
    this.logger.warn('Spotify live fetch not implemented yet — returning empty set');
    return [];
  }
}
