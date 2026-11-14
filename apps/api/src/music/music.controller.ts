import { Controller, Get, Query } from '@nestjs/common';
import { MusicService } from './music.service.js';

@Controller('music')
export class MusicController {
  constructor(private readonly music: MusicService) {}

  @Get('tracks')
  tracks(
    @Query('collection') collection?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.music.listTracks({
      collection,
      region,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('ticker')
  ticker(@Query('limit') limit?: string) {
    return this.music.ticker(limit ? Number(limit) : 8);
  }

  @Get('featured')
  featured() {
    return this.music.featured();
  }
}
