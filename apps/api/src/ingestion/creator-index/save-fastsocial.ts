import { legacyHideReason } from '@igshorts/shared';
import { FASTSOCIAL_LICENSE, FASTSOCIAL_REPO_URL, IndexedProfile } from './import-open-datasets.js';

const SOURCE_CODE = 'fastsocial';
const CHUNK = 250;

export interface FastSocialSaveReport {
  status: 'success';
  inputProfiles: number;
  createdProfiles: number;
  existingProfiles: number;
  snapshotsAdded: number;
  snapshotsAlreadyStored: number;
  hiddenProfiles: number;
  missingCounts: number;
  durationMs: number;
}

type ProfileRow = {
  id: string;
  igUsername: string;
  category: string | null;
  countryRegion: string | null;
};

type Db = {
  dataSource: {
    upsert: (args: {
      where: { code: string };
      update: { isActive: boolean; displayName: string };
      create: { code: string; displayName: string; isActive: boolean };
    }) => Promise<{ id: string }>;
  };
  creatorProfile: {
    findMany: (args: {
      where: { igUsername: { in: string[] } };
      select: {
        id: true;
        igUsername: true;
        category: true;
        countryRegion: true;
      };
    }) => Promise<ProfileRow[]>;
    createMany: (args: { data: Record<string, unknown>[]; skipDuplicates: boolean }) => Promise<{ count: number }>;
    update: (args: {
      where: { id: string };
      data: { category?: string; countryRegion?: string };
    }) => Promise<unknown>;
  };
  metricSnapshot: {
    findMany: (args: {
      where: { rawPayloadRef: { startsWith: string } };
      select: { rawPayloadRef: true };
    }) => Promise<Array<{ rawPayloadRef: string | null }>>;
    createMany: (args: { data: Record<string, unknown>[] }) => Promise<{ count: number }>;
  };
  jobRun: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

function blankToNull(value: string): string | null {
  const text = value.trim();
  return text || null;
}

function observedAt(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function payloadRef(profile: IndexedProfile): string {
  return `fastsocial_latest:${profile.username}:${profile.observedDate}:${profile.followersCount ?? 'null'}`;
}

async function inChunks<T>(items: T[], size: number, run: (chunk: T[]) => Promise<void>) {
  for (let index = 0; index < items.length; index += size) {
    await run(items.slice(index, index + size));
  }
}

export async function saveFastSocialProfiles(db: Db, profiles: IndexedProfile[]): Promise<FastSocialSaveReport> {
  const started = Date.now();
  const source = await db.dataSource.upsert({
    where: { code: SOURCE_CODE },
    update: {
      isActive: true,
      displayName: 'FastSocial Top Charts (CC BY 4.0)',
    },
    create: {
      code: SOURCE_CODE,
      displayName: 'FastSocial Top Charts (CC BY 4.0)',
      isActive: true,
    },
  });

  const usernames = profiles.map((profile) => profile.username);
  const existing = new Map<string, ProfileRow>();
  await inChunks(usernames, 1000, async (chunk) => {
    const rows = await db.creatorProfile.findMany({
      where: { igUsername: { in: chunk } },
      select: { id: true, igUsername: true, category: true, countryRegion: true },
    });
    for (const row of rows) existing.set(row.igUsername, row);
  });

  let hiddenProfiles = 0;
  let missingCounts = 0;
  const prepared = profiles
    .filter((profile) => !existing.has(profile.username))
    .map((profile) => {
      const hideReason = legacyHideReason(profile.username, profile.displayName);
      if (hideReason) hiddenProfiles += 1;
      if (profile.followersCount == null) missingCounts += 1;
      return {
        igUsername: profile.username,
        displayName: profile.displayName || profile.username,
        profileUrl: profile.profileUrl,
        entityType: profile.entityType || 'person',
        category: blankToNull(profile.category),
        countryRegion: blankToNull(profile.country),
        isListed: !hideReason,
        isActive: true,
        isVerifiedHandle: false,
        seedNotes: ['FastSocial Top Charts, CC BY 4.0.', profile.qualityStatus, hideReason ? `Hidden: ${hideReason}` : '']
          .filter(Boolean)
          .join(' '),
        rankingSourceUrl: FASTSOCIAL_REPO_URL,
      };
    });
  for (const profile of profiles) {
    if (existing.has(profile.username) && profile.followersCount == null) missingCounts += 1;
  }

  let createdProfiles = 0;
  await inChunks(prepared, CHUNK, async (chunk) => {
    const result = await db.creatorProfile.createMany({ data: chunk, skipDuplicates: true });
    createdProfiles += result.count;
  });

  const stored = new Map(existing);
  await inChunks(usernames, 1000, async (chunk) => {
    const rows = await db.creatorProfile.findMany({
      where: { igUsername: { in: chunk } },
      select: { id: true, igUsername: true, category: true, countryRegion: true },
    });
    for (const row of rows) stored.set(row.igUsername, row);
  });

  const fills = profiles.filter((profile) => {
    const row = existing.get(profile.username);
    if (!row) return false;
    return (!row.category && profile.category.trim()) || (!row.countryRegion && profile.country.trim());
  });
  for (let index = 0; index < fills.length; index += 25) {
    await Promise.all(
      fills.slice(index, index + 25).map((profile) => {
        const row = existing.get(profile.username)!;
        return db.creatorProfile.update({
          where: { id: row.id },
          data: {
            category: row.category || blankToNull(profile.category) || undefined,
            countryRegion: row.countryRegion || blankToNull(profile.country) || undefined,
          },
        });
      }),
    );
  }

  const knownRefs = new Set<string>();
  const prior = await db.metricSnapshot.findMany({
    where: { rawPayloadRef: { startsWith: 'fastsocial_latest:' } },
    select: { rawPayloadRef: true },
  });
  for (const row of prior) {
    if (row.rawPayloadRef) knownRefs.add(row.rawPayloadRef);
  }

  const snapshots: Record<string, unknown>[] = [];
  let snapshotsAlreadyStored = 0;
  for (const profile of profiles) {
    const row = stored.get(profile.username);
    const when = observedAt(profile.observedDate);
    if (!row || !when) continue;
    const ref = payloadRef(profile);
    if (knownRefs.has(ref)) {
      snapshotsAlreadyStored += 1;
      continue;
    }
    snapshots.push({
      profileId: row.id,
      sourceId: source.id,
      metricName: 'follower_count',
      metricValue: profile.followersCount == null ? null : BigInt(profile.followersCount),
      observedAt: when,
      rawPayloadRef: ref,
    });
  }

  let snapshotsAdded = 0;
  await inChunks(snapshots, CHUNK, async (chunk) => {
    const result = await db.metricSnapshot.createMany({ data: chunk });
    snapshotsAdded += result.count;
  });

  const report: FastSocialSaveReport = {
    status: 'success',
    inputProfiles: profiles.length,
    createdProfiles,
    existingProfiles: existing.size,
    snapshotsAdded,
    snapshotsAlreadyStored,
    hiddenProfiles,
    missingCounts,
    durationMs: Date.now() - started,
  };

  await db.jobRun.create({
    data: {
      jobName: 'fastsocial_index_import',
      status: 'success',
      finishedAt: new Date(),
      stats: JSON.stringify(report),
    },
  });
  await db.auditLog.create({
    data: {
      actor: 'cli:fastsocial_import',
      action: 'open_index_import',
      entityType: 'data_source',
      entityId: source.id,
      afterSummary: `FastSocial CC BY 4.0: created ${createdProfiles}, snapshots ${snapshotsAdded}. India and Global chart scopes were left unchanged. ${FASTSOCIAL_LICENSE}`,
    },
  });

  return report;
}
