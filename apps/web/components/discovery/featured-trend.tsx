'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { TREND_CATEGORY_LABELS, TrendCard } from '@igshorts/shared';
import { DiscoveryMedia } from './discovery-media';
import { VideoModal } from './video-modal';

export function FeaturedTrend({ trend }: { trend: TrendCard | null }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  if (!trend) {
    return (
      <section className="mb-12 border border-[var(--line)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--ink-muted)]">No featured trend yet. Check back soon.</p>
      </section>
    );
  }

  const categoryLabel = TREND_CATEGORY_LABELS[trend.category] || trend.category;

  return (
    <>
      <section className="mb-12 border-2 border-[var(--ink)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-[1.25fr_1fr]">
          {/* Left Media Area with Watch Overlay */}
          <div className="relative min-h-[260px] md:min-h-[360px] bg-neutral-900 border-b md:border-b-0 md:border-r border-[var(--line)] group overflow-hidden">
            <DiscoveryMedia
              imageUrl={trend.imageUrl}
              category={trend.category}
              alt={trend.title}
              className="min-h-[260px] md:min-h-[360px] transition-transform duration-500 group-hover:scale-105"
            />

            {/* Live radar badge overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/85 border border-white/20 text-[10px] font-mono font-bold text-[var(--accent)] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
              SPOTLIGHT REEL • LIVE
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="px-5 py-3 bg-[var(--accent)] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
                aria-label={`Watch 15-second brief for ${trend.title}`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch 15s Brief
              </button>
            </div>
          </div>

          {/* Right Editorial Copy */}
          <div className="p-6 sm:p-8 flex flex-col justify-center gap-4 bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--accent)] bg-[var(--canvas)] border border-[var(--line)] px-2 py-0.5">
                {categoryLabel}
              </span>
              <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                {trend.sourceLabel === 'editorial' ? 'Editorial Spotlight' : 'Algorithm Peak'}
              </span>
            </div>

            <h2 className="chart-title text-3xl sm:text-4xl lg:text-5xl leading-[0.95] text-[var(--ink)]">
              {trend.title}
            </h2>

            {trend.summary && (
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                {trend.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-1.5 border-2 border-[var(--accent)] bg-[var(--accent)] text-black px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider hover:bg-black hover:text-[var(--accent)] hover:border-black transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Reel Brief</span>
              </button>
              <Link
                href={trend.sourceUrl || `/trending/${trend.category.replace(/_/g, '-')}`}
                className="inline-flex items-center border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider hover:border-[var(--ink)] transition-colors"
              >
                Full Story →
              </Link>
              <Link
                href="/trending"
                className="inline-flex items-center text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] uppercase px-2 py-1"
              >
                All Trending
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video preview modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={trend.title}
        creatorName="Editorial Archive"
        creatorUsername="igshorts"
        category={categoryLabel}
        description={trend.summary || undefined}
        stats={{ views: '24.2M', velocity: '+380%', shares: '920K' }}
      />
    </>
  );
}
