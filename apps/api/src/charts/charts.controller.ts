import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChartKey } from '@igshorts/shared';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { ChartsService } from './charts.service.js';

@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get()
  getCharts() {
    return this.chartsService.getAvailableCharts();
  }

  @Get(':chartKey')
  async getChart(@Param('chartKey') chartKey: string, @Query() query: PaginationQueryDto) {
    return this.chartsService.getChartEntries(chartKey, {
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
      category: query.category,
      q: query.q,
    });
  }

  @Get(':chartKey/meta')
  async getChartMeta(@Param('chartKey') chartKey: ChartKey) {
    return this.chartsService.getChartMeta(chartKey);
  }

  @Get(':chartKey/movers')
  async getChartMovers(@Param('chartKey') chartKey: ChartKey) {
    return this.chartsService.getChartMovers(chartKey);
  }
}
