import { Module } from '@nestjs/common';
import { AnalyticsEventsController } from './analytics-events.controller.js';
import { AnalyticsEventsService } from './analytics-events.service.js';

@Module({
  controllers: [AnalyticsEventsController],
  providers: [AnalyticsEventsService],
  exports: [AnalyticsEventsService],
})
export class AnalyticsEventsModule {}
