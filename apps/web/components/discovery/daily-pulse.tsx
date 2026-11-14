import React from 'react';
import Link from 'next/link';
import { DailyPulseDay } from '@igshorts/shared';

const KIND_LABEL: Record<string, string> = {
  song: 'Song of the Day',
  story: 'Story of the Day',
  trend: 'Trend of the Day',
  creator: 'Creator of the Day',
  moment: 'Internet Moment of the Day',
};

export function DailyPulse({ pulse }: { pulse: DailyPulseDay | null }) {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="chart-title text-3xl sm:text-4xl">The Daily Pulse</h2>
          {pulse?.date && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              {pulse.date}
            </p>
          )}
        </div>
      </div>
      {!pulse || pulse.items.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Daily Pulse will refresh when selections are ready.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pulse.items.map((item) => (
            <article key={item.kind} className="border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                {KIND_LABEL[item.kind] || item.kind}
                {item.sourceLabel === 'editorial' ? ' · Editorial' : ''}
              </p>
              <h3 className="font-display text-xl leading-tight">{item.title}</h3>
              {item.summary && (
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed line-clamp-3">{item.summary}</p>
              )}
              {item.linkUrl && (
                <Link href={item.linkUrl} className="mt-auto pt-2 text-[11px] font-bold uppercase tracking-wider hover:underline">
                  Explore →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
