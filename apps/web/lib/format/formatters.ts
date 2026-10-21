/**
 * Formatting utilities for followers, deltas, and dates
 */

export function formatFollowers(count: number | null | undefined): string {
  if (count === null || count === undefined) {
    return 'Unranked';
  }

  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }

  return count.toLocaleString('en-US');
}

export function formatExactNumber(count: number | null | undefined): string {
  if (count === null || count === undefined) {
    return 'Count not captured';
  }
  return count.toLocaleString('en-US');
}

export function formatRankDelta(delta: number): {
  text: string;
  direction: 'up' | 'down' | 'flat';
} {
  if (delta > 0) {
    return { text: `+${delta}`, direction: 'up' };
  }
  if (delta < 0) {
    return { text: `${delta}`, direction: 'down' };
  }
  return { text: '—', direction: 'flat' };
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}
