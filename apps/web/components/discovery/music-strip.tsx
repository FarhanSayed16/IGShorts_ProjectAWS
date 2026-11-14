'use client';

import React from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';
import { MusicTrackCard } from '@igshorts/shared';
import { MusicCard } from './music-card';
import { useAudioPlayer } from '@/lib/audio-player-context';
import { LIVE_RADIO_STATIONS, stationToPlayable } from '@/lib/music-playback-catalog';

export function MusicStrip({
  title,
  tracks,
  href = '/music',
}: {
  title: string;
  tracks: MusicTrackCard[];
  href?: string;
}) {
  const { playTrack, playingTrack, isPlaying, togglePlay } = useAudioPlayer();

  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="chart-title text-3xl sm:text-4xl">{title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--ink-muted)] max-w-xl">
            Real in-app preview streams + live radio. Full commercial tracks open on Spotify / YouTube.
          </p>
        </div>
        <Link href={href} className="text-xs font-bold uppercase tracking-[0.16em] hover:underline shrink-0">
          Music →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {LIVE_RADIO_STATIONS.map((station) => {
          const active = isPlaying && playingTrack?.id === station.id;
          return (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                if (active) togglePlay();
                else playTrack(stationToPlayable(station));
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]'
              }`}
              aria-pressed={active}
            >
              <Radio className={`w-3 h-3 ${active ? 'animate-pulse' : ''}`} />
              {active ? 'Live · Pause' : station.name}
            </button>
          );
        })}
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
