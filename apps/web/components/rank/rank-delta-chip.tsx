import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatRankDelta } from '@/lib/format/formatters';

interface RankDeltaChipProps {
  delta: number;
  size?: 'sm' | 'md';
}

export const RankDeltaChip: React.FC<RankDeltaChipProps> = ({ delta }) => {
  const { text, direction } = formatRankDelta(delta);

  if (direction === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--up)] text-xs font-bold tabular-nums">
        <ArrowUp className="w-3 h-3" />
        {text}
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--down)] text-xs font-bold tabular-nums">
        <ArrowDown className="w-3 h-3" />
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[var(--ink-faint)]">
      <Minus className="w-3.5 h-3.5" />
    </span>
  );
};
