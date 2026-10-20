import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async logEvent(data: {
    actor: string;
    action: string;
    entityType?: string;
    entityId?: string;
    beforeSummary?: string;
    afterSummary?: string;
    ip?: string;
  }) {
    return this.db.auditLog.create({
      data,
    });
  }
}
