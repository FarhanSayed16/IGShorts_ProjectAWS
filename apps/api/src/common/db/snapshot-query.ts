export const LATEST_NON_NULL_FOLLOWERS = {
  where: { metricName: 'follower_count' as const, metricValue: { not: null } },
  orderBy: { observedAt: 'desc' as const },
  take: 1,
  include: { source: true as const },
};
