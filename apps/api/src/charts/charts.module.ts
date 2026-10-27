import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller.js';
import { ChartsController } from './charts.controller.js';
import { ChartsService } from './charts.service.js';

@Module({
  controllers: [ChartsController, AnalyticsController],
  providers: [ChartsService],
  exports: [ChartsService],
})
export class ChartsModule {}
