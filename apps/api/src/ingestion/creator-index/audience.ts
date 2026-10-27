export type AudienceLabel =
  | 'Not measured yet'
  | 'Not grouped yet'
  | 'Community'
  | 'Established'
  | 'Public'
  | 'Major';

export type FreshnessLabel = 'recently_checked' | 'update_overdue' | 'not_measured_yet';

export const AUDIENCE_HYSTERESIS_PERCENT = 15;
export const DEFAULT_FRESHNESS_WINDOW_DAYS = 14;

const BANDS: { label: Exclude<AudienceLabel, 'Not measured yet' | 'Not grouped yet'>; min: number }[] = [
  { label: 'Community', min: 10_000 },
  { label: 'Established', min: 100_000 },
  { label: 'Public', min: 1_000_000 },
  { label: 'Major', min: 10_000_000 },
];

export function audienceGroup(count: number | null | undefined): AudienceLabel {
  if (count == null || !Number.isFinite(count) || count < 0) return 'Not measured yet';
  if (count < 10_000) return 'Not grouped yet';
  if (count < 100_000) return 'Community';
  if (count < 1_000_000) return 'Established';
  if (count < 10_000_000) return 'Public';
  return 'Major';
}

function buffer(min: number, percent = AUDIENCE_HYSTERESIS_PERCENT): { up: number; down: number } {
  const ratio = percent / 100;
  return { up: min * (1 + ratio), down: min * (1 - ratio) };
}

/**
 * First count uses the natural group. A later count stays put until it clears
 * the 15% line. A failed reading is a null count and must not become zero.
 */
export function placeAudienceGroup(
  current: number | null | undefined,
  previous: number | null | undefined,
  hysteresisPercent = AUDIENCE_HYSTERESIS_PERCENT,
): AudienceLabel {
  if (current == null || !Number.isFinite(current) || current < 0) return 'Not measured yet';
  if (previous == null || !Number.isFinite(previous) || previous < 0) return audienceGroup(current);

  const currentGroup = audienceGroup(current);
  const previousGroup = audienceGroup(previous);
  if (currentGroup === previousGroup) return currentGroup;
  if (previousGroup === 'Not measured yet') return audienceGroup(current);

  if (previousGroup === 'Not grouped yet') {
    let placed: AudienceLabel = 'Not grouped yet';
    for (const band of BANDS) {
      if (current >= buffer(band.min, hysteresisPercent).up) placed = band.label;
    }
    return placed;
  }

  const currentIndex = BANDS.findIndex((band) => band.label === currentGroup);
  const previousIndex = BANDS.findIndex((band) => band.label === previousGroup);

  if (currentGroup === 'Not grouped yet') {
    const floor = buffer(BANDS[previousIndex]!.min, hysteresisPercent).down;
    return current <= floor ? 'Not grouped yet' : previousGroup;
  }

  if (currentIndex > previousIndex) {
    const line = buffer(BANDS[currentIndex]!.min, hysteresisPercent).up;
    return current >= line ? currentGroup : previousGroup;
  }

  const line = buffer(BANDS[previousIndex]!.min, hysteresisPercent).down;
  return current <= line ? currentGroup : previousGroup;
}

export function freshnessState(
  count: number | null | undefined,
  observedAt: string | null | undefined,
  now = Date.now(),
  windowDays = DEFAULT_FRESHNESS_WINDOW_DAYS,
): FreshnessLabel {
  if (count == null) return 'not_measured_yet';
  if (!observedAt) return 'update_overdue';
  const observed = new Date(observedAt).getTime();
  if (Number.isNaN(observed)) return 'update_overdue';
  const ageDays = (now - observed) / (1000 * 60 * 60 * 24);
  return ageDays <= windowDays ? 'recently_checked' : 'update_overdue';
}

export function preserveAfterFailedRefresh(last: {
  count: number | null;
  observedAt: string | null;
}): { count: number | null; group: AudienceLabel; freshness: FreshnessLabel } {
  return {
    count: last.count,
    group: audienceGroup(last.count),
    freshness: freshnessState(last.count, last.observedAt),
  };
}
