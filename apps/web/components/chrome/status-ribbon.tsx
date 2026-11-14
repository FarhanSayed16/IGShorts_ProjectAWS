import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { ChartMeta } from '@igshorts/shared';
import { formatRelativeTime } from '@/lib/format/formatters';

function formatAsOf(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return formatRelativeTime(iso);
  }
}

interface StatusRibbonProps {
  meta?: ChartMeta;
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({ meta }) => {
  if (!meta) return null;

  return (
    <aside
      aria-label="Chart data freshness"
      className="w-full border-b border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] text-[11px] py-2 px-4 sm:px-6"
    >
      <div className="max-w-[1120px] mx-auto flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-[var(--ink)] uppercase tracking-wider">
            {meta.title}
          </span>
          <span>·</span>
          <span>
            As of{' '}
            <span suppressHydrationWarning className="text-[var(--ink)] font-medium">
              {formatAsOf(meta.as_of)}
            </span>
          </span>
          <span>·</span>
          <span>{meta.source_label}</span>
          {meta.is_stale && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn)]/40 ml-1">
              <AlertTriangle className="w-3 h-3" />
              Cycle baseline
            </span>
          )}
        </p>
        <Link href="/methodology" className="font-semibold uppercase tracking-wider hover:text-[var(--ink)]">
          How ranks work
        </Link>
      </div>
    </aside>
  );
};
