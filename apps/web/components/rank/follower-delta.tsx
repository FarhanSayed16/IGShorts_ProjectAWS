import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatSignedFollowers } from '@/lib/format/formatters';

interface FollowerDeltaProps {
  previousCount: number | null | undefined;
  delta: number | null | undefined;
}

/** Only render when a previous follower count exists. Never show +0 for missing history. */
export const FollowerDelta: React.FC<FollowerDeltaProps> = ({ previousCount, delta }) => {
  if (previousCount == null || delta == null) return null;
  if (delta === 0) return null;

  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${
        up ? 'text-[var(--up)]' : 'text-[var(--down)]'
      }`}
      title={`${formatSignedFollowers(delta)} followers since last chart`}
    >
      {up ? <ArrowUp className="w-3 h-3" aria-hidden /> : <ArrowDown className="w-3 h-3" aria-hidden />}
      {formatSignedFollowers(delta)}
      <span className="sr-only"> since last chart</span>
    </span>
  );
};
