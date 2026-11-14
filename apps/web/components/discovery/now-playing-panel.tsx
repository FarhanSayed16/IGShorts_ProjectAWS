import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';

export function NowPlayingPanel({
  track,
  onSelect,
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
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6 mb-6 grid sm:grid-cols-[160px_1fr] gap-4">
      <div className="aspect-square bg-[var(--canvas)] border border-[var(--line)] flex items-center justify-center text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
        {track.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          'Artwork'
        )}
      </div>
      <div className="flex flex-col justify-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">Now Playing</p>
        <h2 className="chart-title text-3xl leading-none">{track.title}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{track.artist}</p>
        {track.sourceLabel === 'editorial' && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">Editorial selection</p>
        )}
        <div className="flex gap-4 pt-2 text-[11px] font-bold uppercase tracking-wider">
          {track.spotifyUrl && (
            <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Listen on Spotify
            </a>
          )}
          {track.youtubeUrl && (
            <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Listen on YouTube
            </a>
          )}
          {onSelect && (
            <button type="button" className="hover:underline" onClick={() => onSelect(track.id)}>
              Keep selected
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
