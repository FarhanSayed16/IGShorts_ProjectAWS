import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink, ArrowLeft, Info } from 'lucide-react';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { Avatar } from '@/components/rank/avatar';
import { GroupLadder } from '@/components/rank/group-ladder';
import { GroupMix, GroupMixData } from '@/components/rank/group-mix';
import { MemberReport } from '@/components/account/member-report';
import { RankDeltaChip } from '@/components/rank/rank-delta-chip';
import { RankNumber } from '@/components/rank/rank-number';
import { freshnessState, groupForCount, groupLabel, placeAudienceGroup } from '@/lib/format/audience-group';
import {
  fetchAudienceMix,
  fetchChartEntries,
  fetchProfile,
  fetchProfileHistory,
  ProfileDetail,
} from '@/lib/api/client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = username.toLowerCase().replace(/^@+/, '');
  try {
    const profile = await fetchProfile(normalized);
    const rankBit = profile.rankingEntries?.[0]
      ? `#${profile.rankingEntries[0].rank} ${profile.displayName}`
      : profile.displayName;
    return {
      title: rankBit,
      description: `Public follower count and watchlist rank for ${profile.displayName} (@${profile.igUsername}).`,
    };
  } catch {
    return {
      title: `@${normalized} — IGshorts`,
      description: `Public Instagram watchlist profile for @${normalized}.`,
    };
  }
}

export default async function ProfileDetailPage({ params }: PageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase().replace(/^@+/, '');

  let profile: ProfileDetail | null = null;
  let historyData: { observed_at: string; follower_count: number | null; rank: number | null }[] =
    [];

  let savedMix: GroupMixData | null = null;

  try {
    const [profRes, histRes, mixRes] = await Promise.all([
      fetchProfile(normalized),
      fetchProfileHistory(normalized),
      fetchAudienceMix().catch(() => null),
    ]);
    profile = profRes;
    historyData = histRes.data || [];
    savedMix = mixRes;
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  const latestFollowerCount = profile.latestFollowerCount;
  const measuredCounts = historyData
    .map((point) => point.follower_count)
    .filter((count): count is number => count != null);
  const previousCount = measuredCounts.length >= 2 ? measuredCounts[measuredCounts.length - 2] : null;
  const audienceGroup = placeAudienceGroup(latestFollowerCount, previousCount);
  const freshness = freshnessState(latestFollowerCount, profile.observedAt);
  const latestRankEntry = profile.rankingEntries?.[0];
  const isUnranked = latestFollowerCount === null || !latestRankEntry;
  const instagramHref = profile.profileUrl || `https://instagram.com/${profile.igUsername}`;

  let nearby: {
    username: string;
    display_name: string;
    rank: number;
    follower_count: number | null;
  }[] = [];
  if (latestRankEntry?.chartKey) {
    try {
      const chart = await fetchChartEntries(latestRankEntry.chartKey, { limit: 200, offset: 0 });
      const idx = chart.entries.findIndex(
        (entry) => entry.username.toLowerCase() === profile.igUsername.toLowerCase(),
      );
      if (idx >= 0) {
        nearby = chart.entries.slice(Math.max(0, idx - 2), idx + 3).map((entry) => ({
          username: entry.username,
          display_name: entry.display_name,
          rank: entry.rank,
          follower_count: entry.follower_count,
        }));
      }
    } catch {
      nearby = [];
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link
          href="/profiles"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Watchlist</span>
        </Link>

        <div className="bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {latestRankEntry && (
              <RankNumber rank={latestRankEntry.rank} size="hero" featured={latestRankEntry.rank === 1} />
            )}
            <Avatar src={profile.avatarUrl} name={profile.displayName} size="hero" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl sm:text-6xl leading-none text-[var(--ink)]">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">@{profile.igUsername}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                {profile.category && <span>{profile.category}</span>}
                {profile.countryRegion && <span>· {profile.countryRegion}</span>}
              </div>
              {profile.shortBio && (
                <p className="mt-4 max-w-xl text-sm text-[var(--ink-muted)] leading-relaxed">
                  {profile.shortBio}
                </p>
              )}
              {profile.avatarSource === 'wikipedia' && (
                <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                  Portrait from Wikipedia / Wikimedia Commons.
                </p>
              )}
              <a href={instagramHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 text-xs">
                View on Instagram
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <GroupLadder group={audienceGroup} freshness={freshness} count={latestFollowerCount} />
        {savedMix && (
          <GroupMix
            mix={savedMix}
            title="This profile in the saved list"
            highlight={audienceGroup ?? (latestFollowerCount == null ? 'not_measured' : 'ungrouped')}
            context="The green mark is this person's group. The ring counts the saved public index: FastSocial Top Charts, CC BY 4.0, together with the IGshorts seed lists."
          />
        )}
        <MemberReport username={profile.username} />

        {/* 3-Column Metrics Grid (§12.5) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Follower Count */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-2">
              Audience group
            </span>
            {latestFollowerCount !== null ? (
              <div>
                <div className="text-3xl font-display text-[var(--ink)] mb-2">
                  {groupLabel(audienceGroup)}
                </div>
                <p className="text-xs text-[var(--ink-muted)]">
                  {profile.source === 'fastsocial'
                    ? 'Published integer from FastSocial Top Charts, CC BY 4.0.'
                    : profile.source === 'seed_xlsx'
                      ? 'Rounded research estimate from the IGshorts seed list.'
                      : 'Stored count from the saved profile.'}
                </p>
                {latestRankEntry && (
                  <div className="mt-2">
                    <RankDeltaChip
                      previousRank={latestRankEntry.previousRank}
                      delta={latestRankEntry.rankDelta}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  <Info className="w-4 h-4" />
                  Missing verified count
                </span>
                <p className="text-xs text-[var(--neutral-500)]">
                  Count was omitted in seed import and stays null until a verified snapshot exists.
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Leaderboard Position */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-2">
              Leaderboard Position
            </span>
            {!isUnranked && latestRankEntry ? (
              <div className="flex items-center gap-3.5">
                <RankNumber rank={latestRankEntry.rank} size="lg" />
                <div>
                  <span className="block text-xs font-bold text-[var(--neutral-900)] dark:text-white">
                    Competition Rank #{latestRankEntry.rank}
                  </span>
                  <span className="text-xs text-[var(--neutral-500)]">
                    {latestRankEntry.previousRank != null
                      ? `Previous: #${latestRankEntry.previousRank}`
                      : 'Debut — one ranking so far. No previous place.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                  Listed, unranked
                </span>
                <p className="text-xs text-[var(--neutral-500)]">
                  Accounts without verified counts are excluded from competition rankings.
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Data Verification */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-2">
              Data Verification
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--neutral-500)]">Methodology</span>
                <span className="font-mono font-bold text-[var(--brand-accent)]">followers_v1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--neutral-500)]">Source</span>
                <span className="font-mono font-semibold text-[var(--neutral-700)] dark:text-[var(--neutral-200)]">
                  {profile.source || 'seed_xlsx'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--neutral-500)]">Check date</span>
                <span className="text-[var(--neutral-700)] dark:text-[var(--neutral-200)]">
                  In the account panel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Ranks Strip (§12.5) */}
        {nearby.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 shadow-sm mb-8">
            <h2 className="text-lg font-display font-bold text-[var(--neutral-900)] dark:text-white mb-4">
              Nearby Standings
            </h2>
            <ul className="divide-y divide-[var(--neutral-200)]/60 dark:divide-[var(--neutral-800)] text-sm">
              {nearby.map((row) => (
                <li
                  key={row.username}
                  className={`py-2.5 px-3 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                    row.username === profile.igUsername
                      ? 'bg-[var(--rank-1-wash)] font-bold border-l-4 border-l-[var(--brand-accent)]'
                      : 'hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-800)]'
                  }`}
                >
                  <Link
                    href={`/profiles/${row.username}`}
                    className={`flex items-center gap-2 ${
                      row.username === profile.igUsername
                        ? 'text-[var(--ink)] font-bold'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span className="font-display font-extrabold text-xs">#{row.rank}</span>
                    <span>{row.display_name}</span>
                  </Link>
                  <span className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    {groupLabel(groupForCount(row.follower_count))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Leaderboards Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-t border-[var(--line)] text-xs text-[var(--ink-muted)]">
          <span>More of the board</span>
          <div className="flex items-center gap-4">
            <Link
              href="/charts/global"
              className="font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:underline"
            >
              Global 100 →
            </Link>
            <Link
              href="/charts/india"
              className="font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:underline"
            >
              India 100 →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
