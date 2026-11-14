import React from 'react';
import Link from 'next/link';
import { ChartEntry } from '@igshorts/shared';
import { Avatar } from '@/components/rank/avatar';
import { RankDeltaChip } from '@/components/rank/rank-delta-chip';
import { FollowerCount } from '@/components/rank/follower-count';

export function CreatorSpotlight({
  creators,
  mode = 'movers',
}: {
  creators: ChartEntry[];
  mode?: 'movers' | 'chart';
}) {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="chart-title text-3xl sm:text-4xl">Creator spotlight</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {mode === 'movers'
              ? 'Biggest recent moves on the Global 100.'
              : 'Top names from the Global 100 ranking.'}
          </p>
        </div>
        <Link href={mode === 'movers' ? '/movers' : '/charts/global'} className="text-xs font-bold uppercase tracking-[0.16em] hover:underline shrink-0">
          {mode === 'movers' ? 'Movers →' : 'Charts →'}
        </Link>
      </div>
      {creators.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Creator moves appear after two successful ranking runs.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {creators.map((creator) => (
            <Link
              key={creator.username}
              href={`/profiles/${creator.username}`}
              className="border border-[var(--line)] bg-[var(--surface)] p-4 flex gap-3 hover-lift hover:border-[var(--ink)] transition-all"
            >
              <Avatar src={creator.avatar_url} name={creator.display_name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{creator.display_name}</p>
                <p className="text-xs text-[var(--ink-muted)]">@{creator.username}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold">#{creator.rank}</span>
                  <RankDeltaChip previousRank={creator.previous_rank} delta={creator.rank_delta} />
                  <FollowerCount count={creator.follower_count} />
                </div>
                {creator.category && (
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
                    {creator.category}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
