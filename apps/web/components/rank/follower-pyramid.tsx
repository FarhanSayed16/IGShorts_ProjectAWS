'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PYRAMID_TIERS,
  PyramidTier,
  getTierForFollowers,
  formatFollowerCount,
} from '@/lib/format/follower-pyramid';
import { Avatar } from '@/components/rank/avatar';

interface FollowerPyramidProps {
  initialCount?: number;
  highlightUsername?: string;
  className?: string;
}

export function FollowerPyramid({
  initialCount = 250000,
  highlightUsername,
  className = '',
}: FollowerPyramidProps) {
  const [followerCount, setFollowerCount] = useState<number>(initialCount);
  const [selectedTierId, setSelectedTierId] = useState<string>('established');

  const activeTier = getTierForFollowers(followerCount);
  const inspectedTier =
    PYRAMID_TIERS.find((t) => t.id === selectedTierId) || activeTier;

  // Calculate distance to next tier
  const nextTierIndex = PYRAMID_TIERS.findIndex((t) => t.id === activeTier.id) - 1;
  const nextTier = nextTierIndex >= 0 ? PYRAMID_TIERS[nextTierIndex] : null;
  const followersToNextTier = nextTier ? nextTier.minFollowers - followerCount : 0;

  // Width tapering for the 6 strata: narrowest at top (Apex), widest at bottom (Seed)
  const TIER_WIDTHS: Record<string, string> = {
    apex: 'max-w-[390px] sm:max-w-[430px]',
    mega: 'max-w-[490px] sm:max-w-[540px]',
    established: 'max-w-[590px] sm:max-w-[650px]',
    community: 'max-w-[700px] sm:max-w-[780px]',
    micro: 'max-w-[820px] sm:max-w-[920px]',
    seed: 'max-w-full',
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logarithmic slider from 100 to 100M
    const val = Number(e.target.value);
    const minLog = Math.log(100);
    const maxLog = Math.log(100_000_000);
    const calculated = Math.round(Math.exp(minLog + (val / 100) * (maxLog - minLog)));
    setFollowerCount(calculated);
    setSelectedTierId(getTierForFollowers(calculated).id);
  };

  // Convert current followers to slider 0-100 value
  const sliderValue = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((Math.log(Math.max(100, followerCount)) - Math.log(100)) /
          (Math.log(100_000_000) - Math.log(100))) *
          100
      )
    )
  );

  return (
    <section
      aria-labelledby="pyramid-chart-title"
      className={`border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm ${className}`}
    >
      {/* Header with Soothing Emerald Brand Accent */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              ARCHITECTURAL FOLLOWER PYRAMID • 6 VERIFIED STRATA
            </span>
          </div>
          <h2
            id="pyramid-chart-title"
            className="chart-title text-3xl sm:text-4xl text-[var(--ink)]"
          >
            Where Creators Stand
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--ink-muted)] max-w-2xl leading-relaxed">
            Public Instagram hierarchy structured by follower volume. Higher tiers carry extreme
            volatility and are refreshed by our crawler every 2–3 days; foundational tiers refresh on a
            dampened 14–30 day schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href="/methodology"
            className="px-3 py-1.5 border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] transition-colors"
          >
            Engine Rules ↗
          </Link>
          <Link
            href="/charts/global"
            className="px-3 py-1.5 bg-[var(--ink)] text-[var(--canvas)] hover:bg-[var(--accent)] hover:text-black transition-colors"
          >
            Open Rankings →
          </Link>
        </div>
      </div>

      {/* Interactive "Find Where You Stand" Inspector & Calculator */}
      <div className="my-6 p-4 sm:p-5 bg-[var(--canvas)] border border-[var(--line)] rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] block">
              Interactive Tier Inspector
            </span>
            <span className="font-display text-lg sm:text-xl font-bold uppercase text-[var(--ink)]">
              Simulate Follower Scale:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[var(--surface)] border border-[var(--line)] font-mono text-sm sm:text-base font-bold text-[var(--ink)] tabular-nums">
              {followerCount.toLocaleString()} followers
            </div>
            <span className="px-2 py-1 bg-[var(--accent)] text-black font-mono text-xs font-bold uppercase tracking-wider">
              {activeTier.name}
            </span>
          </div>
        </div>

        {/* Follower Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            aria-label="Adjust follower count"
            className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-[var(--line)] rounded-lg appearance-none"
          />
          <div className="flex justify-between items-center text-[10px] font-mono text-[var(--ink-faint)]">
            <span>100 (Seed)</span>
            <span>10K (Community)</span>
            <span>1M (Mega)</span>
            <span>100M+ (Apex)</span>
          </div>
        </div>

        {/* Quick Creator Presets */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-[var(--line)]">
          <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)] mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => {
              setFollowerCount(679800000);
              setSelectedTierId('apex');
            }}
            className="min-h-[36px] px-2.5 py-1 text-xs font-mono border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)] inline-flex items-center"
          >
            Cristiano (679.8M)
          </button>
          <button
            type="button"
            onClick={() => {
              setFollowerCount(8400000);
              setSelectedTierId('mega');
            }}
            className="min-h-[36px] px-2.5 py-1 text-xs font-mono border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)] inline-flex items-center"
          >
            Mega Star (8.4M)
          </button>
          <button
            type="button"
            onClick={() => {
              setFollowerCount(350000);
              setSelectedTierId('established');
            }}
            className="min-h-[36px] px-2.5 py-1 text-xs font-mono border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)] inline-flex items-center"
          >
            Established (350K)
          </button>
          <button
            type="button"
            onClick={() => {
              setFollowerCount(45000);
              setSelectedTierId('community');
            }}
            className="min-h-[36px] px-2.5 py-1 text-xs font-mono border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)] inline-flex items-center"
          >
            Community (45K)
          </button>
          <button
            type="button"
            onClick={() => {
              setFollowerCount(4500);
              setSelectedTierId('micro');
            }}
            className="min-h-[36px] px-2.5 py-1 text-xs font-mono border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)] inline-flex items-center"
          >
            Micro (4.5K)
          </button>
        </div>

        {/* Real-time Milestone Feedback */}
        <div className="mt-4 p-3 bg-[var(--surface)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="text-[var(--ink-muted)]">Current Standing: </span>
            <span className="font-bold text-[var(--ink)]">
              Level {activeTier.level} · {activeTier.name}
            </span>
            <span className="text-[var(--accent)] font-semibold ml-2">
              (Refresh Cadence: {activeTier.refreshSchedule})
            </span>
          </div>
          {nextTier && (
            <div className="text-[var(--ink-muted)]">
              Next Tier: <span className="font-bold text-[var(--ink)]">{nextTier.name}</span> in{' '}
              <span className="text-[var(--accent)] font-bold">
                +{formatFollowerCount(followersToNextTier)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The Stepped Architectural Pyramid Visualizer */}
      <div className="my-8 flex flex-col items-center gap-2 w-full">
        {PYRAMID_TIERS.map((tier) => {
          const isCurrentActive = activeTier.id === tier.id;
          const isInspected = inspectedTier.id === tier.id;
          const widthClass = TIER_WIDTHS[tier.id] || 'w-full';

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`w-full ${widthClass} transition-all duration-200 cursor-pointer group`}
            >
              <div
                className={`relative px-4 py-3 sm:py-3.5 border text-left flex items-center justify-between gap-3 transition-all ${
                  isCurrentActive
                    ? 'border-2 border-[var(--accent)] bg-[var(--surface)] shadow-md scale-[1.02]'
                    : isInspected
                      ? 'border-[var(--ink)] bg-[var(--surface)] shadow-sm'
                      : 'border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--ink-muted)]'
                }`}
              >
                {/* Active Tier Marker */}
                {isCurrentActive && (
                  <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
                )}

                {/* Left: Tier Rank & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-display text-lg sm:text-xl font-bold tabular-nums ${
                      isCurrentActive ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    L{tier.level}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-[var(--ink)] truncate">
                        {tier.name}
                      </h4>
                      {isCurrentActive && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[var(--accent)] text-black rounded-sm">
                          YOU ARE HERE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[var(--ink-muted)] block">
                      {tier.rangeLabel}
                    </span>
                  </div>
                </div>

                {/* Right: Refresh Schedule & Share */}
                <div className="flex items-center gap-4 text-right flex-shrink-0 font-mono">
                  <div className="hidden sm:block">
                    <span className="block text-[10px] uppercase text-[var(--ink-muted)]">
                      Refresh
                    </span>
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {tier.refreshSchedule}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase text-[var(--ink-muted)]">
                      Watchlist
                    </span>
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {tier.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Tier Diagnostic Drawer (Explaining Volatility & Algorithmic Weight) */}
      <div className="mt-8 pt-6 border-t border-[var(--line)] bg-[var(--canvas)] p-5 sm:p-6 border">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[var(--ink)] text-[var(--canvas)] text-[10px] font-mono font-bold uppercase tracking-wider">
                Level {inspectedTier.level} Architecture
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-[var(--ink)]">
                {inspectedTier.name} — {inspectedTier.rangeLabel}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed max-w-2xl">
              {inspectedTier.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 font-mono text-xs">
              <div className="p-2.5 bg-[var(--surface)] border border-[var(--line)]">
                <span className="block text-[10px] text-[var(--ink-muted)] uppercase">
                  Crawler Cadence
                </span>
                <span className="font-bold text-[var(--accent)]">
                  {inspectedTier.refreshSchedule}
                </span>
              </div>
              <div className="p-2.5 bg-[var(--surface)] border border-[var(--line)]">
                <span className="block text-[10px] text-[var(--ink-muted)] uppercase">
                  Avg Engagement
                </span>
                <span className="font-bold text-[var(--ink)]">
                  {inspectedTier.avgEngagement}
                </span>
              </div>
              <div className="p-2.5 bg-[var(--surface)] border border-[var(--line)]">
                <span className="block text-[10px] text-[var(--ink-muted)] uppercase">
                  Watchlist Share
                </span>
                <span className="font-bold text-[var(--ink)]">
                  {inspectedTier.percentage}% ({inspectedTier.trackedCount.toLocaleString()})
                </span>
              </div>
              <div className="p-2.5 bg-[var(--surface)] border border-[var(--line)]">
                <span className="block text-[10px] text-[var(--ink-muted)] uppercase">
                  Re-rank Hysteresis
                </span>
                <span className="font-bold text-[var(--ink)]">15% Threshold</span>
              </div>
            </div>
          </div>

          {/* Sample Verified Creators in this Tier */}
          <div className="w-full md:w-64 flex-shrink-0 bg-[var(--surface)] p-4 border border-[var(--line)]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">
              Verified Profiles in Tier:
            </span>
            <div className="space-y-2">
              {inspectedTier.sampleCreators.map((c) => (
                <Link
                  key={c.username}
                  href={`/profiles/${c.username}`}
                  className="flex items-center justify-between gap-2 p-1.5 hover:bg-[var(--canvas)] transition-colors rounded-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar src={c.avatarUrl} name={c.name} size="sm" rounded="full" />
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-[var(--ink)] truncate block">
                        {c.name}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        @{c.username}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--ink)] flex-shrink-0">
                    {c.followers}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
