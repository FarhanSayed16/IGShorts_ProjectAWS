import { FollowersV1Engine, PreviousRankEntry, RankingCandidate } from './followers-v1.engine.js';
import { ENTITY_TYPES } from '@igshorts/shared';

describe('FollowersV1Engine', () => {
  let engine: FollowersV1Engine;

  beforeEach(() => {
    engine = new FollowersV1Engine();
  });

  const createMockCandidate = (overrides: Partial<RankingCandidate>): RankingCandidate => ({
    id: overrides.id || 'id-1',
    username: overrides.username || 'testuser',
    displayName: overrides.displayName || 'Test User',
    avatarUrl: null,
    profileUrl: `https://instagram.com/${overrides.username || 'testuser'}/`,
    category: 'Athlete',
    countryRegion: 'India',
    entityType: ENTITY_TYPES.PERSON,
    isListed: true,
    isActive: true,
    scopes: ['india', 'global'],
    followerCount: BigInt(10_000_000),
    observedAt: new Date(),
    sourceCode: 'seed_xlsx',
    ...overrides,
  });

  it('should rank candidates descending by follower count', () => {
    const candidates = [
      createMockCandidate({ id: '1', username: 'messi', followerCount: BigInt(500_000_000) }),
      createMockCandidate({ id: '2', username: 'ronaldo', followerCount: BigInt(600_000_000) }),
      createMockCandidate({ id: '3', username: 'neymar', followerCount: BigInt(200_000_000) }),
    ];

    const result = engine.computeRanking(candidates, 'global');

    expect(result.length).toBe(3);
    expect(result[0].candidate.username).toBe('ronaldo');
    expect(result[0].rank).toBe(1);
    expect(result[1].candidate.username).toBe('messi');
    expect(result[1].rank).toBe(2);
    expect(result[2].candidate.username).toBe('neymar');
    expect(result[2].rank).toBe(3);
  });

  it('should handle ties using competition rank and alphabetical username break', () => {
    const candidates = [
      createMockCandidate({ id: '1', username: 'user_b', followerCount: BigInt(50_000_000) }),
      createMockCandidate({ id: '2', username: 'user_a', followerCount: BigInt(50_000_000) }),
      createMockCandidate({ id: '3', username: 'user_c', followerCount: BigInt(40_000_000) }),
    ];

    const result = engine.computeRanking(candidates, 'india');

    expect(result.length).toBe(3);
    // user_a and user_b tie for rank 1
    expect(result[0].candidate.username).toBe('user_a');
    expect(result[0].rank).toBe(1);
    expect(result[0].isTied).toBe(true);

    expect(result[1].candidate.username).toBe('user_b');
    expect(result[1].rank).toBe(1);
    expect(result[1].isTied).toBe(true);

    // user_c gets rank 3 (skipping rank 2 in competition ranking)
    expect(result[2].candidate.username).toBe('user_c');
    expect(result[2].rank).toBe(3);
    expect(result[2].isTied).toBe(false);
  });

  it('should exclude candidates with null or zero follower count', () => {
    const candidates = [
      createMockCandidate({ id: '1', username: 'valid', followerCount: BigInt(10_000_000) }),
      createMockCandidate({ id: '2', username: 'null_count', followerCount: null }),
      createMockCandidate({ id: '3', username: 'zero_count', followerCount: BigInt(0) }),
    ];

    const result = engine.computeRanking(candidates, 'global');

    expect(result.length).toBe(1);
    expect(result[0].candidate.username).toBe('valid');
  });

  it('should exclude brands, teams, and platforms from default persons chart', () => {
    const candidates = [
      createMockCandidate({ id: '1', username: 'actor_person', entityType: ENTITY_TYPES.PERSON }),
      createMockCandidate({ id: '2', username: 'nike_brand', entityType: ENTITY_TYPES.BRAND }),
      createMockCandidate({ id: '3', username: 'ipl_team', entityType: ENTITY_TYPES.TEAM }),
      createMockCandidate({
        id: '4',
        username: 'instagram_platform',
        entityType: ENTITY_TYPES.PLATFORM,
      }),
    ];

    const result = engine.computeRanking(candidates, 'india');

    expect(result.length).toBe(1);
    expect(result[0].candidate.username).toBe('actor_person');
  });

  it('should exclude unlisted or inactive accounts', () => {
    const candidates = [
      createMockCandidate({ id: '1', username: 'active_listed', isListed: true, isActive: true }),
      createMockCandidate({ id: '2', username: 'hidden_account', isListed: false, isActive: true }),
      createMockCandidate({
        id: '3',
        username: 'inactive_account',
        isListed: true,
        isActive: false,
      }),
    ];

    const result = engine.computeRanking(candidates, 'global');

    expect(result.length).toBe(1);
    expect(result[0].candidate.username).toBe('active_listed');
  });

  it('should compute rank deltas and follower deltas against previous run', () => {
    const candidates = [
      createMockCandidate({ id: 'p1', username: 'climber', followerCount: BigInt(100_000_000) }),
      createMockCandidate({ id: 'p2', username: 'faller', followerCount: BigInt(90_000_000) }),
    ];

    const prevEntries = new Map<string, PreviousRankEntry>([
      // climber was rank 3 with 80M, now rank 1 with 100M -> climbed 2 ranks (+2)
      ['p1', { profileId: 'p1', rank: 3, metricValue: BigInt(80_000_000) }],
      // faller was rank 1 with 95M, now rank 2 with 90M -> dropped 1 rank (-1)
      ['p2', { profileId: 'p2', rank: 1, metricValue: BigInt(95_000_000) }],
    ]);

    const result = engine.computeRanking(candidates, 'global', prevEntries);

    expect(result[0].candidate.username).toBe('climber');
    expect(result[0].rank).toBe(1);
    expect(result[0].previousRank).toBe(3);
    expect(result[0].rankDelta).toBe(2); // 3 - 1 = +2 (climbed)
    expect(result[0].metricDelta).toBe(BigInt(20_000_000)); // +20M

    expect(result[1].candidate.username).toBe('faller');
    expect(result[1].rank).toBe(2);
    expect(result[1].previousRank).toBe(1);
    expect(result[1].rankDelta).toBe(-1); // 1 - 2 = -1 (dropped)
    expect(result[1].metricDelta).toBe(BigInt(-5_000_000)); // -5M
  });
});
