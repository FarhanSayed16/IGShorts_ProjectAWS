'use client';

import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { MusicTrackCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';
import { useAudioPlayer } from '@/lib/audio-player-context';
import { extractSpotifyEmbedUrl, resolveTrackStreamUrl } from '@/lib/music-playback-catalog';
import { trackEvent } from '@/lib/analytics/beacon';
import { SpotifyEmbedModal } from './spotify-embed-modal';

export function MusicCard({ track }: { track: MusicTrackCard }) {
  const { playTrack, togglePlay, playingTrack, isPlaying } = useAudioPlayer();
  const [embedOpen, setEmbedOpen] = useState(false);
  const canEmbed = Boolean(extractSpotifyEmbedUrl(track.spotifyUrl));
  const isCurrentlyPlaying =
    isPlaying && (playingTrack?.id === track.id || playingTrack?.title === track.title);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrentlyPlaying) {
      togglePlay();
      return;
    }
    const streamUrl = resolveTrackStreamUrl(track.title, track.previewAudioUrl);
    const usingDbPreview = Boolean(track.previewAudioUrl);
    trackEvent('music_preview', { meta: { trackId: track.id, title: track.title } });
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      artwork_url: track.artworkUrl,
      audio_url: streamUrl,
      mode: 'stream',
      source_note: usingDbPreview
        ? 'Licensed preview stream'
        : 'Preview bed (not the commercial track)',
      spotify_search_url:
        track.spotifyUrl ||
        `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`,
      youtube_search_url:
        track.youtubeUrl ||
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    });
  };

  return (
    <article className="min-w-[190px] w-[190px] sm:min-w-[210px] sm:w-[210px] border border-[var(--line)] bg-[var(--surface)] shrink-0 overflow-hidden hover-lift hover:border-[var(--ink)] transition-all">
      <div className="relative aspect-square bg-neutral-900 border-b border-[var(--line)] group overflow-hidden">
        <DiscoveryMedia
          imageUrl={track.artworkUrl}
          category="music"
          alt={`${track.title} by ${track.artist}`}
          label={track.title}
        />

        <div
          className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${
            isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={
              isCurrentlyPlaying
                ? `Pause preview of ${track.title}`
                : `Play preview of ${track.title}`
            }
            className="p-3 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] shadow-xl hover:scale-110 transition-transform"
          >
            {isCurrentlyPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
        </div>

        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/85 text-[var(--accent)] border border-[var(--accent)] text-[9px] font-mono uppercase font-bold">
            <span className="w-1 h-2.5 bg-[var(--accent)] animate-soundwave-1" />
            <span className="w-1 h-2.5 bg-[var(--accent)] animate-soundwave-2" />
            <span className="w-1 h-2.5 bg-[var(--accent)] animate-soundwave-3" />
            <span className="ml-1">Playing</span>
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-1.5">
        <h3 className="font-display font-bold text-sm uppercase leading-tight line-clamp-1 text-[var(--ink)]">
          {track.title}
        </h3>
        <p className="text-xs text-[var(--ink-muted)] line-clamp-1 font-sans">{track.artist}</p>

        {track.creatorUsageCount != null ? (
          <p className="text-[10px] font-mono text-[var(--ink-muted)]">
            {track.creatorUsageCount.toLocaleString('en-US')} · editorial estimate
          </p>
        ) : (
          <p className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
            {track.sourceLabel === 'editorial' ? 'Editorial selection' : 'Discovery track'}
          </p>
        )}
        <p className="text-[9px] font-mono text-[var(--ink-muted)]">
          {track.previewAudioUrl
            ? 'Licensed preview · full track on SP / YT'
            : 'Preview bed · full track on SP / YT'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-[10px] font-mono font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={handlePlayClick}
            className="text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
          <div className="flex gap-2">
            {track.spotifyUrl && (
              canEmbed ? (
                <button
                  type="button"
                  onClick={() => setEmbedOpen(true)}
                  className="text-[var(--ink-muted)] hover:text-[#1DB954]"
                  title="Play official Spotify embed"
                >
                  SP
                </button>
              ) : (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink-muted)] hover:text-[#1DB954]"
                  title="Listen on Spotify"
                >
                  SP
                </a>
              )
            )}
            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--ink-muted)] hover:text-[#FF0000]"
                title="Watch on YouTube"
              >
                YT
              </a>
            )}
          </div>
        </div>
      </div>
      <SpotifyEmbedModal
        spotifyUrl={track.spotifyUrl}
        title={track.title}
        open={embedOpen}
        onClose={() => setEmbedOpen(false)}
      />
    </article>
  );
}
