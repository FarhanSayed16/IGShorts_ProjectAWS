import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { IngestionModule } from '../ingestion/ingestion.module.js';
import { RankingModule } from '../ranking/ranking.module.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    RankingModule,
    IngestionModule,
    AuditModule,
    AuthModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
