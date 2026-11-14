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
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3">Up Next</h3>
      <ul className="border border-[var(--line)] divide-y divide-[var(--line)] bg-[var(--surface)]">
        {tracks.map((track) => (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => onSelect(track)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-[var(--canvas)] ${
                activeId === track.id ? 'bg-[var(--canvas)]' : ''
              }`}
            >
              <span className="min-w-0">
                <span className="block font-semibold text-sm truncate">{track.title}</span>
                <span className="block text-xs text-[var(--ink-muted)] truncate">{track.artist}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] shrink-0">
                Select
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
