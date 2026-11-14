import { Body, Controller, Post } from '@nestjs/common';
import { CreateAnalyticsEventDto } from './analytics-events.dto.js';
import { AnalyticsEventsService } from './analytics-events.service.js';

@Controller('analytics')
export class AnalyticsEventsController {
  constructor(private readonly events: AnalyticsEventsService) {}

  /** Public, rate-light — global Fastify rate limit applies. Client must only call with analytics consent. */
  @Post('events')
  create(@Body() body: CreateAnalyticsEventDto) {
    return this.events.record(body);
  }
}
