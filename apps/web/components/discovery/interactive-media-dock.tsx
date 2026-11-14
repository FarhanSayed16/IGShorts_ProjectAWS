'use client';

import React from 'react';
import { useAudioPlayer } from '@/lib/audio-player-context';
import { DiscoveryMedia } from './discovery-media';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function InteractiveMediaDock() {
  const {
    playingTrack,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    togglePlay,
    stopTrack,
    toggleMute,
    setVolume,
    seek,
  } = useAudioPlayer();

  if (!playingTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Audio Discovery Player"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto z-50 bg-[var(--surface)]/95 backdrop-blur-md border-2 border-[var(--ink)] shadow-[0_16px_48px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Top Scrubber Progress Bar (Clickable/Seekable) */}
      <div
        className="relative w-full h-1.5 bg-[var(--line)] cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          seek(ratio * duration);
        }}
        role="slider"
        aria-label="Track progress"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
      >
        <div
          className="h-full bg-[var(--accent)] transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--ink)] border-2 border-[var(--accent)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Main Dock Body */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Artwork + Track details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-900 border border-[var(--line)] overflow-hidden rounded-sm">
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
                LO-FI AUDIO GROOVE
              </span>
              <span className="font-mono text-[10px] text-[var(--ink-muted)] tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <h4 className="font-display text-sm sm:text-base font-bold text-[var(--ink)] truncate uppercase">
              {playingTrack.title}
            </h4>
            <p className="text-xs text-[var(--ink-muted)] truncate">
              {playingTrack.artist}
            </p>
          </div>
        </div>

        {/* Center: Live animated Soundwave Equalizer & Time */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--canvas)] border border-[var(--line)] rounded-sm"
          title={isPlaying ? 'Audio actively streaming' : 'Audio paused'}
        >
          <div className="flex items-center gap-1">
            <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-1' : 'h-1.5'}`} />
            <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-2' : 'h-3'}`} />
            <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-3' : 'h-1'}`} />
            <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-4' : 'h-3.5'}`} />
            <span className={`w-1 bg-[var(--accent)] rounded-full ${isPlaying ? 'animate-soundwave-5' : 'h-2'}`} />
          </div>
          <span className="font-mono text-[10px] font-bold text-[var(--ink)] uppercase">
            {isPlaying ? 'ACTIVE GROOVE' : 'PAUSED'}
          </span>
        </div>

        {/* Right: Controls, Volume Slider, Deep Links, and Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => togglePlay()}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="p-2 sm:px-3 sm:py-2 bg-[var(--ink)] text-[var(--canvas)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[var(--accent)] hover:text-black transition-colors rounded-sm"
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
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          {/* Volume Control Slider */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-[var(--canvas)] border border-[var(--line)] rounded-sm">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-xs"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 accent-[var(--accent)] cursor-pointer"
              aria-label="Volume slider"
            />
          </div>

          {/* External Full Track Deep Links */}
          {playingTrack.spotify_search_url && (
            <a
              href={playingTrack.spotify_search_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#1DB954] hover:underline"
              title="Open full track on Spotify"
            >
              Spotify ↗
            </a>
          )}

          {playingTrack.youtube_search_url && (
            <a
              href={playingTrack.youtube_search_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF0000] hover:underline"
              title="Watch official video on YouTube"
            >
              YouTube ↗
            </a>
          )}

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={stopTrack}
            aria-label="Close audio player"
            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] transition-colors rounded-sm"
          >
            <svg className="w-4 h-4 stroke-current stroke-2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
