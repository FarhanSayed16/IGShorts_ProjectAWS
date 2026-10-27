import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { isChartKey } from '@igshorts/shared';
import { ChartsService } from './charts.service.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly charts: ChartsService) {}

  @Get('groups')
  groups(@Query('chartKey') chartKey?: string) {
    if (chartKey && !isChartKey(chartKey)) {
      throw new BadRequestException('Unknown chart');
    }
    return this.charts.getAudienceMix(chartKey);
  }
}
