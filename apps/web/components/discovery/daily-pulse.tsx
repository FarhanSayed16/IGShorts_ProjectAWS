import React from 'react';
import Link from 'next/link';
import { DailyPulseDay } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';

const KIND_LABEL: Record<string, string> = {
  song: 'Song of the Day',
  story: 'Story of the Day',
  trend: 'Trend of the Day',
  creator: 'Creator of the Day',
  moment: 'Internet Moment of the Day',
};

const KIND_CATEGORY: Record<string, string> = {
  song: 'music',
  story: 'news',
  trend: 'technology',
  creator: 'entertainment',
  moment: 'internet_culture',
};

export function DailyPulse({ pulse }: { pulse: DailyPulseDay | null }) {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="chart-title text-3xl sm:text-4xl">The Daily Pulse</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Five editorial slots for today — song, story, trend, creator, and internet moment.
          </p>
          {pulse?.date && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              {pulse.date}
            </p>
          )}
        </div>
      </div>
      {!pulse || pulse.items.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Daily Pulse will refresh when selections are ready.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pulse.items.map((item) => {
            const href = item.linkUrl || '/trending';
            const external = /^https?:\/\//i.test(href);
            const body = (
              <>
                <div className="aspect-[16/9] border-b border-[var(--line)]">
                  <DiscoveryMedia
                    imageUrl={item.imageUrl}
                    category={KIND_CATEGORY[item.kind]}
                    alt={item.title}
                    label={KIND_LABEL[item.kind]}
                  />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                    {KIND_LABEL[item.kind] || item.kind}
                    {item.sourceLabel === 'editorial' ? ' · Editorial' : ''}
                  </p>
                  <h3 className="font-display text-xl leading-tight">{item.title}</h3>
                  {item.summary && (
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  )}
                  <span className="mt-auto pt-2 text-[11px] font-bold uppercase tracking-wider">
                    Explore →
                  </span>
                </div>
              </>
            );

            return external ? (
              <a
                key={item.kind}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[var(--line)] bg-[var(--surface)] flex flex-col overflow-hidden hover:border-[var(--ink)] transition-colors"
              >
                {body}
              </a>
            ) : (
              <Link
                key={item.kind}
                href={href}
                className="border border-[var(--line)] bg-[var(--surface)] flex flex-col overflow-hidden hover:border-[var(--ink)] transition-colors"
              >
                {body}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
