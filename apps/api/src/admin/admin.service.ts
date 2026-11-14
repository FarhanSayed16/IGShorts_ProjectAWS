import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@igshorts/db';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { MetricsService } from '../metrics/metrics.service.js';
import { LATEST_NON_NULL_FOLLOWERS } from '../common/db/snapshot-query.js';
import { ProfilesService } from '../profiles/profiles.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly metrics: MetricsService,
    private readonly profiles: ProfilesService,
    private readonly config: ConfigService,
  ) {}

  private readonly scheduleDefaults = [
    {
      jobKey: 'daily_ranking_pipeline',
      label: 'Daily ranking pipeline',
      cronExpr: '0 2 * * *',
      intentTime: '02:00',
      description: 'Sync due profiles and rebuild Global & India leaderboards.',
      runEndpoint: 'pipeline' as const,
    },
    {
      jobKey: 'discovery_refresh',
      label: 'Discovery refresh',
      cronExpr: '30 3 * * *',
      intentTime: '03:30',
      description: 'Refresh Trends / Music / Pulse editorial discovery jobs.',
      runEndpoint: 'discovery' as const,
    },
  ];

  async getScheduleIntents() {
    const cronEnabled = this.config.get<boolean>('app.cronEnabled') === true;
    const intents = [];
    for (const def of this.scheduleDefaults) {
      const row = await this.db.systemSchedule.upsert({
        where: { jobKey: def.jobKey },
        create: {
          jobKey: def.jobKey,
          label: def.label,
          cronExpr: def.cronExpr,
          enabled: false,
        },
        update: {
          label: def.label,
          cronExpr: def.cronExpr,
        },
      });
      intents.push({
        ...def,
        enabled: row.enabled,
        enabledByDefault: row.enabled,
        lastRunAt: row.lastRunAt?.toISOString() ?? null,
        nextRunAt: row.nextRunAt?.toISOString() ?? null,
        lastStatus: row.lastStatus,
        lastError: row.lastError,
        disabledByEnv: !cronEnabled,
        disabledByOperator: !row.enabled,
      });
    }
    return {
      cronEnabled,
      note:
        'CRON_ENABLED (env) gates whether Render/cron triggers fire. Operator enable/disable is stored in SystemSchedule and is separate.',
      intents,
    };
  }

  async setScheduleEnabled(jobKey: string, enabled: boolean) {
    const def = this.scheduleDefaults.find((d) => d.jobKey === jobKey);
    if (!def) throw new NotFoundException(`Unknown schedule ${jobKey}`);
    const row = await this.db.systemSchedule.upsert({
      where: { jobKey },
      create: {
        jobKey,
        label: def.label,
        cronExpr: def.cronExpr,
        enabled,
      },
      update: { enabled },
    });
    await this.audit.logEvent({
      actor: 'admin',
      action: enabled ? 'schedule.enable' : 'schedule.disable',
      entityType: 'SystemSchedule',
      entityId: row.id,
      afterSummary: `${jobKey} enabled=${enabled}`,
    });
    return row;
  }

  async markScheduleRun(jobKey: string, status: string, error?: string | null) {
    try {
      await this.db.systemSchedule.updateMany({
        where: { jobKey },
        data: {
          lastRunAt: new Date(),
          lastStatus: status,
          lastError: error ?? null,
        },
      });
    } catch {
      // Schedule row may not exist yet
    }
  }

  async listMembers(options: { limit?: number; offset?: number; q?: string }) {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);
    const where = options.q
      ? { email: { contains: options.q, mode: 'insensitive' as const } }
      : {};
    const [total, rows] = await Promise.all([
      this.db.member.count({ where }),
      this.db.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          createdAt: true,
          lastVisitedAt: true,
          _count: { select: { tracks: true } },
        },
      }),
    ]);
    return {
      data: rows.map((m) => ({
        id: m.id,
        email: m.email,
        createdAt: m.createdAt.toISOString(),
        lastVisitedAt: m.lastVisitedAt?.toISOString() ?? null,
        trackCount: m._count.tracks,
      })),
      meta: { total, limit, offset, has_more: offset + rows.length < total },
    };
  }

  async updateMusicPreview(id: string, previewAudioUrl: string | null, actor?: string) {
    const track = await this.db.musicTrack.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Music track not found');
    const updated = await this.db.musicTrack.update({
      where: { id },
      data: { previewAudioUrl: previewAudioUrl || null },
    });
    await this.audit.logEvent({
      actor: actor || 'admin',
      action: 'music.preview_url',
      entityType: 'MusicTrack',
      entityId: id,
      afterSummary: previewAudioUrl || '(cleared)',
    });
    return updated;
  }

  async getAnalyticsSummary() {
    try {
      const rows = await this.db.analyticsEvent.groupBy({
        by: ['eventType'],
        _count: { _all: true },
      });
      const byType: Record<string, number> = {};
      let total = 0;
      for (const row of rows) {
        const count = row._count._all;
        byType[row.eventType] = count;
        total += count;
      }
      return { total, byType, available: true };
    } catch {
      return { total: 0, byType: {}, available: false };
    }
  }

  async getOverview() {
    const [
      profilesCount,
      listedCount,
      unlistedCount,
      rankedCount,
      unrankedCount,
      sourcesCount,
      latestGlobalRun,
      latestIndiaRun,
      recentAuditCount,
    ] = await Promise.all([
      this.db.creatorProfile.count(),
      this.db.creatorProfile.count({ where: { isListed: true } }),
      this.db.creatorProfile.count({ where: { isListed: false } }),
      this.db.creatorProfile.count({
        where: {
          isListed: true,
          metricSnapshots: { some: { metricValue: { not: null } } },
        },
      }),
      this.db.creatorProfile.count({
        where: {
          isListed: true,
          metricSnapshots: { none: { metricValue: { not: null } } },
        },
      }),
      this.db.dataSource.count(),
      this.db.rankingRun.findFirst({
        where: { chartKey: 'global_persons', status: 'success' },
        orderBy: { finishedAt: 'desc' },
      }),
      this.db.rankingRun.findFirst({
        where: { chartKey: 'india_persons', status: 'success' },
        orderBy: { finishedAt: 'desc' },
      }),
      this.db.auditLog.count(),
    ]);

    const latestRunDate = latestGlobalRun?.finishedAt || latestIndiaRun?.finishedAt;
    const hoursSinceLastRun = latestRunDate
      ? Math.round((Date.now() - latestRunDate.getTime()) / (1000 * 60 * 60))
      : null;

    return {
      totalProfiles: profilesCount,
      listedProfiles: listedCount,
      unlistedProfiles: unlistedCount,
      rankedProfiles: rankedCount,
      unrankedProfiles: unrankedCount,
      dataSources: sourcesCount,
      latestGlobalRun: latestGlobalRun
        ? {
            id: latestGlobalRun.id,
            profileCount: latestGlobalRun.profileCount,
            finishedAt: latestGlobalRun.finishedAt,
          }
        : null,
      latestIndiaRun: latestIndiaRun
        ? {
            id: latestIndiaRun.id,
            profileCount: latestIndiaRun.profileCount,
            finishedAt: latestIndiaRun.finishedAt,
          }
        : null,
      hoursSinceLastRun,
      isStale: hoursSinceLastRun === null || hoursSinceLastRun > 36,
      recentAuditCount,
      systemStatus: 'healthy',
      cronEnabled: this.config.get<boolean>('app.cronEnabled') === true,
      timestamp: new Date().toISOString(),
    };
  }

  async getWatchlist(params: {
    limit?: number;
    offset?: number;
    q?: string;
    category?: string;
    entityType?: string;
    scope?: string;
    isListed?: boolean;
  }) {
    const { limit = 50, offset = 0, q, category, entityType, scope, isListed } = params;

    const where: any = {};

    if (isListed !== undefined) {
      where.isListed = isListed;
    }

    if (category) {
      where.category = category;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (scope) {
      where.scopes = {
        some: { scope },
      };
    }

    if (q) {
      where.OR = [
        { igUsername: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [profiles, total] = await Promise.all([
      this.db.creatorProfile.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { igUsername: 'asc' },
        include: {
          scopes: true,
          metricSnapshots: LATEST_NON_NULL_FOLLOWERS,
        },
      }),
      this.db.creatorProfile.count({ where }),
    ]);

    return {
      data: profiles.map((p) => ({
        id: p.id,
        igUsername: p.igUsername,
        displayName: p.displayName,
        profileUrl: p.profileUrl,
        avatarUrl: p.avatarUrl,
        category: p.category,
        countryRegion: p.countryRegion,
        entityType: p.entityType,
        isListed: p.isListed,
        isActive: p.isActive,
        isVerifiedHandle: p.isVerifiedHandle,
        scopes: p.scopes.map((s) => s.scope),
        latestFollowerCount: p.metricSnapshots[0]?.metricValue
          ? Number(p.metricSnapshots[0].metricValue)
          : null,
        createdAt: p.createdAt.toISOString(),
      })),
      meta: {
        total,
        limit,
        offset,
        has_more: offset + profiles.length < total,
      },
    };
  }

  async createProfile(
    data: {
      igUsername: string;
      displayName: string;
      category?: string;
      countryRegion?: string;
      entityType?: string;
      scopes?: string[];
    },
    actor = 'admin',
  ) {
    const normalized = this.profiles.normalizeUsername(data.igUsername);
    if (!/^[a-z0-9._]{1,30}$/.test(normalized)) {
      throw new BadRequestException(`Invalid Instagram username: ${data.igUsername}`);
    }

    try {
      const profile = await this.db.creatorProfile.create({
        data: {
          igUsername: normalized,
          displayName: data.displayName,
          category: data.category || 'Creator',
          countryRegion: data.countryRegion || 'Global',
          entityType: data.entityType || 'person',
          profileUrl: `https://www.instagram.com/${normalized}/`,
          isListed: true,
          isActive: true,
          scopes: {
            create: (data.scopes || ['global']).map((scope) => ({ scope })),
          },
        },
        include: { scopes: true },
      });

      await this.audit.logEvent({
        actor,
        action: 'profile_create',
        entityType: 'creator_profile',
        entityId: profile.id,
        afterSummary: `Created profile @${profile.igUsername} (${profile.displayName})`,
      });

      return profile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Username @${normalized} already exists`);
      }
      throw error;
    }
  }

  async updateProfile(
    id: string,
    data: {
      displayName?: string;
      category?: string;
      countryRegion?: string;
      entityType?: string;
      isListed?: boolean;
      scopes?: string[];
    },
    actor = 'admin',
  ) {
    const existing = await this.db.creatorProfile.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Profile ID ${id} not found`);
    }

    const { scopes, ...profileData } = data;
    const updated = await this.db.creatorProfile.update({
      where: { id },
      data: profileData,
      include: { scopes: true },
    });

    if (scopes) {
      await this.db.profileScope.deleteMany({ where: { profileId: id } });
      await this.db.profileScope.createMany({
        data: scopes.map((scope) => ({ profileId: id, scope })),
      });
    }

    await this.audit.logEvent({
      actor,
      action: data.isListed === false ? 'profile_hide' : 'profile_update',
      entityType: 'creator_profile',
      entityId: id,
      beforeSummary: JSON.stringify({ isListed: existing.isListed, category: existing.category }),
      afterSummary: JSON.stringify({ isListed: updated.isListed, category: updated.category }),
    });

    return this.db.creatorProfile.findUnique({
      where: { id },
      include: { scopes: true },
    });
  }

  async toggleListed(id: string, isListed: boolean) {
    return this.updateProfile(id, { isListed });
  }

  async recordEditorialMetric(id: string, data: { followerCount: number; note: string }) {
    if (!data.note || data.note.trim().length === 0) {
      throw new BadRequestException('Editorial note explaining the manual override is mandatory');
    }
    if (!Number.isFinite(data.followerCount) || data.followerCount <= 0) {
      throw new BadRequestException('Follower count must be a positive number');
    }

    const profile = await this.db.creatorProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile ID ${id} not found`);
    }

    const dataSource = await this.db.dataSource.upsert({
      where: { code: 'editorial' },
      update: {},
      create: {
        code: 'editorial',
        displayName: 'Editorial Adjustment',
        isActive: true,
      },
    });

    const snapshot = await this.metrics.appendSnapshot({
      profileId: id,
      sourceId: dataSource.id,
      metricName: 'follower_count',
      metricValue: BigInt(Math.round(data.followerCount)),
      observedAt: new Date(),
    });

    await this.audit.logEvent({
      actor: 'admin',
      action: 'editorial_metric_override',
      entityType: 'creator_profile',
      entityId: id,
      afterSummary: `Manual follower override to ${data.followerCount}. Reason: ${data.note}`,
    });

    return {
      id: snapshot.id,
      metricValue: Number(snapshot.metricValue),
      observedAt: snapshot.observedAt.toISOString(),
    };
  }

  async getRecentRankingRuns() {
    return this.db.rankingRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async getRecentJobRuns() {
    return this.db.jobRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async getAuditLogs() {
    return this.db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
