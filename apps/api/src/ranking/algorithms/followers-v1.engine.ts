import { ENTITY_TYPES } from '@igshorts/shared';

export interface RankingCandidate {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string;
  category: string | null;
  countryRegion: string | null;
  entityType: string;
  isListed: boolean;
  isActive: boolean;
  scopes: string[];
  followerCount: bigint | null;
  observedAt: Date | null;
  sourceCode: string;
}

export interface PreviousRankEntry {
  profileId: string;
  rank: number;
  metricValue: bigint | null;
}

export interface ComputedRankEntry {
  profileId: string;
  rank: number;
  previousRank: number | null;
  rankDelta: number; // positive = climbed up, negative = dropped down, 0 = flat
  metricValue: bigint;
  previousMetricValue: bigint | null;
  metricDelta: bigint;
  isTied: boolean;
  candidate: RankingCandidate;
}

export class FollowersV1Engine {
  readonly version = 'followers_v1';

  /**
   * Filters and ranks candidates for a target chart scope (e.g. 'india' or 'global')
   * Strict rules:
   * 1. entityType must be 'person' (brands, teams, platforms excluded from default people chart)
   * 2. isListed must be true (admin hide excludes account)
   * 3. isActive must be true
   * 4. followerCount must be non-null and > 0 (null counts are unranked)
   * 5. Sort: followerCount DESC, then username ASC for ties
   * 6. Competition rank: 1, 2, 2, 4...
   * 7. Calculate deltas vs previous ranking run
   */
  computeRanking(
    candidates: RankingCandidate[],
    targetScope: 'india' | 'global',
    previousEntriesMap: Map<string, PreviousRankEntry> = new Map(),
  ): ComputedRankEntry[] {
    // 1. Filter eligible candidates
    const eligible = candidates.filter((c) => {
      if (!c.isListed || !c.isActive) return false;
      if (c.entityType !== ENTITY_TYPES.PERSON) return false;
      if (!c.scopes.includes(targetScope)) return false;
      if (c.followerCount === null || c.followerCount <= BigInt(0)) return false;
      return true;
    });

    // 2. Sort: followers desc, username asc
    eligible.sort((a, b) => {
      const diff = (b.followerCount as bigint) - (a.followerCount as bigint);
      if (diff !== BigInt(0)) {
        return diff > BigInt(0) ? 1 : -1;
      }
      return a.username.localeCompare(b.username);
    });

    // 3. Assign competition rank (1, 2, 2, 4...) and compute deltas
    const rankedEntries: ComputedRankEntry[] = [];
    let currentRank = 1;

    for (let i = 0; i < eligible.length; i++) {
      const candidate = eligible[i];
      const count = candidate.followerCount as bigint;

      // Detect tie with previous candidate
      const isTiedWithPrev = i > 0 && (eligible[i - 1].followerCount as bigint) === count;

      if (!isTiedWithPrev) {
        currentRank = i + 1; // Competition rank jumps
      }

      // Detect tie with next candidate
      const isTiedWithNext =
        i < eligible.length - 1 && (eligible[i + 1].followerCount as bigint) === count;

      const isTied = isTiedWithPrev || isTiedWithNext;

      // Look up previous run
      const prev = previousEntriesMap.get(candidate.id);
      let previousRank: number | null = null;
      let rankDelta = 0;
      let previousMetricValue: bigint | null = null;
      let metricDelta = BigInt(0);

      if (prev) {
        previousRank = prev.rank;
        // e.g. was rank 4, now rank 2 -> delta = 4 - 2 = +2 (climbed up)
        rankDelta = prev.rank - currentRank;
        previousMetricValue = prev.metricValue;
        if (prev.metricValue !== null) {
          metricDelta = count - prev.metricValue;
        }
      }

      rankedEntries.push({
        profileId: candidate.id,
        rank: currentRank,
        previousRank,
        rankDelta,
        metricValue: count,
        previousMetricValue,
        metricDelta,
        isTied,
        candidate,
      });
    }

    return rankedEntries;
  }
}
