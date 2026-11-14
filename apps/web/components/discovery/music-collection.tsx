import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';
import { MusicCard } from './music-card';

export function MusicCollection({ title, tracks }: { title: string; tracks: MusicTrackCard[] }) {
  if (tracks.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="chart-title text-2xl sm:text-3xl mb-5">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {tracks.map((track) => (
          <MusicCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
}
