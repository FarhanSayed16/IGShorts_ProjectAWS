'use client';

import React from 'react';
import { useAudioPlayer } from '@/lib/audio-player-context';
import { DiscoveryMedia } from './discovery-media';

export function InteractiveMediaDock() {
  const { playingTrack, isPlaying, isMuted, togglePlay, stopTrack, toggleMute } = useAudioPlayer();

  if (!playingTrack) return null;

  return (
    <aside
      aria-label="Audio Discovery Player"
      className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto z-50 bg-[var(--surface)]/95 backdrop-blur-md border-2 border-[var(--ink)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-6 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Left: Artwork + Track details */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-900 border border-[var(--line)] overflow-hidden">
          {playingTrack.artwork_url ? (
            <DiscoveryMedia
              imageUrl={playingTrack.artwork_url}
              category="music"
              alt={playingTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[var(--ink-muted)]">
              AUDIO
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-live-radar" />
              LO-FI PREVIEW
            </span>
            {playingTrack.reels_count && (
              <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--ink-muted)]">
                • {playingTrack.reels_count.toLocaleString()} reels
              </span>
            )}
          </div>
          <h4 className="font-display text-sm sm:text-base font-bold text-[var(--ink)] truncate uppercase">
            {playingTrack.title}
          </h4>
          <p className="text-xs text-[var(--ink-muted)] truncate">
            {playingTrack.artist}
          </p>
        </div>
      </div>

      {/* Center: Live animated Soundwave Equalizer */}
      <div
        className="hidden md:flex items-center gap-1 px-3 py-1 bg-[var(--canvas)] border border-[var(--line)] rounded"
        title={isPlaying ? 'Audio actively playing' : 'Audio paused'}
      >
        <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-1' : 'h-1.5'}`} />
        <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-2' : 'h-3'}`} />
        <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-3' : 'h-1'}`} />
        <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-4' : 'h-3.5'}`} />
        <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-5' : 'h-2'}`} />
        <span className="ml-2 font-mono text-[10px] text-[var(--ink-muted)] uppercase">
          {isPlaying ? 'ACTIVE' : 'PAUSED'}
        </span>
      </div>

      {/* Right: Controls & Dismiss */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Play / Pause Toggle */}
        <button
          type="button"
          onClick={() => togglePlay()}
          aria-label={isPlaying ? 'Pause lo-fi audio' : 'Play lo-fi audio'}
          className="p-2 sm:px-3 sm:py-2 bg-[var(--ink)] text-[var(--canvas)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[var(--accent)] hover:text-black transition-colors"
        >
          {isPlaying ? (
            <>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="hidden sm:inline">Resume</span>
            </>
          )}
        </button>

        {/* Mute button */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          title={isMuted ? 'Unmute synth' : 'Mute synth'}
        >
          {isMuted ? (
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* External Full Track Links */}
        {playingTrack.spotify_search_url && (
          <a
            href={playingTrack.spotify_search_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono text-[var(--ink-muted)] hover:text-[#1DB954] transition-colors"
            title="Open on Spotify"
          >
            Spotify ↗
          </a>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={stopTrack}
          aria-label="Close audio player"
          className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] transition-colors"
        >
          <svg className="w-4 h-4 stroke-current stroke-2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
