import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@igshorts/db';
import { DatabaseService } from '../database/database.service.js';
import { CreateAnalyticsEventDto } from './analytics-events.dto.js';

@Injectable()
export class AnalyticsEventsService {
  private readonly logger = new Logger(AnalyticsEventsService.name);

  constructor(private readonly db: DatabaseService) {}

  async record(dto: CreateAnalyticsEventDto) {
    const path = dto.path?.trim() || null;
    if (path?.startsWith('/admin')) {
      return { stored: false, reason: 'admin_path_skipped' };
    }

    try {
      await this.db.analyticsEvent.create({
        data: {
          eventType: dto.eventType,
          path,
          meta: (dto.meta ?? undefined) as Prisma.InputJsonValue | undefined,
          anonId: dto.anonId?.trim() || null,
        },
      });
      return { stored: true };
    } catch (err) {
      this.logger.warn(
        `Analytics event not stored: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return { stored: false, reason: 'storage_unavailable' };
    }
  }
}
