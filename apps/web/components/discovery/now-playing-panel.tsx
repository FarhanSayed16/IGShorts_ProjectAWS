import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';

export function NowPlayingPanel({
  track,
}: {
  track: MusicTrackCard | null;
  onSelect?: (id: string) => void;
}) {
  if (!track) {
    return (
      <section className="border border-[var(--line)] bg-[var(--surface)] p-6 mb-6">
        <p className="text-sm text-[var(--ink-muted)]">No featured track yet.</p>
      </section>
    );
  }

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6 mb-6 grid sm:grid-cols-[180px_1fr] gap-4 overflow-hidden">
      <div className="aspect-square bg-[var(--canvas)] border border-[var(--line)] overflow-hidden">
        <DiscoveryMedia
          imageUrl={track.artworkUrl}
          category="music"
          alt={`${track.title} by ${track.artist}`}
          label={track.title}
        />
      </div>
      <div className="flex flex-col justify-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Now Playing
        </p>
        <h2 className="chart-title text-3xl leading-none">{track.title}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{track.artist}</p>
        {track.sourceLabel === 'editorial' && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
            Editorial selection · Opens Spotify or YouTube
          </p>
        )}
        <div className="flex flex-wrap gap-4 pt-2 text-[11px] font-bold uppercase tracking-wider">
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--canvas)] px-3 py-2 hover:bg-transparent hover:text-[var(--ink)] transition-colors"
            >
              Listen on Spotify
            </a>
          )}
          {track.youtubeUrl && (
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--line)] px-3 py-2 hover:border-[var(--ink)]"
            >
              Listen on YouTube
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
