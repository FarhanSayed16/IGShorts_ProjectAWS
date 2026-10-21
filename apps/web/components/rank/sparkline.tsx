import React, { useId } from 'react';

interface SparklineProps {
  previous: number | null;
  current: number | null;
}

export function Sparkline({ previous, current }: SparklineProps) {
  const gradientId = useId();

  if (current == null) {
    return <span className="text-[10px] text-[var(--neutral-400)]">—</span>;
  }

  const start = previous ?? current;
  const isUp = current >= start;
  const isFlat = current === start;

  // Normalize heights to 20px height viewBox (padding 3px top/bottom)
  const range = Math.max(Math.abs(current - start), current * 0.005, 1);
  const minVal = Math.min(start, current);
  const maxVal = Math.max(start, current, minVal + range);

  const getY = (val: number) => {
    if (maxVal === minVal) return 10;
    const norm = (val - minVal) / (maxVal - minVal);
    // norm 0 -> 16, norm 1 -> 4
    return 16 - norm * 12;
  };

  const y1 = getY(start);
  const y2 = getY(current);

  // Intermediate subtle curve control points
  const p1x = 2;
  const p1y = y1;
  const c1x = 18;
  const c1y = y1 + (y2 - y1) * 0.2;
  const c2x = 36;
  const c2y = y1 + (y2 - y1) * 0.8;
  const p2x = 52;
  const p2y = y2;

  const pathD = `M ${p1x},${p1y} C ${c1x},${c1y} ${c2x},${c2y} ${p2x},${p2y}`;
  const areaD = `${pathD} L ${p2x},20 L ${p1x},20 Z`;

  const strokeColor = isFlat
    ? 'var(--neutral-400)'
    : isUp
      ? 'var(--status-up)'
      : 'var(--status-down)';

  const fillColor = isFlat ? '#94A3B8' : isUp ? '#10B981' : '#EF4444';

  return (
    <svg
      width="54"
      height="20"
      viewBox="0 0 54 20"
      aria-hidden="true"
      className="inline-block overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />
      {/* Trend line */}
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
      {/* End point dot */}
      <circle cx={p2x} cy={p2y} r="2" fill={strokeColor} />
    </svg>
  );
}
