import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

// Working & Domain Modules
import { AuthModule } from './auth/auth.module.js';
import { MembersModule } from './members/members.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { MetricsModule } from './metrics/metrics.module.js';
import { IngestionModule } from './ingestion/ingestion.module.js';
import { RankingModule } from './ranking/ranking.module.js';
import { ChartsModule } from './charts/charts.module.js';
import { AdminModule } from './admin/admin.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuditModule } from './audit/audit.module.js';

// Future Upgrade Stubs
import { ScoringModule } from './scoring/scoring.module.js';
import { HashtagsModule } from './hashtags/hashtags.module.js';
import { NewsModule } from './news/news.module.js';
import { RegionsModule } from './regions/regions.module.js';
import { TrendsModule } from './trends/trends.module.js';
import { MusicModule } from './music/music.module.js';
import { PulseModule } from './pulse/pulse.module.js';
import { VisitDiffModule } from './visit-diff/visit-diff.module.js';
import { DiscoveryModule } from './discovery/discovery.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    MembersModule,
    ProfilesModule,
    MetricsModule,
    IngestionModule,
    RankingModule,
    ChartsModule,
    AdminModule,
    JobsModule,
    StorageModule,
    AuditModule,
    ScoringModule,
    HashtagsModule,
    NewsModule,
    RegionsModule,
    TrendsModule,
    MusicModule,
    PulseModule,
    VisitDiffModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
