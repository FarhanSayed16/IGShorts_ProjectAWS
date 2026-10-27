import { audienceGroup } from './audience.js';
import { parseHandle } from './normalize-handle.js';

export const FASTSOCIAL_LATEST_URL =
  'https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/latest.csv';
export const FASTSOCIAL_REPO_URL = 'https://github.com/FastSocialCo/instagram-top-accounts';
export const FASTSOCIAL_LICENSE = 'CC BY 4.0; attribute FastSocial Top Charts and link to the repository';

export interface IndexedProfile {
  username: string;
  displayName: string;
  profileUrl: string;
  followersCount: number | null;
  precision: 'reported_integer' | 'rounded_millions_approximation' | 'unknown';
  observedDate: string;
  audienceGroup: string;
  verifiedStatus: 'unknown';
  dataSource: string;
  sourceUrl: string;
  sourceLicense: string;
  qualityStatus: string;
  allSources: string;
  allSourceUrls: string;
  sourceRecordsMerged: number;
}

export interface SkippedRow {
  source: string;
  rawHandle: string;
  reason: string;
}

export interface SourceSummary {
  source: string;
  loadedRecords: number;
  skippedRecords: number;
  note: string;
  url?: string;
  license?: string;
}

export interface ImportManifest {
  inputRecordsTotal: number;
  uniqueProfiles: number;
  duplicatesMerged: number;
  skipped: SkippedRow[];
  audienceGroupCounts: Record<string, number>;
  precisionCounts: Record<string, number>;
  observedFrom: string | null;
  observedTo: string | null;
  sourceSummary: SourceSummary[];
  limitations: string[];
}

export interface ImportResult {
  profiles: IndexedProfile[];
  manifest: ImportManifest;
}

interface RawRecord {
  username: string;
  displayName: string;
  profileUrl: string;
  followersCount: number | null;
  precision: IndexedProfile['precision'];
  observedDate: string;
  country: string;
  category: string;
  sourceRank: string;
  dataSource: string;
  sourceUrl: string;
  sourceLicense: string;
  qualityStatus: string;
}

const LIMITATIONS = [
  'This is a seed index, not a complete index of Instagram users.',
  'FastSocial is a tracked set of public accounts. Attribute it as FastSocial Top Charts, CC BY 4.0.',
  'Legacy IGshorts seed counts are rounded estimates and are not live readings.',
  'Verification is unknown unless a source supplies that field. These files do not.',
  'A source rank is a rank inside that source list, not a rank of all Instagram.',
];

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((item) => item.some((value) => value.trim() !== ''));
  if (!header) return [];
  return body.map((values) =>
    Object.fromEntries(header.map((name, index) => [name.trim(), values[index] ?? ''])),
  );
}

function profileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`;
}

function millionsToCount(raw: string): number | null {
  const text = raw.trim().replace(/,/g, '');
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 1_000_000);
}

function integerCount(raw: string): number | null {
  const text = raw.trim().replace(/,/g, '');
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.trunc(parsed);
}

export function readSeedList(csvText: string, sourceName: string): { records: RawRecord[]; skipped: SkippedRow[] } {
  const records: RawRecord[] = [];
  const skipped: SkippedRow[] = [];
  for (const row of parseCsv(csvText)) {
    const rawHandle = row.username || row.profile_url || '';
    const handle = parseHandle(rawHandle);
    if (!handle.valid) {
      skipped.push({ source: sourceName, rawHandle, reason: handle.reason || 'malformed' });
      continue;
    }
    const count = millionsToCount(row.follower_count_millions || '');
    const sourceUrl = (row.ranking_source_url || '').trim();
    records.push({
      username: handle.username,
      displayName: (row.account_name || '').trim(),
      profileUrl: (row.profile_url || profileUrl(handle.username)).trim(),
      followersCount: count,
      precision: count == null ? 'unknown' : 'rounded_millions_approximation',
      observedDate: (row.verification_date || '').trim(),
      country: (row.country_region || '').trim(),
      category: (row.account_category || '').trim(),
      sourceRank: (row.rank || '').trim(),
      dataSource: sourceName,
      sourceUrl,
      sourceLicense: 'Check the source terms before public reuse. These figures are rounded research seeds.',
      qualityStatus: 'provisional IGshorts seed; rounded count, not a live reading',
    });
  }
  return { records, skipped };
}

export function readFastSocial(csvText: string): { records: RawRecord[]; skipped: SkippedRow[] } {
  const records: RawRecord[] = [];
  const skipped: SkippedRow[] = [];
  for (const row of parseCsv(csvText)) {
    const rawHandle = row.username || '';
    const handle = parseHandle(rawHandle);
    if (!handle.valid) {
      skipped.push({ source: 'FastSocial Top Charts', rawHandle, reason: handle.reason || 'malformed' });
      continue;
    }
    const count = integerCount(row.followers || '');
    records.push({
      username: handle.username,
      displayName: (row.name || '').trim(),
      profileUrl: profileUrl(handle.username),
      followersCount: count,
      precision: count == null ? 'unknown' : 'reported_integer',
      observedDate: (row.date || '').trim(),
      country: (row.country || row.countries || '').trim(),
      category: (row.category || '').trim(),
      sourceRank: (row.rank || '').trim(),
      dataSource: 'FastSocial Top Charts',
      sourceUrl: FASTSOCIAL_REPO_URL,
      sourceLicense: FASTSOCIAL_LICENSE,
      qualityStatus: 'published dataset; the source rank is not an all-Instagram rank',
    });
  }
  return { records, skipped };
}

function prefer(rows: RawRecord[]): IndexedProfile {
  const ranked = [...rows].sort((a, b) => {
    const score = (row: RawRecord) =>
      row.dataSource === 'FastSocial Top Charts' && row.followersCount != null
        ? 2
        : row.followersCount != null
          ? 1
          : 0;
    return score(b) - score(a) || b.observedDate.localeCompare(a.observedDate);
  });
  const chosen = ranked[0]!;
  const sources = [...new Set(rows.map((row) => row.dataSource))];
  const urls = [...new Set(rows.map((row) => row.sourceUrl).filter(Boolean))];
  return {
    username: chosen.username,
    displayName: chosen.displayName || rows.find((row) => row.displayName)?.displayName || chosen.username,
    profileUrl: chosen.profileUrl,
    followersCount: chosen.followersCount,
    precision: chosen.precision,
    observedDate: chosen.observedDate,
    audienceGroup: audienceGroup(chosen.followersCount),
    verifiedStatus: 'unknown',
    dataSource: chosen.dataSource,
    sourceUrl: chosen.sourceUrl,
    sourceLicense: chosen.sourceLicense,
    qualityStatus: chosen.qualityStatus,
    allSources: sources.join('; '),
    allSourceUrls: urls.join('; '),
    sourceRecordsMerged: rows.length,
  };
}

export function mergeOpenDatasets(parts: { records: RawRecord[]; skipped: SkippedRow[]; source: string; note: string; url?: string; license?: string }[]): ImportResult {
  const records = parts.flatMap((part) => part.records);
  const skipped = parts.flatMap((part) => part.skipped);
  const grouped = new Map<string, RawRecord[]>();
  for (const record of records) {
    const list = grouped.get(record.username) ?? [];
    list.push(record);
    grouped.set(record.username, list);
  }
  const profiles = [...grouped.values()]
    .map(prefer)
    .sort((a, b) => (b.followersCount ?? -1) - (a.followersCount ?? -1) || a.username.localeCompare(b.username));
  const audienceGroupCounts: Record<string, number> = {};
  const precisionCounts: Record<string, number> = {};
  const observedDates: string[] = [];
  for (const profile of profiles) {
    audienceGroupCounts[profile.audienceGroup] = (audienceGroupCounts[profile.audienceGroup] ?? 0) + 1;
    precisionCounts[profile.precision] = (precisionCounts[profile.precision] ?? 0) + 1;
    if (profile.observedDate) observedDates.push(profile.observedDate);
  }
  observedDates.sort();
  return {
    profiles,
    manifest: {
      inputRecordsTotal: records.length,
      uniqueProfiles: profiles.length,
      duplicatesMerged: records.length - profiles.length,
      skipped,
      audienceGroupCounts,
      precisionCounts,
      observedFrom: observedDates[0] ?? null,
      observedTo: observedDates[observedDates.length - 1] ?? null,
      sourceSummary: parts.map((part) => ({
        source: part.source,
        loadedRecords: part.records.length,
        skippedRecords: part.skipped.length,
        note: part.note,
        url: part.url,
        license: part.license,
      })),
      limitations: LIMITATIONS,
    },
  };
}

export function lookupExact(profiles: IndexedProfile[], query: string): IndexedProfile | null {
  const handle = parseHandle(query);
  if (!handle.valid) return null;
  return profiles.find((profile) => profile.username === handle.username) ?? null;
}
