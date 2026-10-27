import React from 'react';

interface CountPoint {
  observedAt: string;
  followerCount: number | null;
}

export const CountLine: React.FC<{ history: CountPoint[] }> = ({ history }) => {
  const points = [...history]
    .filter((row): row is { observedAt: string; followerCount: number } => row.followerCount != null)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

  if (points.length < 2) {
    return (
      <p className="mt-4 text-xs text-[var(--ink-muted)]">
        One stored reading. A line appears after the next check.
      </p>
    );
  }

  const values = points.map((point) => point.followerCount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 320;
  const height = 72;
  const coords = values.map((value, index) => {
    const x = 4 + (index / (values.length - 1)) * (width - 8);
    const y = max === min ? height / 2 : height - 8 - ((value - min) / (max - min)) * (height - 16);
    return `${x},${y}`;
  });
  const same = min === max;

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-16 text-[var(--ink)]"
        role="img"
        aria-label="Stored count across checks"
      >
        <polyline points={coords.join(' ')} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        {same
          ? 'The stored count is the same on every check.'
          : `${points.length} checks, oldest to newest.`}
      </p>
    </div>
  );
};
