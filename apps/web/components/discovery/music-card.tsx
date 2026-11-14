import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';

export function MusicCard({ track }: { track: MusicTrackCard }) {
  return (
    <article className="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] border border-[var(--line)] bg-[var(--surface)] shrink-0 overflow-hidden hover:border-[var(--ink)] transition-colors">
      <div className="aspect-square bg-[var(--canvas)] border-b border-[var(--line)]">
        <DiscoveryMedia
          imageUrl={track.artworkUrl}
          category="music"
          alt={`${track.title} by ${track.artist}`}
          label={track.title}
        />
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{track.title}</h3>
        <p className="text-xs text-[var(--ink-muted)] line-clamp-1">{track.artist}</p>
        {track.sourceLabel === 'editorial' && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
            Editorial selection
          </p>
        )}
        {track.creatorUsageCount != null && (
          <p className="text-[10px] text-[var(--ink-muted)]">
            Used by {track.creatorUsageCount.toLocaleString()} indexed creators
          </p>
        )}
        <div className="flex gap-3 pt-2 text-[10px] font-bold uppercase tracking-wider">
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-[var(--ink)]"
            >
              Spotify
            </a>
          )}
          {track.youtubeUrl && (
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-[var(--ink)]"
            >
              YouTube
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
