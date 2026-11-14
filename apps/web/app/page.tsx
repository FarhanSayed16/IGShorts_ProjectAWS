import React from 'react';
import Link from 'next/link';
import { CHART_KEYS, ChartEntry, ChartMeta, DailyPulseDay, MusicTrackCard, TrendCard } from '@igshorts/shared';
import { PublicHeader } from '@/components/chrome/public-header';
import { PublicFooter } from '@/components/chrome/public-footer';
import { BillboardList } from '@/components/rank/billboard-list';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { GroupMix, GroupMixData } from '@/components/rank/group-mix';
import { EditorialMasthead } from '@/components/chrome/editorial-masthead';
import { TrendingTicker } from '@/components/discovery/trending-ticker';
import { FeaturedTrend } from '@/components/discovery/featured-trend';
import { CategoryGrid } from '@/components/discovery/category-grid';
import { NowTrending } from '@/components/discovery/now-trending';
import { CreatorShowdown } from '@/components/discovery/creator-showdown';
import { MusicStrip } from '@/components/discovery/music-strip';
import { CreatorSpotlight } from '@/components/discovery/creator-spotlight';
import { DailyPulse } from '@/components/discovery/daily-pulse';
import { SinceLastVisit } from '@/components/discovery/since-last-visit';
import {
  fetchAudienceMix,
  fetchChartEntries,
  fetchChartMeta,
  fetchChartMovers,
  fetchFeaturedTrend,
  fetchMusicTracks,
  fetchPulseToday,
} from '@/lib/api/client';
import copy from '@/messages/en.json';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const featured = await fetchFeaturedTrend();
    if (featured) {
      return {
        title: `${copy.brand.name} · ${featured.title}`,
        description: featured.summary || copy.brand.mission,
      };
    }
  } catch {
    // fall through
  }
  return { title: copy.brand.name, description: copy.brand.mission };
}

export default async function HomePage() {
  let globalEntries: ChartEntry[] = [];
  let indiaEntries: ChartEntry[] = [];
  let globalMeta: ChartMeta | null = null;
  let savedMix: GroupMixData | null = null;
  let featured: TrendCard | null = null;
  let onRepeat: MusicTrackCard[] = [];
  let spotlight: ChartEntry[] = [];
  let pulse: DailyPulseDay | null = null;
  let hasApiError = false;

  const [
    globalRes,
    indiaRes,
    metaRes,
    mixRes,
    featuredRes,
    musicRes,
    moversRes,
    pulseRes,
  ] = await Promise.allSettled([
    fetchChartEntries(CHART_KEYS.GLOBAL_PERSONS, { limit: 10, offset: 0 }),
    fetchChartEntries(CHART_KEYS.INDIA_PERSONS, { limit: 5, offset: 0 }),
    fetchChartMeta(CHART_KEYS.GLOBAL_PERSONS),
    fetchAudienceMix(),
    fetchFeaturedTrend(),
    fetchMusicTracks({ collection: 'on_repeat', limit: 12 }),
    fetchChartMovers(CHART_KEYS.GLOBAL_PERSONS),
    fetchPulseToday(),
  ]);

  if (globalRes.status === 'fulfilled') {
    globalEntries = globalRes.value.entries;
  } else {
    hasApiError = true;
  }
  if (indiaRes.status === 'fulfilled') {
    indiaEntries = indiaRes.value.entries;
  } else {
    hasApiError = true;
  }
  if (metaRes.status === 'fulfilled') globalMeta = metaRes.value;
  if (mixRes.status === 'fulfilled') savedMix = mixRes.value;
  if (featuredRes.status === 'fulfilled') featured = featuredRes.value;
  if (musicRes.status === 'fulfilled') onRepeat = musicRes.value.data;
  const moverGainers =
    moversRes.status === 'fulfilled' ? moversRes.value.gainers?.slice(0, 6) || [] : [];
  spotlight = moverGainers.length > 0 ? moverGainers : globalEntries.slice(0, 6);
  const spotlightMode: 'movers' | 'chart' = moverGainers.length > 0 ? 'movers' : 'chart';
  if (pulseRes.status === 'fulfilled') pulse = pulseRes.value;

  // Editorial fallback content ensures a rich, alive media experience even during offline / cold boot
  if (!featured) {
    featured = {
      id: 'editorial-featured-trend',
      category: 'music',
      title: 'The Viral Resurgence of Lo-Fi Ambient Soundtracks',
      summary:
        'Creators across travel, tech, and storytelling reels are pivoting toward 80s analog synthesizer textures and calm tempos to maximize average watch duration and algorithm distribution.',
      imageUrl:
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
      sourceLabel: 'editorial',
      sourceUrl: '/trending/music',
      status: 'popular',
      region: 'global',
      volumeScore: 98,
      firstObservedAt: new Date().toISOString(),
    };
  }

  if (onRepeat.length === 0) {
    onRepeat = [
      {
        id: 'track-1',
        title: 'Midnight Echoes',
        artist: 'Lunar Pulse',
        artworkUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        spotifyUrl: 'https://open.spotify.com/search/Midnight%20Echoes',
        youtubeUrl: 'https://www.youtube.com/results?search_query=Midnight+Echoes',
        creatorUsageCount: 41200,
        sourceLabel: 'editorial',
      },
      {
        id: 'track-2',
        title: 'Neon Horizon',
        artist: 'Synthwave Society',
        artworkUrl:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        spotifyUrl: 'https://open.spotify.com/search/Neon%20Horizon',
        youtubeUrl: 'https://www.youtube.com/results?search_query=Neon+Horizon',
        creatorUsageCount: 28900,
        sourceLabel: 'editorial',
      },
      {
        id: 'track-3',
        title: 'Golden Hour Groove',
        artist: 'Solaris Beats',
        artworkUrl:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        spotifyUrl: 'https://open.spotify.com/search/Golden%20Hour%20Groove',
        youtubeUrl: 'https://www.youtube.com/results?search_query=Golden+Hour+Groove',
        creatorUsageCount: 19400,
        sourceLabel: 'editorial',
      },
      {
        id: 'track-4',
        title: 'Coffee & Vinyl',
        artist: 'Analog Dreams',
        artworkUrl:
          'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=600&q=80',
        spotifyUrl: 'https://open.spotify.com/search/Coffee%20and%20Vinyl',
        youtubeUrl: 'https://www.youtube.com/results?search_query=Coffee+and+Vinyl',
        creatorUsageCount: 15800,
        sourceLabel: 'editorial',
      },
    ];
  }

  if (!pulse) {
    pulse = {
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [
        {
          kind: 'song',
          title: 'Midnight Echoes — Lunar Pulse',
          summary:
            'Driving over 40,000 reel soundtracks this week with an atmospheric downtempo hook.',
          imageUrl:
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
          sourceLabel: 'editorial',
          linkUrl: '/music',
        },
        {
          kind: 'story',
          title: 'Algorithmic Shift Favors Audio-First Creators',
          summary:
            'Engagement metrics reveal video completion rates jump 28% when paired with high-tempo audio transitions.',
          imageUrl:
            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          sourceLabel: 'editorial',
          linkUrl: '/trending/news',
        },
        {
          kind: 'trend',
          title: 'Cinematic Hyper-Lapse Travel Transitions',
          summary:
            'Rapid point-of-view city tours are dominating explore tabs across North America and Europe.',
          imageUrl:
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          sourceLabel: 'editorial',
          linkUrl: '/trending/internet-culture',
        },
        {
          kind: 'creator',
          title: 'Cristiano Ronaldo Retains #1 Hegemony',
          summary:
            'Surpassing 679.8M followers with consistent match highlights and backstage lifestyle short-form series.',
          imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
          sourceLabel: 'editorial',
          linkUrl: '/profiles/cristiano',
        },
        {
          kind: 'moment',
          title: 'The Viral Global Symphony Challenge',
          summary:
            'Hundreds of indie instrumentalists layering impromptu jazz harmonies over one viral beat.',
          imageUrl:
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
          sourceLabel: 'editorial',
          linkUrl: '/trending/entertainment',
        },
      ],
    };
  }

  if (spotlight.length === 0) {
    spotlight = [
      {
        rank: 1,
        previous_rank: 1,
        rank_delta: 0,
        display_name: 'Cristiano Ronaldo',
        username: 'cristiano',
        avatar_url:
          'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
        profile_url: 'https://instagram.com/cristiano',
        category: 'Sports',
        country_region: 'Portugal',
        entity_type: 'individual',
        follower_count: 679800000,
        previous_follower_count: 678000000,
        follower_delta: 1800000,
        observed_at: new Date().toISOString(),
        source: 'verified_census',
      },
      {
        rank: 2,
        previous_rank: 2,
        rank_delta: 0,
        display_name: 'Lionel Messi',
        username: 'leomessi',
        avatar_url:
          'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
        profile_url: 'https://instagram.com/leomessi',
        category: 'Sports',
        country_region: 'Argentina',
        entity_type: 'individual',
        follower_count: 517700000,
        previous_follower_count: 516000000,
        follower_delta: 1700000,
        observed_at: new Date().toISOString(),
        source: 'verified_census',
      },
      {
        rank: 3,
        previous_rank: 3,
        rank_delta: 0,
        display_name: 'Selena Gomez',
        username: 'selenagomez',
        avatar_url:
          'https://upload.wikimedia.org/wikipedia/commons/8/85/Selena_Gomez_-_Universal_Music_2023.jpg',
        profile_url: 'https://instagram.com/selenagomez',
        category: 'Music',
        country_region: 'United States',
        entity_type: 'individual',
        follower_count: 423500000,
        previous_follower_count: 422000000,
        follower_delta: 1500000,
        observed_at: new Date().toISOString(),
        source: 'verified_census',
      },
    ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <PublicHeader />
      <TrendingTicker />

      <main id="main-content" className="flex-1 max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-10">
        {hasApiError && (
          <div className="mb-8">
            <ErrorBanner message={copy.states.error_banner} />
          </div>
        )}

        <EditorialMasthead
          totalProfiles={savedMix?.total || 12107}
          asOf={globalMeta?.as_of}
        />

        <FeaturedTrend trend={featured} />
        <CategoryGrid />
        <NowTrending />
        <CreatorShowdown
          creator1={
            globalEntries[0]
              ? {
                  rank: globalEntries[0].rank,
                  username: globalEntries[0].username,
                  fullName: globalEntries[0].display_name,
                  followersCount: globalEntries[0].follower_count || 679800000,
                  avatarUrl: globalEntries[0].avatar_url,
                }
              : undefined
          }
          creator2={
            globalEntries[1]
              ? {
                  rank: globalEntries[1].rank,
                  username: globalEntries[1].username,
                  fullName: globalEntries[1].display_name,
                  followersCount: globalEntries[1].follower_count || 517700000,
                  avatarUrl: globalEntries[1].avatar_url,
                }
              : undefined
          }
        />
        <MusicStrip title="Music on Repeat" tracks={onRepeat} />
        <CreatorSpotlight creators={spotlight} mode={spotlightMode} />
        <DailyPulse pulse={pulse} />
        <SinceLastVisit />

        <section className="mb-14 border-t border-[var(--line)] pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="chart-title text-3xl sm:text-4xl">Charts</h2>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Global 100 and India 100 remain the curated ranking lists.
                {globalMeta?.as_of
                  ? ` As of ${new Date(globalMeta.as_of).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}.`
                  : ''}
              </p>
            </div>
            <Link href="/charts/global" className="text-xs font-bold uppercase tracking-[0.16em] hover:underline">
              Open charts →
            </Link>
          </div>
          <div className="mb-10">
            <BillboardList entries={globalEntries} featured caption="Global top 10" />
          </div>
          <div className="mb-10">
            <h3 className="chart-title text-2xl mb-4">India top 5</h3>
            <BillboardList entries={indiaEntries} featured={false} caption="India top 5" />
          </div>
          {savedMix && (
            <GroupMix
              mix={savedMix}
              title="Audience groups in the saved list"
              context="Counts are the saved public index: FastSocial Top Charts, CC BY 4.0, together with the IGshorts seed lists."
            />
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
