import { PrismaClient } from '@igshorts/db';

const prisma = new PrismaClient();

/** Stable Unsplash editorial photos — labeled editorial, not live scrapes. */
const IMG = {
  technology:
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
  music:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80',
  internet:
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
  entertainment:
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80',
  sports:
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=80',
  news: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1400&q=80',
  midnight:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
  city: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  signal:
    'https://images.unsplash.com/photo-1459749411177-04aa87362755?auto=format&fit=crop&w=900&q=80',
  pulse:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  lounge:
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
};

async function main() {
  const now = new Date();

  const trends = [
    {
      title: 'AI tools reshaping creator workflows',
      slug: 'ai-tools-creator-workflows',
      category: 'technology',
      region: 'global',
      summary:
        'Editorial selection covering public AI product launches that creators are testing for scripting, editing, and publishing.',
      imageUrl: IMG.technology,
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
      summary:
        'Editorial note on indie and pop tracks gaining attention on public music charts and short-form audio lists in India.',
      imageUrl: IMG.music,
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
      summary:
        'Editorial roundup of widely shared meme formats and remix templates. Not a live scrape of Instagram.',
      imageUrl: IMG.internet,
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
      summary:
        'Editorial highlight of a premiere window drawing public conversation across film and streaming audiences.',
      imageUrl: IMG.entertainment,
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
      summary:
        'Editorial sports note for readers following tournament chatter, highlight reels, and match-day conversation.',
      imageUrl: IMG.sports,
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
      summary:
        'Editorial news card pointing to public reporting on platform policy, safety rules, and creator economy updates.',
      imageUrl: IMG.news,
      sourceUrl: '/trending/news',
      sourceName: 'IGshorts editorial',
      status: 'new',
      popularityScore: 60,
      velocityScore: 12,
      isFeatured: false,
    },
    {
      title: 'Short-form editing stacks creators swear by',
      slug: 'short-form-editing-stacks',
      category: 'technology',
      region: 'both',
      summary:
        'Editorial look at public tool stacks for cuts, captions, and exports — without inventing usage metrics.',
      imageUrl: IMG.technology,
      sourceUrl: '/trending/technology',
      sourceName: 'IGshorts editorial',
      status: 'rising',
      popularityScore: 70,
      velocityScore: 29,
      isFeatured: false,
    },
    {
      title: 'Festival stage clips driving weekend listens',
      slug: 'festival-stage-clips',
      category: 'music',
      region: 'global',
      summary:
        'Editorial music note on festival and live clips that push listeners toward Spotify and YouTube.',
      imageUrl: IMG.pulse,
      sourceUrl: '/music',
      sourceName: 'IGshorts editorial',
      status: 'popular',
      popularityScore: 77,
      velocityScore: 24,
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
      artworkUrl: IMG.midnight,
      spotifyUrl: 'https://open.spotify.com/search/Midnight%20Drive',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Midnight+Drive',
      region: 'global',
      popularityScore: 88,
      collections: ['trending', 'on_repeat', 'new_release', 'global_chart'],
      creatorUsageCount: null as number | null,
    },
    {
      title: 'City Lights',
      artist: 'Sample Collective',
      artworkUrl: IMG.city,
      spotifyUrl: 'https://open.spotify.com/search/City%20Lights',
      youtubeUrl: 'https://www.youtube.com/results?search_query=City+Lights',
      region: 'india',
      popularityScore: 79,
      collections: ['viral', 'india_chart', 'on_repeat', 'trending'],
      creatorUsageCount: null,
    },
    {
      title: 'Signal Noise',
      artist: 'Emerging Room',
      artworkUrl: IMG.signal,
      spotifyUrl: 'https://open.spotify.com/search/Signal%20Noise',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Signal+Noise',
      region: 'both',
      popularityScore: 71,
      collections: ['emerging', 'global_chart', 'trending', 'on_repeat'],
      creatorUsageCount: null,
    },
    {
      title: 'Afterglow Loop',
      artist: 'Night Desk',
      artworkUrl: IMG.lounge,
      spotifyUrl: 'https://open.spotify.com/search/Afterglow%20Loop',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Afterglow+Loop',
      region: 'global',
      popularityScore: 66,
      collections: ['on_repeat', 'new_release', 'viral'],
      creatorUsageCount: null,
    },
    {
      title: 'Monsoon Frequency',
      artist: 'Coastal Room',
      artworkUrl: IMG.pulse,
      spotifyUrl: 'https://open.spotify.com/search/Monsoon%20Frequency',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Monsoon+Frequency',
      region: 'india',
      popularityScore: 73,
      collections: ['india_chart', 'trending', 'emerging'],
      creatorUsageCount: null,
    },
    {
      title: 'Studio Warmup',
      artist: 'Bench Press Audio',
      artworkUrl: IMG.music,
      spotifyUrl: 'https://open.spotify.com/search/Studio%20Warmup',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Studio+Warmup',
      region: 'both',
      popularityScore: 62,
      collections: ['emerging', 'on_repeat', 'new_release'],
      creatorUsageCount: null,
    },
  ];

  for (const track of tracks) {
    const existing = await prisma.musicTrack.findFirst({
      where: {
        title: track.title,
        artist: track.artist,
        sourceLabel: 'editorial',
      },
    });
    if (existing) {
      await prisma.musicTrack.update({
        where: { id: existing.id },
        data: {
          ...track,
          sourceLabel: 'editorial',
          observedAt: existing.observedAt,
        },
      });
    } else {
      await prisma.musicTrack.create({
        data: {
          ...track,
          sourceLabel: 'editorial',
          observedAt: now,
        },
      });
    }
  }

  const featured = await prisma.trendTopic.findFirst({ where: { isFeatured: true } });
  const song = await prisma.musicTrack.findFirst({
    orderBy: [{ popularityScore: { sort: 'desc', nulls: 'last' } }],
  });
  const story = await prisma.trendTopic.findFirst({
    where: { category: { in: ['news', 'technology', 'entertainment'] } },
    orderBy: [{ popularityScore: { sort: 'desc', nulls: 'last' } }],
  });
  const moment = await prisma.trendTopic.findFirst({
    where: { category: 'internet_culture' },
  });
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const pulseSlots = [
    song
      ? {
          kind: 'song',
          title: `${song.title} — ${song.artist}`,
          summary: 'Editorial song of the day. Listening links open Spotify or YouTube search.',
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
    story
      ? {
          kind: 'story',
          title: story.title,
          summary: story.summary,
          imageUrl: story.imageUrl,
          linkUrl: story.sourceUrl || '/trending/news',
          trendTopicId: story.id,
        }
      : null,
    moment
      ? {
          kind: 'moment',
          title: moment.title,
          summary: moment.summary,
          imageUrl: moment.imageUrl,
          linkUrl: '/trending/internet-culture',
          trendTopicId: moment.id,
        }
      : null,
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
        note: 'All rows labeled editorial with Unsplash imagery. Not live feeds.',
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
