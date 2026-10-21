import React from 'react';
import Link from 'next/link';
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
        <p>
          <span className="font-semibold text-[var(--ink)] uppercase tracking-wider">
            {meta.title}
          </span>
          <span className="mx-2">·</span>
          As of{' '}
          <span suppressHydrationWarning className="text-[var(--ink)]">
            {formatAsOf(meta.as_of)}
          </span>
          <span className="mx-2">·</span>
          {meta.source_label}
        </p>
        <Link href="/methodology" className="font-semibold uppercase tracking-wider hover:text-[var(--ink)]">
          How ranks work
        </Link>
      </div>
    </aside>
  );
};
