import React from 'react';
import Link from 'next/link';
import { MusicTrackCard } from '@igshorts/shared';
import { MusicCard } from './music-card';

export function MusicStrip({
  title,
  tracks,
  href = '/music',
}: {
  title: string;
  tracks: MusicTrackCard[];
  href?: string;
}) {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="chart-title text-3xl sm:text-4xl">{title}</h2>
        <Link href={href} className="text-xs font-bold uppercase tracking-[0.16em] hover:underline">
          Music →
        </Link>
      </div>
      {tracks.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Music discovery coming soon.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {tracks.map((track) => (
            <MusicCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </section>
  );
}
