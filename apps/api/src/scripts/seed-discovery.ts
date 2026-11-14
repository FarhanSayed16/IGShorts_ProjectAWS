import { PrismaClient } from '@igshorts/db';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const trends = [
    {
      title: 'AI tools reshaping creator workflows',
      slug: 'ai-tools-creator-workflows',
      category: 'technology',
      region: 'global',
      summary: 'Editorial selection covering public AI product launches used by creators.',
      imageUrl: null as string | null,
      sourceUrl: '/trending/technology',
      sourceName: 'IGshorts editorial',
      status: 'popular',
      popularityScore: 92,
      velocityScore: 18,
      isFeatured: true,
    },
    {
      title: 'Indie pop audio climbing India charts',
      slug: 'indie-pop-india-charts',
      category: 'music',
      region: 'india',
      summary: 'Editorial note on songs gaining attention on public music charts in India.',
      imageUrl: null,
      sourceUrl: '/music',
      sourceName: 'IGshorts editorial',
      status: 'rising',
      popularityScore: 74,
      velocityScore: 41,
      isFeatured: false,
    },
    {
      title: 'Meme formats circulating this week',
      slug: 'meme-formats-this-week',
      category: 'internet_culture',
      region: 'both',
      summary: 'Editorial roundup of widely shared meme formats. Not a live scrape.',
      imageUrl: null,
      sourceUrl: '/trending/internet-culture',
      sourceName: 'IGshorts editorial',
      status: 'new',
      popularityScore: 55,
      velocityScore: 33,
      isFeatured: false,
    },
    {
      title: 'Major OTT premiere weekend',
      slug: 'ott-premiere-weekend',
      category: 'entertainment',
      region: 'india',
      summary: 'Editorial highlight of a premiere window drawing public conversation.',
      imageUrl: null,
      sourceUrl: '/trending/entertainment',
      sourceName: 'IGshorts editorial',
      status: 'popular',
      popularityScore: 81,
      velocityScore: 22,
      isFeatured: false,
    },
    {
      title: 'National cricket tournament updates',
      slug: 'national-cricket-tournament',
      category: 'sports_gaming',
      region: 'india',
      summary: 'Editorial sports note for readers following tournament chatter.',
      imageUrl: null,
      sourceUrl: '/trending/sports-gaming',
      sourceName: 'IGshorts editorial',
      status: 'rising',
      popularityScore: 68,
      velocityScore: 27,
      isFeatured: false,
    },
    {
      title: 'Policy briefing on digital platforms',
      slug: 'policy-briefing-digital-platforms',
      category: 'news',
      region: 'global',
      summary: 'Editorial news card pointing to public reporting on platform policy.',
      imageUrl: null,
      sourceUrl: '/trending/news',
      sourceName: 'IGshorts editorial',
      status: 'new',
      popularityScore: 60,
      velocityScore: 12,
      isFeatured: false,
    },
  ];

  for (const trend of trends) {
    await prisma.trendTopic.upsert({
      where: { slug: trend.slug },
      create: {
        ...trend,
        sourceLabel: 'editorial',
        publishedAt: now,
        observedAt: now,
      },
      update: {
        ...trend,
        sourceLabel: 'editorial',
        observedAt: now,
      },
    });
  }

  const tracks = [
    {
      title: 'Midnight Drive',
      artist: 'Editorial Sample Artist',
      artworkUrl: null as string | null,
      spotifyUrl: 'https://open.spotify.com/',
      youtubeUrl: 'https://www.youtube.com/',
      region: 'global',
      popularityScore: 88,
      collections: ['trending', 'on_repeat', 'new_release'],
      creatorUsageCount: null as number | null,
    },
    {
      title: 'City Lights',
      artist: 'Sample Collective',
      artworkUrl: null,
      spotifyUrl: 'https://open.spotify.com/',
      youtubeUrl: 'https://www.youtube.com/',
      region: 'india',
      popularityScore: 79,
      collections: ['viral', 'india_chart', 'on_repeat'],
      creatorUsageCount: null,
    },
    {
      title: 'Signal Noise',
      artist: 'Emerging Room',
      artworkUrl: null,
      spotifyUrl: 'https://open.spotify.com/',
      youtubeUrl: 'https://www.youtube.com/',
      region: 'both',
      popularityScore: 71,
      collections: ['emerging', 'global_chart', 'trending'],
      creatorUsageCount: null,
    },
  ];

  await prisma.musicTrack.deleteMany({ where: { sourceLabel: 'editorial' } });
  for (const track of tracks) {
    await prisma.musicTrack.create({
      data: {
        ...track,
        sourceLabel: 'editorial',
        observedAt: now,
      },
    });
  }

  const featured = await prisma.trendTopic.findFirst({ where: { isFeatured: true } });
  const song = await prisma.musicTrack.findFirst({ orderBy: { popularityScore: 'desc' } });
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const pulseSlots = [
    song
      ? {
          kind: 'song',
          title: `${song.title} — ${song.artist}`,
          summary: 'Editorial song of the day. Listening links open Spotify or YouTube.',
          imageUrl: song.artworkUrl,
          linkUrl: song.spotifyUrl || '/music',
          musicTrackId: song.id,
        }
      : null,
    featured
      ? {
          kind: 'trend',
          title: featured.title,
          summary: featured.summary,
          imageUrl: featured.imageUrl,
          linkUrl: '/trending',
          trendTopicId: featured.id,
        }
      : null,
    {
      kind: 'story',
      title: 'Policy briefing on digital platforms',
      summary: 'Editorial story of the day from the news category seed.',
      imageUrl: null,
      linkUrl: '/trending/news',
    },
    {
      kind: 'moment',
      title: 'Meme formats circulating this week',
      summary: 'Editorial internet moment selection.',
      imageUrl: null,
      linkUrl: '/trending/internet-culture',
    },
  ].filter(Boolean) as Array<{
    kind: string;
    title: string;
    summary: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    musicTrackId?: string;
    trendTopicId?: string;
  }>;

  for (const slot of pulseSlots) {
    await prisma.dailyPulseItem.upsert({
      where: { pulseDate_kind: { pulseDate: day, kind: slot.kind } },
      create: {
        pulseDate: day,
        kind: slot.kind,
        title: slot.title,
        summary: slot.summary,
        imageUrl: slot.imageUrl,
        linkUrl: slot.linkUrl,
        musicTrackId: slot.musicTrackId,
        trendTopicId: slot.trendTopicId,
        sourceLabel: 'editorial',
      },
      update: {
        title: slot.title,
        summary: slot.summary,
        imageUrl: slot.imageUrl,
        linkUrl: slot.linkUrl,
        musicTrackId: slot.musicTrackId,
        trendTopicId: slot.trendTopicId,
        sourceLabel: 'editorial',
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        trends: trends.length,
        tracks: tracks.length,
        pulseSlots: pulseSlots.length,
        note: 'All rows labeled editorial. Not live feeds.',
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
