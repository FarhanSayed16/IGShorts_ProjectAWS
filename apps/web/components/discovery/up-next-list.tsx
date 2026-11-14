import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';

export function UpNextList({
  tracks,
  activeId,
  onSelect,
}: {
  tracks: MusicTrackCard[];
  activeId?: string | null;
  onSelect: (track: MusicTrackCard) => void;
}) {
  if (tracks.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Up Next in Discovery
        </h3>
        <span className="text-[10px] text-[var(--ink-faint)] uppercase tracking-wider">
          {tracks.length} tracks queued
        </span>
      </div>
      <ul className="border border-[var(--line)] divide-y divide-[var(--line)] bg-[var(--surface)]">
        {tracks.map((track, idx) => {
          const isActive = activeId === track.id;
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => onSelect(track)}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                  isActive
                    ? 'bg-[var(--canvas)] border-l-2 border-[var(--accent)] font-semibold'
                    : 'hover:bg-[var(--canvas)]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-mono text-xs text-[var(--ink-faint)] w-5 shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <span className="block font-semibold text-sm truncate text-[var(--ink)]">
                      {track.title}
                    </span>
                    <span className="block text-xs text-[var(--ink-muted)] truncate">
                      {track.artist}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-sm">
                      ● Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] group-hover:text-[var(--ink)]">
                      Play card →
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
