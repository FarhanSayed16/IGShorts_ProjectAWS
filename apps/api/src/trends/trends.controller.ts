import { Controller, Get, Query } from '@nestjs/common';
import { TrendsService } from './trends.service.js';
import { parseQueryInt } from '../common/utils/parse-query-int.js';

@Controller('trends')
export class TrendsController {
  constructor(private readonly trends: TrendsService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('sort') sort?: 'popular' | 'rising' | 'new',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.trends.list({
      category,
      region,
      sort,
      limit: parseQueryInt(limit, 24),
      offset: parseQueryInt(offset, 0),
    });
  }

  @Get('featured')
  featured() {
    return this.trends.featured();
  }

  @Get('ticker')
  ticker(@Query('limit') limit?: string) {
    return this.trends.ticker(parseQueryInt(limit, 10));
  }

  @Get('categories')
  categories() {
    return this.trends.categories();
  }
}
