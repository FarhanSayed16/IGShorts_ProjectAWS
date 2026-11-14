'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MusicCollection as CollectionKey, MusicTrackCard } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { MusicTicker } from '@/components/discovery/music-ticker';
import { NowPlayingPanel } from '@/components/discovery/now-playing-panel';
import { UpNextList } from '@/components/discovery/up-next-list';
import { MusicCollection } from '@/components/discovery/music-collection';
import { fetchFeaturedMusic, fetchMusicTracks } from '@/lib/api/client';

const TABS: { id: CollectionKey; label: string }[] = [
  { id: 'trending', label: 'Trending Tracks' },
  { id: 'viral', label: 'Viral Audio' },
  { id: 'emerging', label: 'Emerging Artists' },
  { id: 'india_chart', label: 'India Charts' },
  { id: 'global_chart', label: 'Global Charts' },
  { id: 'new_release', label: 'New Releases' },
];

export default function MusicPage() {
  const [tab, setTab] = useState<CollectionKey>('trending');
  const [tracks, setTracks] = useState<MusicTrackCard[]>([]);
  const [onRepeat, setOnRepeat] = useState<MusicTrackCard[]>([]);
  const [active, setActive] = useState<MusicTrackCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMusicTracks({ collection: tab, limit: 24 }),
      fetchMusicTracks({ collection: 'on_repeat', limit: 12 }),
      fetchFeaturedMusic(),
    ])
      .then(([list, repeat, featured]) => {
        setTracks(list.data);
        setOnRepeat(repeat.data);
        setActive((current) => current || featured || list.data[0] || null);
      })
      .catch(() => {
        setTracks([]);
        setOnRepeat([]);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  const upNext = useMemo(
    () => tracks.filter((t) => t.id !== active?.id).slice(0, 8),
    [tracks, active],
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <MusicTicker />
      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="chart-title text-5xl sm:text-7xl mb-3">Music</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-8 max-w-2xl">
          Discover trending tracks and open them on Spotify or YouTube. IGshorts does not stream audio
          in-app.
        </p>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--line)] pb-3" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] border-b-2 -mb-[13px] ${
                tab === item.id
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--ink-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--ink-muted)]">Loading music…</p>
        ) : (
          <>
            <NowPlayingPanel track={active} />
            <UpNextList tracks={upNext} activeId={active?.id} onSelect={setActive} />
            <MusicCollection title={TABS.find((t) => t.id === tab)?.label || 'Tracks'} tracks={tracks} />
            <MusicCollection title="Music on Repeat" tracks={onRepeat} />
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
