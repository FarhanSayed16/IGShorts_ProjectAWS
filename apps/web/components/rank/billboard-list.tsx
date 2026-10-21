import React from 'react';
import Link from 'next/link';
import { ChartEntry } from '@igshorts/shared';
import { Avatar } from './avatar';
import { FollowerCount } from './follower-count';
import { FollowerDelta } from './follower-delta';
import { RankDeltaChip } from './rank-delta-chip';
import { RankNumber } from './rank-number';

interface BillboardListProps {
  entries: ChartEntry[];
  featured?: boolean;
  caption?: string;
}

function FeaturedRow({ entry }: { entry: ChartEntry }) {
  const hasHistory = entry.previous_rank != null;

  return (
    <article className="bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-6">
      <div className="flex items-stretch gap-0">
        <RankNumber rank={entry.rank} size="hero" featured />
        <Link href={`/profiles/${entry.username}`} className="shrink-0">
          <Avatar src={entry.avatar_url} name={entry.display_name} size="hero" />
        </Link>
        <div className="flex-1 min-w-0 pl-4 sm:pl-6 flex flex-col justify-center">
          <Link href={`/profiles/${entry.username}`} className="group">
            <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
              <h2 className="font-display text-3xl sm:text-[44px] text-[var(--ink)] leading-[0.95] group-hover:underline">
                {entry.display_name}
              </h2>
              {!hasHistory && (
                <span className="mt-1.5 sm:mt-2">
                  <RankDeltaChip previousRank={entry.previous_rank} delta={entry.rank_delta} />
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">@{entry.username}</p>
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                Followers
              </div>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums">
                <FollowerCount count={entry.follower_count} />
              </div>
              <FollowerDelta
                previousCount={entry.previous_follower_count}
                delta={entry.follower_delta}
              />
            </div>
            {hasHistory ? (
              <dl className="grid grid-cols-3 gap-4 text-right text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                <div>
                  <dt>Last</dt>
                  <dd className="text-[var(--ink)] font-bold tabular-nums">{entry.previous_rank}</dd>
                </div>
                <div>
                  <dt>Move</dt>
                  <dd className="normal-case tracking-normal">
                    <RankDeltaChip previousRank={entry.previous_rank} delta={entry.rank_delta} />
                  </dd>
                  <dt className="mt-0.5 text-[9px] font-normal tracking-[0.12em] text-[var(--ink-faint)]">
                    Since last chart
                  </dt>
                </div>
                <div>
                  <dt>Peak</dt>
                  <dd className="text-[var(--ink)] font-bold tabular-nums">{entry.rank}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ChartRow({ entry }: { entry: ChartEntry }) {
  return (
    <article className="bg-[var(--surface)] border border-[var(--line)] px-3 sm:px-5 py-3 hover:border-[var(--ink)] transition-colors">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="w-10 sm:w-12 text-center shrink-0">
          <RankNumber rank={entry.rank} size="md" />
        </div>
        <Link href={`/profiles/${entry.username}`} className="shrink-0">
          <Avatar src={entry.avatar_url} name={entry.display_name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profiles/${entry.username}`}
            className="font-semibold text-[15px] sm:text-lg text-[var(--ink)] hover:underline truncate block"
          >
            {entry.display_name}
          </Link>
          <p className="text-xs text-[var(--ink-muted)] truncate">@{entry.username}</p>
        </div>
        <div className="w-[4.5rem] sm:w-24 text-right shrink-0">
          <RankDeltaChip previousRank={entry.previous_rank} delta={entry.rank_delta} />
        </div>
        <div className="text-right shrink-0">
          <div className="text-base sm:text-lg font-semibold tabular-nums">
            <FollowerCount count={entry.follower_count} />
          </div>
          <FollowerDelta
            previousCount={entry.previous_follower_count}
            delta={entry.follower_delta}
          />
        </div>
      </div>
    </article>
  );
}

export const BillboardList: React.FC<BillboardListProps> = ({
  entries,
  featured = true,
  caption,
}) => {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[var(--ink-muted)] border border-[var(--line)] bg-[var(--surface)]">
        No ranked accounts found matching criteria.
      </div>
    );
  }

  const lead = featured && entries[0]?.rank === 1 ? entries[0] : null;
  const rest = lead ? entries.slice(1) : entries;

  return (
    <div className="space-y-2">
      {caption && <h2 className="sr-only">{caption}</h2>}
      {lead && <FeaturedRow entry={lead} />}
      {rest.map((entry) => (
        <ChartRow key={entry.username} entry={entry} />
      ))}
    </div>
  );
};
