import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { rankMoveKind } from '@/lib/format/formatters';

interface RankDeltaChipProps {
  previousRank: number | null | undefined;
  delta: number;
}

const SINCE = 'since last chart';

export const RankDeltaChip: React.FC<RankDeltaChipProps> = ({ previousRank, delta }) => {
  const kind = rankMoveKind(previousRank, delta);

  if (kind === 'debut') {
    return (
      <span
        className="inline-block border border-[var(--ink)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] leading-none"
        title="Debut — one ranking so far, no previous place"
      >
        Debut
      </span>
    );
  }

  if (kind === 'up') {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[var(--up)] text-xs font-bold tabular-nums"
        title={`Up ${delta} ${SINCE}`}
      >
        <ArrowUp className="w-3 h-3" aria-hidden />
        <span className="sr-only">Up </span>
        {delta}
        <span className="sr-only"> {SINCE}</span>
      </span>
    );
  }

  if (kind === 'down') {
    const steps = Math.abs(delta);
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[var(--down)] text-xs font-bold tabular-nums"
        title={`Down ${steps} ${SINCE}`}
      >
        <ArrowDown className="w-3 h-3" aria-hidden />
        <span className="sr-only">Down </span>
        {steps}
        <span className="sr-only"> {SINCE}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-faint)]"
      title={`No change ${SINCE}`}
    >
      <Minus className="w-3 h-3" aria-hidden />
      No change
    </span>
  );
};
