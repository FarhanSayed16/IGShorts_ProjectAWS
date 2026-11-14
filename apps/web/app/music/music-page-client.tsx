'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MusicCollection as CollectionKey, MusicTrackCard } from '@igshorts/shared';
import { MusicTicker } from '@/components/discovery/music-ticker';
import { NowPlayingPanel } from '@/components/discovery/now-playing-panel';
import { UpNextList } from '@/components/discovery/up-next-list';
import { MusicCollection } from '@/components/discovery/music-collection';
import { MusicOnRepeat } from '@/components/discovery/music-on-repeat';
import { fetchFeaturedMusic, fetchMusicTracks } from '@/lib/api/client';

const TABS: { id: CollectionKey; label: string }[] = [
  { id: 'trending', label: 'Trending Tracks' },
  { id: 'viral', label: 'Viral Audio' },
  { id: 'emerging', label: 'Emerging Artists' },
  { id: 'india_chart', label: 'India Charts' },
  { id: 'global_chart', label: 'Global Charts' },
  { id: 'new_release', label: 'New Releases' },
];

export function MusicPageClient() {
  const [tab, setTab] = useState<CollectionKey>('trending');
  const [tracks, setTracks] = useState<MusicTrackCard[]>([]);
  const [onRepeat, setOnRepeat] = useState<MusicTrackCard[]>([]);
  const [active, setActive] = useState<MusicTrackCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMusicTracks({ collection: tab, limit: 24 })
      .then((list) => {
        if (cancelled) return;
        setTracks(list.data);
        setActive((current) => {
          if (current && list.data.some((t) => t.id === current.id)) return current;
          return list.data[0] || current;
        });
      })
      .catch(() => {
        if (!cancelled) setTracks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMusicTracks({ collection: 'on_repeat', limit: 12 }),
      fetchFeaturedMusic(),
    ])
      .then(([repeat, featured]) => {
        if (cancelled) return;
        setOnRepeat(repeat.data);
        setActive((current) => current || featured || repeat.data[0] || null);
      })
      .catch(() => {
        if (!cancelled) setOnRepeat([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const upNext = useMemo(
    () => tracks.filter((t) => t.id !== active?.id).slice(0, 8),
    [tracks, active],
  );

  return (
    <>
      <MusicTicker />
      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="chart-title text-5xl sm:text-7xl mb-3">Music</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-8 max-w-2xl">
          Discover trending tracks and open them on Spotify or YouTube. IGshorts does not stream audio
          in-app.
        </p>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--line)] pb-3" role="tablist" aria-label="Music collections">
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
            <MusicOnRepeat tracks={onRepeat} />
          </>
        )}
      </main>
    </>
  );
}
