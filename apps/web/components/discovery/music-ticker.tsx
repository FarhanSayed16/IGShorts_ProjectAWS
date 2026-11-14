'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MusicTrackCard } from '@igshorts/shared';
import { fetchMusicTicker } from '@/lib/api/client';

export function MusicTicker() {
  const [items, setItems] = useState<MusicTrackCard[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchMusicTicker(10)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div
      className="border-b border-[var(--line)] bg-[var(--ink)] text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-9 flex items-center">
        <div
          className={`flex gap-8 whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.14em] animate-discovery-ticker ${
            paused ? 'is-paused' : ''
          }`}
        >
          {loop.map((item, index) => (
            <Link key={`${item.id}-${index}`} href="/music" className="hover:text-[var(--accent)] shrink-0">
              {item.title} · {item.artist}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
