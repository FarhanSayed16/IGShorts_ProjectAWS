import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { IngestionModule } from '../ingestion/ingestion.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { MetricsModule } from '../metrics/metrics.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { RankingModule } from '../ranking/ranking.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    AuditModule,
    IngestionModule,
    JobsModule,
    MetricsModule,
    ProfilesModule,
    RankingModule,
    StorageModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
