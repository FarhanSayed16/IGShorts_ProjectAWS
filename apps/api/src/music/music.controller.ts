import { Controller, Get, Query } from '@nestjs/common';
import { MusicService } from './music.service.js';
import { parseQueryInt } from '../common/utils/parse-query-int.js';

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
      limit: parseQueryInt(limit, 24),
      offset: parseQueryInt(offset, 0),
    });
  }

  @Get('ticker')
  ticker(@Query('limit') limit?: string) {
    return this.music.ticker(parseQueryInt(limit, 8));
  }

  @Get('featured')
  featured() {
    return this.music.featured();
  }
}
