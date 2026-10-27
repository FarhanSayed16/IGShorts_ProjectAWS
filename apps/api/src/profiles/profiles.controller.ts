import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChartsService } from '../charts/charts.service.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { ProfilesService } from './profiles.service.js';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly chartsService: ChartsService,
  ) {}

  @Get()
  async getProfiles(@Query() query: PaginationQueryDto) {
    return this.profilesService.listProfiles({
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
      category: query.category,
      entityType: query.entityType,
      scope: query.scope,
      q: query.q,
      measured: query.measured,
    });
  }

  @Get(':username')
  async getProfile(@Param('username') username: string) {
    return this.profilesService.findByUsername(username);
  }

  @Get(':username/history')
  async getProfileHistory(@Param('username') username: string, @Query('metric') metric?: string) {
    return this.chartsService.getProfileHistory(username, metric || 'follower_count');
  }
}
