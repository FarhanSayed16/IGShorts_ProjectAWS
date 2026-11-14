'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Gem, Rocket, Play } from 'lucide-react';
import { DailyPulseDay } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';
import { useAudioPlayer } from '@/lib/audio-player-context';

const KIND_LABEL: Record<string, string> = {
  song: 'Song of the Day',
  story: 'Story of the Day',
  trend: 'Trend of the Day',
  creator: 'Creator of the Day',
  moment: 'Internet Moment of the Day',
};

const KIND_CATEGORY: Record<string, string> = {
  song: 'music',
  story: 'news',
  trend: 'technology',
  creator: 'entertainment',
  moment: 'internet_culture',
};

export function DailyPulse({ pulse }: { pulse: DailyPulseDay | null }) {
  const { playTrack, playingTrack, isPlaying } = useAudioPlayer();

  // Reaction counters per kind: { [kind]: { hype: number, gem: number, viral: number } }
  const [reactions, setReactions] = useState<Record<string, { hype: number; gem: number; viral: number }>>({
    song: { hype: 342, gem: 128, viral: 512 },
    story: { hype: 189, gem: 245, viral: 410 },
    trend: { hype: 521, gem: 194, viral: 890 },
    creator: { hype: 760, gem: 312, viral: 940 },
    moment: { hype: 415, gem: 280, viral: 670 },
  });

  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('igshorts_pulse_reactions');
      if (saved) {
        setReactions((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  const react = (kind: string, type: 'hype' | 'gem' | 'viral', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setReactions((prev) => {
      const current = prev[kind] || { hype: 100, gem: 50, viral: 200 };
      const updated = {
        ...prev,
        [kind]: {
          ...current,
          [type]: current[type] + 1,
        },
      };
      try {
        localStorage.setItem('igshorts_pulse_reactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const key = `${kind}-${type}`;
    setActiveReaction(key);
    setTimeout(() => setActiveReaction(null), 800);
  };

  return (
    <section aria-labelledby="daily-pulse-title" className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              LIVE CURATION • 24H ROTATION
            </span>
          </div>
          <h2 id="daily-pulse-title" className="chart-title text-3xl sm:text-4xl">
            The Daily Pulse
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Five editorial slots for today — song, story, trend, creator, and internet moment.
          </p>
        </div>
        {pulse?.date && (
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] px-3 py-1 bg-[var(--surface)] border border-[var(--line)] self-start sm:self-end">
            ISSUE: {pulse.date}
          </div>
        )}
      </div>

      {!pulse || pulse.items.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Daily Pulse will refresh when selections are ready.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pulse.items.map((item) => {
            const href = item.linkUrl || '/trending';
            const external = /^https?:\/\//i.test(href);
            const isSong = item.kind === 'song';
            const isCurrentlyPlaying = isSong && isPlaying && playingTrack?.title === item.title;
            const currentReactions = reactions[item.kind] || { hype: 240, gem: 110, viral: 430 };

            const content = (
              <div className="border border-[var(--line)] bg-[var(--surface)] flex flex-col h-full overflow-hidden hover-lift hover:border-[var(--ink)] transition-all">
                {/* Visual Media Header */}
                <div className="relative aspect-[16/9] border-b border-[var(--line)] group overflow-hidden">
                  <DiscoveryMedia
                    imageUrl={item.imageUrl}
                    category={KIND_CATEGORY[item.kind]}
                    alt={item.title}
                    label={KIND_LABEL[item.kind]}
                  />

                  {/* If song, offer direct ambient audio play button overlay */}
                  {isSong && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playTrack({
                            title: item.title,
                            artist: 'Daily Pulse Audio',
                            artwork_url: item.imageUrl,
                            spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(item.title)}`,
                            youtube_search_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}`,
                          });
                        }}
                        className="px-4 py-2 bg-[var(--accent)] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                        aria-label={isCurrentlyPlaying ? 'Currently playing' : 'Play lo-fi track'}
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <span className="flex gap-0.5 items-center">
                              <span className="w-1 h-3 bg-black animate-soundwave-1" />
                              <span className="w-1 h-3 bg-black animate-soundwave-2" />
                              <span className="w-1 h-3 bg-black animate-soundwave-3" />
                            </span>
                            Playing Lo-Fi
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Play Ambient
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-white border border-white/20">
                    {KIND_LABEL[item.kind] || item.kind}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                      {item.sourceLabel === 'editorial' ? 'Editorial Pick' : 'Viral Spike'}
                    </span>
                    {isCurrentlyPlaying && (
                      <span className="text-[10px] font-mono text-[var(--accent)] flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-live-radar" />
                        ON AIR
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl leading-tight text-[var(--ink)]">
                    {item.title}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  )}

                  {/* Interactive Micro-Reactions Bar */}
                  <div className="mt-auto pt-3 border-t border-[var(--line)]">
                    <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase mb-1.5">
                      Audience Pulse:
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => react(item.kind, 'hype', e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded transition-all ${
                          activeReaction === `${item.kind}-hype`
                            ? 'bg-[var(--accent)] text-black border-[var(--accent)] scale-105'
                            : 'bg-[var(--canvas)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]'
                        }`}
                        title="Cheer with Hype"
                      >
                        <Flame className={`w-3.5 h-3.5 ${activeReaction === `${item.kind}-hype` ? 'text-black fill-black' : 'text-amber-500 fill-amber-500/25'}`} />
                        <span>{currentReactions.hype}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => react(item.kind, 'gem', e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded transition-all ${
                          activeReaction === `${item.kind}-gem`
                            ? 'bg-[var(--accent)] text-black border-[var(--accent)] scale-105'
                            : 'bg-[var(--canvas)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]'
                        }`}
                        title="Highlight as Gem"
                      >
                        <Gem className={`w-3.5 h-3.5 ${activeReaction === `${item.kind}-gem` ? 'text-black fill-black' : 'text-emerald-500 fill-emerald-500/25'}`} />
                        <span>{currentReactions.gem}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => react(item.kind, 'viral', e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded transition-all ${
                          activeReaction === `${item.kind}-viral`
                            ? 'bg-[var(--accent)] text-black border-[var(--accent)] scale-105'
                            : 'bg-[var(--canvas)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]'
                        }`}
                        title="Predict Viral Peak"
                      >
                        <Rocket className={`w-3.5 h-3.5 ${activeReaction === `${item.kind}-viral` ? 'text-black fill-black' : 'text-indigo-500 fill-indigo-500/25'}`} />
                        <span>{currentReactions.viral}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[var(--ink)]">
                    <span>Explore Breakdown</span>
                    <span className="text-[var(--accent)]">→</span>
                  </div>
                </div>
              </div>
            );

            return external ? (
              <a
                key={item.kind}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {content}
              </a>
            ) : (
              <Link key={item.kind} href={href} className="block h-full">
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
