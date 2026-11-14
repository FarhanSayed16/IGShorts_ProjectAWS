'use client';

import React from 'react';
import { Pause, Play } from 'lucide-react';
import { MusicTrackCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';
import { useAudioPlayer } from '@/lib/audio-player-context';
import { resolveTrackStreamUrl } from '@/lib/music-playback-catalog';

export function NowPlayingPanel({
  track,
}: {
  track: MusicTrackCard | null;
  onSelect?: (id: string) => void;
}) {
  const { playTrack, togglePlay, playingTrack, isPlaying } = useAudioPlayer();

  if (!track) {
    return (
      <section className="border border-[var(--line)] bg-[var(--surface)] p-6 mb-6">
        <p className="text-sm text-[var(--ink-muted)]">No featured track yet.</p>
      </section>
    );
  }

  const isActive =
    isPlaying && (playingTrack?.id === track.id || playingTrack?.title === track.title);

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
      return;
    }
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      artwork_url: track.artworkUrl,
      audio_url: resolveTrackStreamUrl(track.title),
      mode: 'stream',
      source_note: 'Preview bed (not the commercial track)',
      spotify_search_url:
        track.spotifyUrl ||
        `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`,
      youtube_search_url:
        track.youtubeUrl ||
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    });
  };

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6 mb-6 grid sm:grid-cols-[180px_1fr] gap-4 overflow-hidden">
      <div className="relative aspect-square bg-[var(--canvas)] border border-[var(--line)] overflow-hidden group">
        <DiscoveryMedia
          imageUrl={track.artworkUrl}
          category="music"
          alt={`${track.title} by ${track.artist}`}
          label={track.title}
        />
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <span className="p-3 rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </span>
        </button>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          {isActive ? 'Now Playing · In-app stream' : 'Featured Track'}
        </p>
        <h2 className="chart-title text-3xl leading-none">{track.title}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{track.artist}</p>
        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
          Preview plays in-app · Full track on Spotify / YouTube
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex items-center gap-1.5 border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] px-3 py-2 hover:opacity-90 transition-opacity"
          >
            {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isActive ? 'Pause preview' : 'Play preview'}
          </button>
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--canvas)] px-3 py-2 hover:bg-transparent hover:text-[var(--ink)] transition-colors"
            >
              Spotify
            </a>
          )}
          {track.youtubeUrl && (
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--line)] px-3 py-2 hover:border-[var(--ink)]"
            >
              YouTube
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
