export type AudienceGroupId = 'community' | 'established' | 'public' | 'major';

export type FreshnessState = 'recently_checked' | 'update_overdue' | 'not_measured';

export const GROUP_MOVE_BUFFER = 0.15;
export const FRESHNESS_WINDOW_DAYS = 14;

export const AUDIENCE_GROUPS: {
  id: AudienceGroupId;
  label: string;
  range: string;
  min: number;
}[] = [
  { id: 'community', label: 'Community', range: '10 thousand to under 100 thousand', min: 10_000 },
  { id: 'established', label: 'Established', range: '100 thousand to under 1 million', min: 100_000 },
  { id: 'public', label: 'Public', range: '1 million to under 10 million', min: 1_000_000 },
  { id: 'major', label: 'Major', range: '10 million and above', min: 10_000_000 },
];

const ORDER: AudienceGroupId[] = ['community', 'established', 'public', 'major'];

export function groupLabel(id: AudienceGroupId | null): string {
  if (id == null) return 'Not grouped yet';
  return AUDIENCE_GROUPS.find((group) => group.id === id)?.label ?? 'Not grouped yet';
}

export function publicAudienceLabel(count: number | null | undefined): string {
  if (count == null) return 'Not measured yet';
  return groupLabel(groupForCount(count));
}

export function groupForCount(count: number | null | undefined): AudienceGroupId | null {
  if (count == null || count < 10_000) return null;
  if (count < 100_000) return 'community';
  if (count < 1_000_000) return 'established';
  if (count < 10_000_000) return 'public';
  return 'major';
}

function minOf(id: AudienceGroupId): number {
  return AUDIENCE_GROUPS.find((group) => group.id === id)!.min;
}

/**
 * First reading uses the group that contains the count.
 * A later reading stays in the previous group until the new count is about 15% past the line.
 */
export function placeAudienceGroup(
  current: number | null | undefined,
  previous: number | null | undefined,
): AudienceGroupId | null {
  const currentGroup = groupForCount(current);
  if (previous == null || current == null) return currentGroup;

  const previousGroup = groupForCount(previous);
  if (previousGroup == null) {
    let placed: AudienceGroupId | null = null;
    for (const id of ORDER) {
      if (current >= minOf(id) * (1 + GROUP_MOVE_BUFFER)) placed = id;
    }
    return placed;
  }
  if (currentGroup === previousGroup) return currentGroup;

  const previousIndex = ORDER.indexOf(previousGroup);

  if (currentGroup == null) {
    const floor = minOf(previousGroup) * (1 - GROUP_MOVE_BUFFER);
    return current >= floor ? previousGroup : null;
  }

  const currentIndex = ORDER.indexOf(currentGroup);
  if (currentIndex > previousIndex) {
    const line = minOf(currentGroup) * (1 + GROUP_MOVE_BUFFER);
    return current >= line ? currentGroup : previousGroup;
  }

  const line = minOf(previousGroup) * (1 - GROUP_MOVE_BUFFER);
  return current <= line ? currentGroup : previousGroup;
}

export function freshnessState(
  count: number | null | undefined,
  observedAt: string | null | undefined,
  now = Date.now(),
): FreshnessState {
  if (count == null) return 'not_measured';
  if (!observedAt) return 'update_overdue';
  const observed = new Date(observedAt).getTime();
  if (Number.isNaN(observed)) return 'update_overdue';
  const ageDays = (now - observed) / (1000 * 60 * 60 * 24);
  return ageDays <= FRESHNESS_WINDOW_DAYS ? 'recently_checked' : 'update_overdue';
}

export const FRESHNESS_LABEL: Record<FreshnessState, string> = {
  recently_checked: 'Recently checked',
  update_overdue: 'Update overdue',
  not_measured: 'Not measured yet',
};
