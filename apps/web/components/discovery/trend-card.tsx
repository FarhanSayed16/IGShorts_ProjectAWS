import React from 'react';
import Link from 'next/link';
import { TREND_CATEGORY_LABELS, TrendCard as TrendCardDto } from '@igshorts/shared';

const STATUS_LABEL: Record<string, string> = {
  popular: 'Popular',
  rising: 'Rising',
  new: 'New',
};

function categoryHref(category: string) {
  return `/trending/${category.replace(/_/g, '-')}`;
}

export function TrendCard({ trend }: { trend: TrendCardDto }) {
  return (
    <article className="border border-[var(--line)] bg-[var(--surface)] flex flex-col h-full">
      <div className="aspect-[16/10] bg-[var(--canvas)] border-b border-[var(--line)] flex items-center justify-center text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
        {trend.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trend.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          TREND_CATEGORY_LABELS[trend.category]
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          <Link href={categoryHref(trend.category)} className="hover:underline">
            {TREND_CATEGORY_LABELS[trend.category]}
          </Link>
          <span className="text-[var(--ink-muted)]">{STATUS_LABEL[trend.status] || trend.status}</span>
          <span className="text-[var(--ink-muted)]">{trend.region}</span>
        </div>
        <h3 className="font-display text-xl leading-tight">{trend.title}</h3>
        {trend.summary && (
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed line-clamp-3">{trend.summary}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
          <span>
            {trend.sourceLabel === 'editorial' ? 'Editorial selection' : trend.sourceName || trend.sourceLabel}
          </span>
          {trend.sourceUrl &&
            (/^https?:\/\//i.test(trend.sourceUrl) ? (
              <a
                href={trend.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--ink)] hover:underline"
              >
                Open →
              </a>
            ) : (
              <Link href={trend.sourceUrl} className="font-semibold text-[var(--ink)] hover:underline">
                Open →
              </Link>
            ))}
        </div>
      </div>
    </article>
  );
}
