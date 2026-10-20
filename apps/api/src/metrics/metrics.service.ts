import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class MetricsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Append a new metric snapshot. Never updates in-place.
   */
  async appendSnapshot(data: {
    profileId: string;
    sourceId: string;
    metricName?: string;
    metricValue?: bigint | null;
    observedAt: Date;
    rawPayloadRef?: string;
  }) {
    return this.db.metricSnapshot.create({
      data: {
        profileId: data.profileId,
        sourceId: data.sourceId,
        metricName: data.metricName || 'follower_count',
        metricValue: data.metricValue ?? null,
        observedAt: data.observedAt,
        rawPayloadRef: data.rawPayloadRef,
      },
    });
  }

  /**
   * Retrieve snapshot history for a profile
   */
  async getHistory(profileId: string, metricName = 'follower_count', limit = 30) {
    return this.db.metricSnapshot.findMany({
      where: {
        profileId,
        metricName,
      },
      orderBy: { observedAt: 'desc' },
      take: limit,
    });
  }
}
