import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { legacyHideReason } from '@igshorts/shared';
import { DatabaseService } from '../database/database.service.js';
import { MetricsService } from '../metrics/metrics.service.js';
import { AdapterRegistry } from './adapters/adapter.registry.js';
import { ManualSeedAdapter, SeedRowParsed } from './adapters/manual-seed.adapter.js';

export interface SeedImportReport {
  status: 'success' | 'failed';
  totalRowsParsed: number;
  uniqueProfiles: number;
  createdProfiles: number;
  mergedProfiles: number;
  skipped: number;
  missingFollowerCounts: number;
  badUsernames: string[];
  scopesCount: {
    indiaOnly: number;
    globalOnly: number;
    both: number;
  };
  durationMs: number;
  timestamp: string;
  error?: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly metrics: MetricsService,
    private readonly seedAdapter: ManualSeedAdapter,
    private readonly adapters: AdapterRegistry,
    private readonly config: ConfigService,
  ) {}

  /**
   * Imports or re-imports the 200 India + 200 Global seed watchlist from Excel.
   * Merges duplicate accounts (e.g. Kohli), preserves null counts, classifies entities.
   */
  async importSeedWatchlist(filePath?: string, actor = 'admin'): Promise<SeedImportReport> {
    const startTime = Date.now();
    this.logger.log('Starting seed watchlist import process...');

    try {
      // 1. Ensure seed_xlsx data source exists
      const dataSource = await this.db.dataSource.upsert({
        where: { code: 'seed_xlsx' },
        update: { isActive: true },
        create: {
          code: 'seed_xlsx',
          displayName: 'Excel Research Seed (India 200 + Global 200)',
          isActive: true,
        },
      });

      // 2. Parse Excel data
      const parseResult = this.seedAdapter.parseExcelFile(filePath);
      const allRows = [...parseResult.indiaRows, ...parseResult.globalRows];

      // 3. Group rows by unique normalized username
      const profileMap = new Map<
        string,
        {
          rows: SeedRowParsed[];
          scopes: Set<'india' | 'global'>;
          canonical: SeedRowParsed;
        }
      >();

      const skipped: string[] = [];

      for (const row of allRows) {
        if (!row.username || row.isBadUsername) {
          if (row.rawUsername) skipped.push(row.rawUsername || row.username);
          continue;
        }

        if (!profileMap.has(row.username)) {
          profileMap.set(row.username, {
            rows: [row],
            scopes: new Set([row.scope]),
            canonical: row,
          });
        } else {
          const entry = profileMap.get(row.username)!;
          entry.rows.push(row);
          entry.scopes.add(row.scope);
          // Prefer India sheet details for Indian profiles, or non-null values
          if (row.followerCount !== null && entry.canonical.followerCount === null) {
            entry.canonical = row;
          }
        }
      }

      let createdCount = 0;
      let mergedCount = 0;
      let missingCounts = 0;
      let indiaOnlyCount = 0;
      let globalOnlyCount = 0;
      let bothCount = 0;

      const observedAt = new Date();

      // 4. Upsert profiles, attach scopes, and append metric snapshots
      for (const [username, { scopes, canonical }] of profileMap.entries()) {
        const hasIndia = scopes.has('india');
        const hasGlobal = scopes.has('global');

        if (hasIndia && hasGlobal) bothCount++;
        else if (hasIndia) indiaOnlyCount++;
        else if (hasGlobal) globalOnlyCount++;

        if (canonical.followerCount === null) {
          missingCounts++;
        }

        // Check if profile already exists in DB
        const existing = await this.db.creatorProfile.findUnique({
          where: { igUsername: username },
        });

        let profileId: string;

        const hideReason = legacyHideReason(username, canonical.displayName);
        const listedOnCreate = !hideReason;
        const seedNotes = hideReason
          ? [canonical.seedNotes, `Hidden: ${hideReason}`].filter(Boolean).join(' | ')
          : canonical.seedNotes;

        if (!existing) {
          const created = await this.db.creatorProfile.create({
            data: {
              igUsername: username,
              displayName: canonical.displayName,
              profileUrl: canonical.profileUrl,
              avatarUrl: canonical.avatarUrl,
              entityType: canonical.entityType,
              category: canonical.category,
              countryRegion: canonical.countryRegion,
              seedRank: canonical.seedRank,
              seedConfidence: canonical.seedConfidence,
              seedNotes,
              rankingSourceUrl: canonical.rankingSourceUrl,
              isListed: listedOnCreate,
              isActive: true,
            },
          });
          profileId = created.id;
          createdCount++;
        } else {
          // Merge / update profile details without duplicating
          const updated = await this.db.creatorProfile.update({
            where: { id: existing.id },
            data: {
              displayName: canonical.displayName || existing.displayName,
              category: canonical.category || existing.category,
              countryRegion: canonical.countryRegion || existing.countryRegion,
              entityType: canonical.entityType || existing.entityType,
              seedNotes: canonical.seedNotes || existing.seedNotes,
            },
          });
          profileId = updated.id;
          mergedCount++;
        }

        // 5. Connect scopes (india, global)
        for (const scope of scopes) {
          await this.db.profileScope.upsert({
            where: {
              profileId_scope: {
                profileId,
                scope,
              },
            },
            update: {},
            create: {
              profileId,
              scope,
            },
          });
        }

        // 6. Append metric snapshot (history preserving, blank = null, never overwrite)
        await this.metrics.appendSnapshot({
          profileId,
          sourceId: dataSource.id,
          metricName: 'follower_count',
          metricValue: canonical.followerCount,
          observedAt,
          rawPayloadRef: `seed_xlsx_${canonical.scope}_rank_${canonical.seedRank || 0}`,
        });
      }

      const durationMs = Date.now() - startTime;
      const report: SeedImportReport = {
        status: 'success',
        totalRowsParsed: parseResult.totalParsed,
        uniqueProfiles: profileMap.size,
        createdProfiles: createdCount,
        mergedProfiles: mergedCount,
        skipped: skipped.length,
        missingFollowerCounts: missingCounts,
        badUsernames: [...new Set([...parseResult.badUsernames, ...skipped])],
        scopesCount: {
          indiaOnly: indiaOnlyCount,
          globalOnly: globalOnlyCount,
          both: bothCount,
        },
        durationMs,
        timestamp: new Date().toISOString(),
      };

      // 7. Log JobRun & AuditLog
      await this.db.jobRun.create({
        data: {
          jobName: 'seed_import',
          status: 'success',
          finishedAt: new Date(),
          stats: JSON.stringify(report),
        },
      });

      await this.db.auditLog.create({
        data: {
          actor,
          action: 'seed_import',
          entityType: 'creator_profiles',
          afterSummary: `Imported ${report.uniqueProfiles} profiles (${report.createdProfiles} created, ${report.mergedProfiles} merged, ${report.missingFollowerCounts} blanks)`,
        },
      });

      this.logger.log(
        `Seed import complete in ${durationMs}ms: ${report.uniqueProfiles} profiles (${report.createdProfiles} created, ${report.mergedProfiles} merged, ${bothCount} both scopes)`,
      );

      return report;
    } catch (err: any) {
      this.logger.error(`Seed import failed: ${err.message}`, err.stack);
      const report: SeedImportReport = {
        status: 'failed',
        totalRowsParsed: 0,
        uniqueProfiles: 0,
        createdProfiles: 0,
        mergedProfiles: 0,
        skipped: 0,
        missingFollowerCounts: 0,
        badUsernames: [],
        scopesCount: { indiaOnly: 0, globalOnly: 0, both: 0 },
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: err.message,
      };

      await this.db.jobRun.create({
        data: {
          jobName: 'seed_import',
          status: 'failed',
          finishedAt: new Date(),
          error: err.message,
        },
      });

      return report;
    }
  }

  /**
   * Refresh tracked profiles from the configured provider.
   * Seed provider is a no-op on counts (does not write nulls).
   * Live adapters (Meta/vendor) are stubbed in v1 and will not overwrite existing counts with null.
   */
  async syncProfiles(usernames?: string[]) {
    const provider = this.config.get<'seed' | 'meta' | 'vendor'>('app.provider') || 'seed';
    const adapter = this.adapters.forProvider(provider);
    const normalized = (usernames || [])
      .map((name) => this.seedAdapter.normalizeUsername(name))
      .filter(Boolean);

    const profiles = await this.db.creatorProfile.findMany({
      where: {
        isListed: true,
        isActive: true,
        ...(normalized.length ? { igUsername: { in: normalized } } : {}),
      },
    });

    const synced: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    for (const profile of profiles) {
      try {
        if (adapter) {
          const result = await adapter.fetchProfileData(profile.igUsername);
          if (result.followerCount === null || result.followerCount === undefined) {
            skipped.push(profile.igUsername);
            await this.db.creatorProfile.update({
              where: { id: profile.id },
              data: {
                lastSyncedAt: new Date(),
                lastSyncStatus: 'skipped_null',
                lastSyncError: null,
              },
            });
            continue;
          }

          const dataSource = await this.db.dataSource.upsert({
            where: { code: result.sourceCode },
            update: { isActive: true },
            create: {
              code: result.sourceCode,
              displayName: result.sourceCode,
              isActive: true,
            },
          });

          await this.metrics.appendSnapshot({
            profileId: profile.id,
            sourceId: dataSource.id,
            metricName: 'follower_count',
            metricValue: result.followerCount,
            observedAt: result.observedAt,
          });
        }

        await this.db.creatorProfile.update({
          where: { id: profile.id },
          data: {
            lastSyncedAt: new Date(),
            lastSyncStatus: adapter ? 'success' : 'seed_provider',
            lastSyncError: null,
          },
        });
        synced.push(profile.igUsername);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown sync failure';
        failed.push(profile.igUsername);
        await this.db.creatorProfile.update({
          where: { id: profile.id },
          data: {
            lastSyncedAt: new Date(),
            lastSyncStatus: 'error',
            lastSyncError: message,
          },
        });
      }
    }

    return {
      provider,
      total: profiles.length,
      synced: synced.length,
      skipped: skipped.length,
      failed: failed.length,
      failedHandles: failed,
      skippedHandles: skipped,
    };
  }
}
