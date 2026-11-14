import React from 'react';
import Link from 'next/link';

interface EditorialMastheadProps {
  totalProfiles?: number;
  asOf?: string | null;
}

export function EditorialMasthead({
  totalProfiles = 12107,
  asOf,
}: EditorialMastheadProps) {
  const formattedDate = asOf
    ? new Date(asOf).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 2026';

  return (
    <section className="mb-8 border-b border-[var(--line)] pb-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-2">
            <span className="text-[var(--accent)]">● Live Observatory</span>
            <span>·</span>
            <span>Edition {formattedDate}</span>
            <span>·</span>
            <span>Standard Competition Ranking (1224)</span>
          </div>
          <h1 className="chart-title text-4xl sm:text-6xl lg:text-7xl leading-[0.92] text-[var(--ink)]">
            Public People Charts <span className="text-[var(--accent)]">&</span> Cultural Momentum
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--ink-muted)] max-w-3xl leading-relaxed">
            Curated watchlist ranking public Instagram figures by verified follower metrics — not impressions, not algorithmic guesses. Paired with daily discovery across trending tracks, technology updates, and creator culture.
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]">
          <div className="text-left md:text-right">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Tracked Watchlist
            </span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] tabular-nums">
              {totalProfiles.toLocaleString()}
            </span>
          </div>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors"
          >
            How ranks work →
          </Link>
        </div>
      </div>
    </section>
  );
}
