import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { audienceGroup, freshnessState, placeAudienceGroup, preserveAfterFailedRefresh } from './audience.js';
import { lookupExact, mergeOpenDatasets, readFastSocial, readSeedList } from './import-open-datasets.js';
import { parseHandle } from './normalize-handle.js';

const seedDir = path.resolve(__dirname, '../../../../../IGshorts_Cursor_Handoff/data');

function seed(name: string): string {
  return readFileSync(path.join(seedDir, name), 'utf8');
}

describe('open dataset handles', () => {
  it('accepts an @handle, a bare handle, and a profile URL as the same username', () => {
    expect(parseHandle('@Cristiano').username).toBe('cristiano');
    expect(parseHandle('https://www.instagram.com/cristiano/').username).toBe('cristiano');
    expect(parseHandle('https://instagram.com/cristiano?hl=en').username).toBe('cristiano');
  });

  it('does not invent a handle by deleting a space', () => {
    const parsed = parseHandle('@m cstan');
    expect(parsed.valid).toBe(false);
    expect(parsed.username).toBe('');
  });

  it('reads the two seed lists, skips the malformed India handle, and merges duplicates', () => {
    const india = readSeedList(seed('IGshorts_India_200_Seed_List.csv'), 'IGshorts_India_200_Seed_List.csv');
    const global = readSeedList(seed('IGshorts_Global_200_Seed_List.csv'), 'IGshorts_Global_200_Seed_List.csv');
    const result = mergeOpenDatasets([
      {
        ...india,
        source: 'IGshorts_India_200_Seed_List.csv',
        note: 'Rounded research seed, not a live reading.',
      },
      {
        ...global,
        source: 'IGshorts_Global_200_Seed_List.csv',
        note: 'Rounded research seed, not a live reading.',
      },
    ]);

    expect(india.skipped.map((row) => row.rawHandle)).toEqual(
      expect.arrayContaining(['@m cstan', '@kichchasudeೀಪ']),
    );
    expect(india.records).toHaveLength(198);
    expect(global.records).toHaveLength(200);
    expect(result.manifest.inputRecordsTotal).toBe(398);
    expect(result.manifest.uniqueProfiles).toBe(330);
    expect(result.manifest.duplicatesMerged).toBe(68);
    expect(result.manifest.audienceGroupCounts.Major).toBe(147);
    expect(result.manifest.audienceGroupCounts['Not measured yet']).toBe(183);
    expect(result.manifest.observedFrom).toBe('2026-10-20');
    expect(result.manifest.observedTo).toBe('2026-10-20');
    expect(result.manifest.precisionCounts.rounded_millions_approximation).toBeGreaterThan(0);
    expect(result.manifest.precisionCounts.unknown).toBe(183);
    expect(result.profiles.find((row) => row.username === 'mcstan')).toBeUndefined();
    expect(result.profiles.every((row) => row.verifiedStatus === 'unknown')).toBe(true);
    expect(result.profiles.every((row) => row.followersCount !== 0 || row.precision === 'reported_integer')).toBe(true);
    expect(result.manifest.limitations.join(' ')).toContain('not a complete index');
  });
});

describe('exact search', () => {
  const imported = mergeOpenDatasets([
    {
      ...readSeedList(seed('IGshorts_Global_200_Seed_List.csv'), 'global'),
      source: 'global',
      note: 'seed',
    },
  ]);

  it('matches the normalized handle and ignores a similar name', () => {
    expect(lookupExact(imported.profiles, '@Cristiano')?.displayName).toBe('Cristiano Ronaldo');
    expect(lookupExact(imported.profiles, 'https://instagram.com/cristiano/')?.username).toBe('cristiano');
    expect(lookupExact(imported.profiles, 'Cristiano Ronaldo')).toBeNull();
    expect(lookupExact(imported.profiles, '@m cstan')).toBeNull();
  });

  it('keeps a rounded seed count marked as an approximation', () => {
    const row = lookupExact(imported.profiles, 'cristiano');
    expect(row?.precision).toBe('rounded_millions_approximation');
    expect(row?.followersCount).toBe(680_000_000);
    expect(row?.qualityStatus).toContain('not a live reading');
    expect(row?.sourceUrl).toContain('fastsocial.co');
  });
});

describe('FastSocial rows', () => {
  it('keeps the reported integer, the date, and the CC BY attribution', () => {
    const parsed = readFastSocial(
      'date,username,followers,name,category,country,type,rank\n2026-10-21,cristiano,680123456,Cristiano,athlete,PT,person,1\n',
    );
    const merged = mergeOpenDatasets([
      { ...parsed, source: 'FastSocial Top Charts', note: 'published dataset', license: parsed.records[0]?.sourceLicense },
    ]);
    const row = merged.profiles[0]!;
    expect(row.followersCount).toBe(680123456);
    expect(row.precision).toBe('reported_integer');
    expect(row.observedDate).toBe('2026-10-21');
    expect(row.verifiedStatus).toBe('unknown');
    expect(row.sourceLicense).toContain('CC BY 4.0');
    expect(row.qualityStatus).toContain('not an all-Instagram rank');
  });

  it('reads the downloaded FastSocial snapshot when it is present', () => {
    const file = path.resolve(seedDir, '../igshorts_bootstrap/source_downloads/fastsocial_latest.csv');
    if (!existsSync(file)) return;
    const parsed = readFastSocial(readFileSync(file, 'utf8'));
    expect(parsed.records.length).toBeGreaterThan(1000);
    expect(parsed.records.every((row) => row.sourceLicense.includes('CC BY 4.0'))).toBe(true);
    expect(parsed.records.every((row) => !row.username.includes(' '))).toBe(true);
    expect(
      parsed.records.every(
        (row) => row.followersCount == null || (Number.isInteger(row.followersCount) && row.followersCount >= 0),
      ),
    ).toBe(true);
  });

  it('prefers a FastSocial integer over a rounded seed for the same handle', () => {
    const fast = readFastSocial('date,username,followers,name\n2026-10-21,cristiano,680111222,Cristiano\n');
    const seed = readSeedList(
      'rank,account_name,username,profile_url,follower_count_millions,follower_count_status,account_category,country_region,ranking_source_url,verification_date\n2,Cristiano Ronaldo,@cristiano,https://www.instagram.com/cristiano/,680.0,rounded,Athlete,Portugal,https://example.test,2026-10-20\n',
      'seed',
    );
    const merged = mergeOpenDatasets([
      { ...fast, source: 'FastSocial Top Charts', note: 'dataset' },
      { ...seed, source: 'seed', note: 'rounded' },
    ]);
    expect(merged.manifest.uniqueProfiles).toBe(1);
    expect(merged.manifest.duplicatesMerged).toBe(1);
    expect(merged.profiles[0]?.followersCount).toBe(680111222);
    expect(merged.profiles[0]?.precision).toBe('reported_integer');
    expect(merged.profiles[0]?.allSources).toContain('seed');
  });
});

describe('audience groups and freshness', () => {
  it('places a first count in its natural group', () => {
    expect(placeAudienceGroup(105_000, null)).toBe('Established');
    expect(placeAudienceGroup(100_000, null)).toBe('Established');
    expect(placeAudienceGroup(101_000, null)).toBe('Established');
    expect(audienceGroup(9_999)).toBe('Not grouped yet');
    expect(audienceGroup(null)).toBe('Not measured yet');
    expect(audienceGroup(undefined)).toBe('Not measured yet');
  });

  it('holds a group until the 15 percent line is cleared', () => {
    expect(placeAudienceGroup(103_000, 50_000)).toBe('Community');
    expect(placeAudienceGroup(115_000, 50_000)).toBe('Established');
    expect(placeAudienceGroup(90_000, 200_000)).toBe('Established');
    expect(placeAudienceGroup(85_000, 200_000)).toBe('Community');
    expect(placeAudienceGroup(1_200_000, 900_000)).toBe('Public');
  });

  it('does not turn a failed refresh into zero followers', () => {
    const kept = preserveAfterFailedRefresh({
      count: 680_000_000,
      observedAt: '2026-10-01T00:00:00.000Z',
    });
    expect(kept.count).toBe(680_000_000);
    expect(kept.count).not.toBe(0);
    expect(kept.group).toBe('Major');
    expect(kept.freshness).toBe('update_overdue');
    expect(freshnessState(null, '2026-10-26T00:00:00.000Z')).toBe('not_measured_yet');
    expect(
      freshnessState(10, '2026-10-26T00:00:00.000Z', Date.parse('2026-10-27T00:00:00.000Z'), 14),
    ).toBe('recently_checked');
  });
});
