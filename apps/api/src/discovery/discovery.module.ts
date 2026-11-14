import { Module } from '@nestjs/common';
import { PulseModule } from '../pulse/pulse.module.js';
import { EditorialDiscoveryAdapter } from './adapters/editorial.adapter.js';
import { NewsDiscoveryAdapter } from './adapters/news.adapter.js';
import { SpotifyDiscoveryAdapter } from './adapters/spotify.adapter.js';
import { DiscoveryRefreshService } from './discovery-refresh.service.js';

@Module({
  imports: [PulseModule],
  providers: [
    EditorialDiscoveryAdapter,
    SpotifyDiscoveryAdapter,
    NewsDiscoveryAdapter,
    DiscoveryRefreshService,
  ],
  exports: [DiscoveryRefreshService],
})
export class DiscoveryModule {}
