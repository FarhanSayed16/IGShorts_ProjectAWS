'use client';

import React from 'react';
import { extractSpotifyEmbedUrl } from '@/lib/music-playback-catalog';

export function SpotifyEmbedModal({
  spotifyUrl,
  title,
  open,
  onClose,
}: {
  spotifyUrl: string | null | undefined;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const embed = extractSpotifyEmbedUrl(spotifyUrl);
  if (!open || !embed) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Spotify embed for ${title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--surface)] border-2 border-[var(--ink)] p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            Official Spotify embed
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase px-2 py-1 border border-[var(--line)] hover:border-[var(--ink)]"
          >
            Close
          </button>
        </div>
        <iframe
          title={`Spotify — ${title}`}
          src={embed}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="border-0 rounded-sm"
        />
      </div>
    </div>
  );
}
