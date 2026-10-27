export const FASTSOCIAL_SOURCE = 'fastsocial';

export const LATEST_NON_NULL_FOLLOWERS = {
  where: { metricName: 'follower_count' as const, metricValue: { not: null } },
  orderBy: { observedAt: 'desc' as const },
  take: 8,
  include: { source: true as const },
};

type SnapshotRow = {
  metricValue: bigint | null;
  observedAt: Date;
  source?: { code: string } | null;
};

/** Prefer a published FastSocial integer over a newer rounded seed for the same handle. */
export function preferredFollowerSnapshot<T extends SnapshotRow>(rows: T[]): T | undefined {
  const usable = rows.filter((row) => row.metricValue !== null && row.metricValue !== undefined);
  const exact = usable.filter((row) => row.source?.code === FASTSOCIAL_SOURCE);
  const pool = exact.length > 0 ? exact : usable;
  return [...pool].sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime())[0];
}
