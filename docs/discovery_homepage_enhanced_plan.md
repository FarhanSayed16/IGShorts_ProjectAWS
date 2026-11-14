# IGshorts — Discovery Homepage & Feature Enhancement Plan

> **Purpose:** This file is the single source of truth for what Cursor should implement. It merges the GPT-generated enhancements document, fills gaps in the existing Cursor plan, adds concrete file paths, schema definitions, component names, and implementation details. Feed this to Cursor to replace or update the existing plan.

---

## 0. Context — What Exists Today

### Current routes (apps/web/app/)
| Route | Status |
|---|---|
| `/` (homepage) | Live — statistics-first (GroupMix → Global 10 → India 5) |
| `/charts/global` | Live — full Global 100 chart |
| `/charts/india` | Live — full India 100 chart |
| `/charts` | Live — charts index |
| `/movers` | Live — rank movers page |
| `/profiles` | Live — watchlist browser |
| `/profiles/[username]` | Live — individual profile |
| `/methodology` | Live |
| `/about` | Live |
| `/faq` | Live |
| `/privacy`, `/terms` | Live |
| `/scoring` | Live |
| `/regions` | Live |
| `/news` | Stub — "Coming Soon" (501) |
| `/hashtags` | Stub — "Coming Soon" (501) |
| `/claim` | Live |
| `/account` | Live — member account |
| `/admin/*` | Live — admin panel |

### Current navigation (public-header.tsx)
- TOP_LINKS: Charts, Profiles, Methodology, About
- CHART_LINKS (subnav): Global 100, India 100, Movers, Watchlist

### Current database (schema.prisma)
Models: DataSource, CreatorProfile, ProfileScope, MetricSnapshot, RankingRun, RankingEntry, AdminUser, AuditLog, Member, ProfileTrack, JobRun

### Current API modules (apps/api/src/)
admin, audit, auth, charts, common, config, database, hashtags, health, ingestion, jobs, members, metrics, news, profiles, ranking, regions, scoring, scripts, storage

### Current component directories (apps/web/components/)
account, chrome, feedback, rank

### Design tokens
- File: `apps/web/styles/tokens.css`
- Light: canvas `#f3f3f3`, surface `#ffffff`, ink `#111111`, accent `#00d26a`
- Dark: canvas `#0f0f0f`, surface `#1a1a1a`, ink `#f4f4f4`, accent `#00e38c`
- Brand must be preserved: black/white + green accent, Oswald display font, Inter body font, JetBrains Mono monospace

---

## 1. Navigation Redesign

### What the GPT doc requires
New top-level nav: **HOME · TRENDING · MUSIC · CHARTS · PROFILES · METHODOLOGY · ABOUT**

### What the Cursor plan says
Same — Phase 1 covers this. ✅

### What is missing or needs clarification
1. **Chart subnav scoping**: The chart subnav (Global 100 / India 100 / Movers / Watchlist) currently renders on every page. It should only render on `/charts/*` and `/movers` routes. The Cursor plan mentions this but does not specify the implementation detail.
2. **Mobile drawer**: The current mobile menu needs updating to include Trending and Music links. Must be explicitly listed.
3. **Active state logic**: `/trending` and `/trending/*` should highlight "Trending". `/music` and `/music/*` should highlight "Music". `/charts/*` and `/movers` should highlight "Charts".

### Implementation
**Files to modify:**
- `apps/web/components/chrome/public-header.tsx` — update `TOP_LINKS` array, conditionally render `CHART_LINKS` only when pathname starts with `/charts` or `/movers`
- `apps/web/components/chrome/public-footer.tsx` — add Trending and Music footer links
- `apps/web/messages/en.json` — add labels if any copy is centralized

**New TOP_LINKS:**
```ts
const TOP_LINKS = [
  { label: 'Trending', href: '/trending' },
  { label: 'Music', href: '/music' },
  { label: 'Charts', href: '/charts/global' },
  { label: 'Profiles', href: '/profiles' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'About', href: '/about' },
];
```

Home link is the logo itself (already `href="/"`).

---

## 2. Database Schema — New Models

### What the GPT doc requires
New data models for trending topics, music tracks, daily pulse items, featured trends, and visit history.

### What the Cursor plan says
Phase 2 covers TrendTopic, MusicTrack, DailyPulseItem, Member.lastVisitedAt. ✅

### What is missing or needs more detail

The Cursor plan lists field names but not full Prisma definitions. Cursor needs exact schema to avoid guessing. Here are the complete models:

**Add to `packages/db/prisma/schema.prisma`:**

```prisma
model TrendTopic {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  category        String    // music, news, internet_culture, entertainment, technology, sports_gaming
  region          String    @default("both") // india, global, both
  summary         String?   @db.Text
  imageUrl        String?   @map("image_url")
  sourceUrl       String?   @map("source_url")
  sourceName      String?   @map("source_name")
  sourceLabel     String    @default("editorial") @map("source_label") // editorial, provider_code
  popularityScore Float?    @map("popularity_score")
  velocityScore   Float?    @map("velocity_score")
  status          String    @default("new") // popular, rising, new
  isFeatured      Boolean   @default(false) @map("is_featured")
  publishedAt     DateTime? @map("published_at")
  observedAt      DateTime  @default(now()) @map("observed_at")
  expiresAt       DateTime? @map("expires_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  pulseItems      DailyPulseItem[]

  @@index([category, region, status])
  @@index([isFeatured])
  @@index([observedAt(sort: Desc)])
  @@map("trend_topics")
}

model MusicTrack {
  id                 String    @id @default(cuid())
  title              String
  artist             String
  artworkUrl         String?   @map("artwork_url")
  spotifyUrl         String?   @map("spotify_url")
  youtubeUrl         String?   @map("youtube_url")
  region             String    @default("both") // india, global, both
  popularityScore    Float?    @map("popularity_score")
  collections        String[]  // trending, viral, emerging, india_chart, global_chart, new_release, on_repeat
  creatorUsageCount  Int?      @map("creator_usage_count") // nullable — show ONLY when a proven source supplies it
  sourceLabel        String    @default("editorial") @map("source_label")
  releaseDate        DateTime? @map("release_date")
  observedAt         DateTime  @default(now()) @map("observed_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  pulseItems         DailyPulseItem[]

  @@index([region])
  @@index([observedAt(sort: Desc)])
  @@map("music_tracks")
}

model DailyPulseItem {
  id           String    @id @default(cuid())
  pulseDate    DateTime  @map("pulse_date") @db.Date
  kind         String    // song, story, trend, creator, moment
  title        String
  summary      String?   @db.Text
  imageUrl     String?   @map("image_url")
  linkUrl      String?   @map("link_url")
  trendTopicId String?   @map("trend_topic_id")
  musicTrackId String?   @map("music_track_id")
  profileId    String?   @map("profile_id")
  sourceLabel  String    @default("editorial") @map("source_label")
  createdAt    DateTime  @default(now()) @map("created_at")

  trendTopic   TrendTopic?     @relation(fields: [trendTopicId], references: [id], onDelete: SetNull)
  musicTrack   MusicTrack?     @relation(fields: [musicTrackId], references: [id], onDelete: SetNull)
  profile      CreatorProfile? @relation(fields: [profileId], references: [id], onDelete: SetNull)

  @@unique([pulseDate, kind])
  @@index([pulseDate(sort: Desc)])
  @@map("daily_pulse_items")
}
```

**Modify existing `Member` model — add:**
```prisma
lastVisitedAt DateTime? @map("last_visited_at")
```

**Modify existing `CreatorProfile` model — add relation:**
```prisma
pulseItems DailyPulseItem[]
```

---

## 3. API Endpoints — New Nest Modules

### What the GPT doc requires
Backend APIs for trending, music, daily pulse, visit diff.

### What the Cursor plan says
Phase 2 lists endpoints. ✅ But missing some detail.

### Complete API specification

**New Nest modules to create under `apps/api/src/`:**

#### `trends/` module
| Endpoint | Method | Query Params | Description |
|---|---|---|---|
| `/api/v1/trends` | GET | `category`, `region` (india/global), `sort` (popular/rising/new), `limit`, `offset` | Paginated trend topics |
| `/api/v1/trends/featured` | GET | — | Single currently featured trend (isFeatured=true, most recent) |
| `/api/v1/trends/ticker` | GET | `limit` (default 10) | Compact trend items for the scrolling ticker |
| `/api/v1/trends/categories` | GET | — | Available categories with counts |

#### `music/` module
| Endpoint | Method | Query Params | Description |
|---|---|---|---|
| `/api/v1/music/tracks` | GET | `collection` (trending/viral/emerging/india_chart/global_chart/new_release/on_repeat), `region`, `limit`, `offset` | Music tracks by collection |
| `/api/v1/music/ticker` | GET | `limit` (default 8) | Compact track items for music ticker |
| `/api/v1/music/featured` | GET | — | Currently featured / "Now Playing" track |

#### `pulse/` module
| Endpoint | Method | Query Params | Description |
|---|---|---|---|
| `/api/v1/pulse/today` | GET | — | Today's 5 Daily Pulse items |
| `/api/v1/pulse/:date` | GET | — | Pulse items for a specific date (YYYY-MM-DD) |

#### `visit-diff/` module
| Endpoint | Method | Query Params | Description |
|---|---|---|---|
| `/api/v1/visit-diff` | GET | `since` (ISO datetime) | Summary of changes since timestamp: new trends count, new music count, creator moves, new profiles |

**Reuse existing modules:**
- `charts/` — Creator Spotlight pulls from existing movers/ranking deltas
- `members/` — PATCH to update `lastVisitedAt`

#### Existing stub modules to retire/replace:
- `apps/api/src/news/` → merge into `trends/` (category=news)
- `apps/api/src/hashtags/` → merge into `trends/` (category=internet_culture)

---

## 4. Homepage Redesign — Section-by-Section

### What the GPT doc requires
Transform homepage from statistics-first to discovery-first with this hierarchy:
1. Header
2. Trending Ticker
3. Featured Trend
4. Explore Categories
5. Now Trending
6. Music on Repeat
7. Creator Spotlight
8. Daily Pulse
9. Since Your Last Visit
10. Compact charts link + collapsed GroupMix

### What the Cursor plan says
Phase 3 covers this. ✅ Same order.

### What needs more detail

**File to modify:** `apps/web/app/page.tsx`

**New component directory:** `apps/web/components/discovery/`

**Components to create:**

| Component | File | Type | Description |
|---|---|---|---|
| TrendingTicker | `discovery/trending-ticker.tsx` | Client | Slim horizontal scrolling ticker below header. Tickertape.in-inspired. Smooth continuous scroll, pause on hover/focus, accessible. Fetches from `/api/v1/trends/ticker`. Each item clickable → relevant category page. |
| FeaturedTrend | `discovery/featured-trend.tsx` | Server | Large hero card: image, category label, headline, summary, "Explore →" button. Fetches from `/api/v1/trends/featured`. Auto-rotates based on what's gaining attention (not permanently the same story). |
| CategoryGrid | `discovery/category-grid.tsx` | Server | 6 visually appealing cards: Music, News, Internet Culture, Entertainment, Technology, Sports & Gaming. Each card has relevant artwork/imagery and links to `/trending/[category]`. |
| NowTrending | `discovery/now-trending.tsx` | Client | Three tabs: Most Popular / Fastest Rising / Newly Trending. Fetches trends with sort param. Displays TrendCard components. India/Global region toggle. |
| TrendCard | `discovery/trend-card.tsx` | Shared | Card with: title, image, category badge, summary, source attribution, status chip (🔥 popular / ⬆ rising / 🆕 new), region badge, timestamp. |
| MusicStrip | `discovery/music-strip.tsx` | Client | Horizontal scrollable artwork-based cards showing trending/on_repeat tracks. Each card: artwork, song name, artist, trend indicator, Spotify/YouTube link. |
| MusicCard | `discovery/music-card.tsx` | Shared | Artwork card with song info, artist, external listen links, optional creator usage count (only if non-null). |
| CreatorSpotlight | `discovery/creator-spotlight.tsx` | Server | Highlight creators gaining attention. Pull from existing movers / ranking deltas via Charts API. Card: avatar, name, @handle, audience group, rank info, reason featured, link to `/profiles/[username]`. |
| DailyPulse | `discovery/daily-pulse.tsx` | Server | 5 slots: Song of the Day, Story of the Day, Trend of the Day, Creator of the Day, Internet Moment of the Day. Fetches from `/api/v1/pulse/today`. Each item: title, image, short explanation, relevant link. |
| SinceLastVisit | `discovery/since-last-visit.tsx` | Client | Dismissible panel for returning visitors. Anonymous: uses localStorage timestamp. Members: uses `lastVisitedAt`. Fetches from `/api/v1/visit-diff?since=`. Shows: N new trends, N new songs, N creator moves, N new profiles. First visit: welcome message, no fake changes. |

**Homepage layout (new page.tsx):**
```
<PublicHeader />
<TrendingTicker />
<main>
  <FeaturedTrend />
  <CategoryGrid />
  <NowTrending />
  <MusicStrip title="Music on Repeat" collection="on_repeat" />
  <CreatorSpotlight />
  <DailyPulse />
  <SinceLastVisit />
  <CompactChartsLink />  <!-- small link to Charts + collapsed GroupMix -->
</main>
<PublicFooter />
```

**Existing homepage content (GroupMix, Global top 10, India top 5, tracked watchlist info) should NOT be removed.** Move it below the discovery sections or into a collapsible section. Accessible but not above the fold.

---

## 5. Trending Section — Hub + 6 Category Pages

### What the GPT doc requires
- `/trending` hub page with region toggle (India/Global) + sort tabs (Most Popular / Fastest Rising / Newly Trending)
- 6 category pages: `/trending/music`, `/trending/news`, `/trending/internet-culture`, `/trending/entertainment`, `/trending/technology`, `/trending/sports-gaming`
- Each category page: trending topics with title, image, category, summary, source link, popularity indicator, region info, timestamp

### What the Cursor plan says
Phase 4 covers this. ✅

### Additional detail needed

**New route files to create:**
- `apps/web/app/trending/page.tsx` — hub
- `apps/web/app/trending/music/page.tsx`
- `apps/web/app/trending/news/page.tsx`
- `apps/web/app/trending/internet-culture/page.tsx`
- `apps/web/app/trending/entertainment/page.tsx`
- `apps/web/app/trending/technology/page.tsx`
- `apps/web/app/trending/sports-gaming/page.tsx`

**Or use a dynamic route:** `apps/web/app/trending/[category]/page.tsx` with `generateStaticParams` for the 6 categories. This is cleaner.

**Trending hub page layout:**
1. Page title "TRENDING" (chart-title style like existing pages)
2. Region toggle: India | Global (real filter, not just label change)
3. Sort tabs: Most Popular | Fastest Rising | Newly Trending
4. Grid of TrendCard components
5. Pagination

**Category page layout:**
Same as hub but pre-filtered to the specific category. Category name as page title.

**Cleanup stubs:**
- `apps/web/app/news/page.tsx` → redirect to `/trending/news` (Next.js redirect in route config or a redirect() call)
- `apps/web/app/hashtags/page.tsx` → redirect to `/trending/internet-culture`
- Update `robots.ts` and sitemap for new routes
- Remove the old `/news` and `/hashtags` "Coming Soon" pages after redirects are in place

---

## 6. Music Discovery — Dedicated Experience

### What the GPT doc requires
- Dedicated `/music` page inspired by Frisky.fm and FilterMusic.net patterns
- Music ticker (Tickertape-style thin continuous band)
- Collections: Trending Tracks, Viral Audio, Emerging Artists, India Charts, Global Charts, New Releases
- Artwork grid (Frisky mixes-style cards)
- Now Playing + Up Next panels (UI state, links out — NOT an in-app stream)
- Music on Repeat collection
- Curated music collections by genre/popularity/region
- External listen links (Spotify/YouTube) — no custom player
- Optional: show "Used by N indexed creators" only when creatorUsageCount is non-null from a real source

### What the Cursor plan says
Phase 5 covers this. ✅

### What needs more specificity

**New route files:**
- `apps/web/app/music/page.tsx` — main music discovery page
- Optionally: `apps/web/app/music/[collection]/page.tsx` — per-collection view

**New components:**
- `discovery/music-ticker.tsx` — thin continuous scrolling band with track/artist info, clickable items
- `discovery/music-collection.tsx` — section showing a named collection (e.g., "Trending Tracks") with artwork grid
- `discovery/now-playing-panel.tsx` — featured track display: large artwork, song title, artist, Spotify/YouTube links, popularity info
- `discovery/up-next-list.tsx` — list of tracks in the current collection, compact view
- `discovery/music-on-repeat.tsx` — horizontal scroll of songs gaining repeated attention

**Music page layout:**
```
<PublicHeader />
<MusicTicker />
<main>
  <h1>MUSIC</h1>
  <CollectionTabs: Trending | Viral | Emerging | India Charts | Global Charts | New Releases />
  <NowPlayingPanel />   <!-- currently featured/selected track -->
  <UpNextList />         <!-- other tracks in selection -->
  <MusicCollection title="Trending Tracks" collection="trending" />
  <MusicCollection title="Viral Audio" collection="viral" />
  <MusicCollection title="Emerging Artists" collection="emerging" />
  <MusicOnRepeat />
</main>
<PublicFooter />
```

**Design references (pattern inspiration, NOT brand copying):**
- Frisky.fm: artwork-based discovery, Now Playing/Up Next structure, horizontal collections, dark visual hierarchy
- FilterMusic.net: search-first experience, collapsible categories, compact player concept
- Tickertape.in: thin horizontal ticker band pattern

**Critical rules:**
- No custom music streaming player. External links only.
- Show `creatorUsageCount` ("Used by N indexed creators") only when the value is non-null from a real data source. If null, omit the line entirely — do not show 0 or estimate.
- Artwork cards should be visually engaging with the IGshorts design language, not Frisky's pink/dark brand.

---

## 7. Daily Pulse — Signature Feature

### What the GPT doc requires
5 daily slots: Song of the Day, Story of the Day, Trend of the Day, Creator of the Day, Internet Moment of the Day. Refreshes daily. Each item has short explanation + link.

### What the Cursor plan says
Phase 6 covers this. ✅

### Additional implementation detail

**Route:** Can live as a homepage section AND optionally as `/pulse` dedicated page.

**Selection mechanism:**
- Admin/CLI selection for the 5 slots (CLI-first, admin UI later)
- Creator of the Day: automatically pulled from movers / biggest positive rank delta from existing Charts API when no manual selection
- Other slots: editorial selection or from highest-scoring TrendTopic/MusicTrack of the day
- Nightly background job: `daily_pulse_assembly` — assembles next day's pulse from featured/editorial items + creator deltas. Separate from `daily_ranking_pipeline`.

**Never randomly generate or fabricate content for Daily Pulse slots.**

---

## 8. Since Your Last Visit — Personalized Return Experience

### What the GPT doc requires
Show returning visitors what changed since their last visit. Anonymous via localStorage. Members via account. Dismissible. First visit gets welcome, not fake changes.

### What the Cursor plan says
Phase 7 covers this. ✅

### Additional detail

**Implementation:**
1. **Anonymous visitors:**
   - On first page load, check `localStorage.getItem('igshorts-last-visit')`
   - If exists: fetch `/api/v1/visit-diff?since=<timestamp>` → show panel
   - After displaying: `localStorage.setItem('igshorts-last-visit', new Date().toISOString())`
   - If not exists: show "Welcome to IGshorts! Here's what's trending right now." and set the timestamp

2. **Members (logged in):**
   - On home page visit: read `Member.lastVisitedAt` from session/API
   - Fetch diff using that timestamp
   - After render: PATCH member to update `lastVisitedAt`

3. **Diff response shape:**
```ts
interface VisitDiff {
  newTrendTopics: number;
  newMusicTracks: number;
  creatorMoves: { username: string; displayName: string; direction: 'up' | 'down'; delta: number }[];
  newProfiles: number;
  significantStories: { title: string; category: string }[];
}
```

4. **UI:** Dismissible card/panel. "Welcome back! Here's what changed since your last visit." Capped list. Each line links to the relevant section. Dismiss button writes new timestamp.

5. **Do not require registration** to use this feature.

---

## 9. Creator Spotlight

### What the GPT doc requires
Connect existing creator-ranking system with trending. Highlight creators gaining attention or participating in popular trends. Card: avatar, name, @handle, audience group, rank info, reason featured, link to profile.

### What the Cursor plan says
Phase 6 mentions it briefly. ✅ But light on detail.

### Implementation detail

**Data source:** Reuse existing ranking data. Pull from:
- `RankingEntry` with highest positive `rankDelta` (biggest movers up)
- `MetricSnapshot` with largest `metricDelta` (fastest follower growth)
- Existing movers page logic in `apps/web/app/movers/page.tsx`

**Do NOT create a separate duplicate creator-ranking system.** Use existing data.

**Component:** `discovery/creator-spotlight.tsx`
- Server component fetching from existing Charts API (e.g., `/api/v1/charts/movers?scope=global&limit=5&direction=up`)
- Cards link to `/profiles/[username]`
- Show: avatar, display name, @username, category, current rank, rank delta chip, follower count

---

## 10. Shared DTO Types

### Missing from Cursor plan in actionable detail

**Add to `packages/shared/src/` (following existing pattern):**

```ts
// trend.types.ts
export type TrendCategory = 'music' | 'news' | 'internet_culture' | 'entertainment' | 'technology' | 'sports_gaming';
export type TrendRegion = 'india' | 'global' | 'both';
export type TrendSort = 'popular' | 'rising' | 'new';

export interface TrendCard {
  id: string;
  title: string;
  slug: string;
  category: TrendCategory;
  region: TrendRegion;
  summary: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  status: 'popular' | 'rising' | 'new';
  publishedAt: string | null;
}

// music.types.ts
export type MusicCollection = 'trending' | 'viral' | 'emerging' | 'india_chart' | 'global_chart' | 'new_release' | 'on_repeat';

export interface MusicTrackCard {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  region: TrendRegion;
  collections: MusicCollection[];
  creatorUsageCount: number | null; // null = don't show
}

// pulse.types.ts
export type PulseKind = 'song' | 'story' | 'trend' | 'creator' | 'moment';

export interface DailyPulseDay {
  date: string; // YYYY-MM-DD
  items: {
    kind: PulseKind;
    title: string;
    summary: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
  }[];
}

// visit.types.ts
export interface VisitDiff {
  newTrendTopics: number;
  newMusicTracks: number;
  creatorMoves: { username: string; displayName: string; direction: 'up' | 'down'; delta: number }[];
  newProfiles: number;
  significantStories: { title: string; category: string }[];
}
```

---

## 11. Editorial Seed Data

### Missing from Cursor plan

**Create a seed script:** `apps/api/src/scripts/seed-discovery.ts`

- Insert a small honest set of TrendTopic, MusicTrack, and DailyPulseItem rows
- Every row must have `sourceLabel: 'editorial'`
- UI should display a small label when showing editorial/seed data: "Editorial selection" or similar
- Never present seed data as live trending feeds
- The seed exists so the UI can be developed and tested without waiting for provider integrations

---

## 12. Provider Adapters and Refresh Jobs

### What the GPT doc requires
Real data from permitted APIs. No scraping. No fabricated stats. Provider-agnostic architecture.

### What the Cursor plan says
Phase 8 covers this. ✅

### Consolidation

| Domain | Candidate Sources (verify terms) | Cadence | Env Flag |
|---|---|---|---|
| Music metadata + charts | Spotify Web API (catalog, charts where allowed), YouTube Data API (links) | 1–3 days | `SPOTIFY_CLIENT_ID`, `YOUTUBE_API_KEY` |
| News / tech / entertainment | Licensed news API (e.g., NewsAPI.org, Google News RSS) with attribution | Daily | `NEWS_API_KEY` |
| Internet culture | Editorial + approved public datasets; hashtags only if Meta App Review allows | Daily / editorial | — |
| Sports / gaming | Editorial or licensed sports feed | Daily | — |
| Creator spotlight | Existing ranking pipeline (no new external source) | After ranking rebuild | — |

**Rules:**
- No scraping Instagram or any website in violation of terms
- Cache responses; respect API quotas and rate limits
- Secrets server-side only (never in frontend code)
- Store source information for every external item
- Track observation time vs publication time
- `JobRun` telemetry for discovery refresh jobs (separate from `daily_ranking_pipeline`)
- If a provider is unavailable, gracefully show editorial data or empty state — never fabricated data

**Architecture:** Provider-independent adapter pattern (same as existing `ingestion/adapters/`). Each adapter normalizes external data into TrendTopic/MusicTrack rows.

---

## 13. Route Cleanup and Redirects

### Missing from Cursor plan

| Old Route | Action |
|---|---|
| `/news` | Redirect (301) → `/trending/news` |
| `/hashtags` | Redirect (301) → `/trending/internet-culture` |

After redirects are verified, delete:
- `apps/web/app/news/page.tsx`
- `apps/web/app/hashtags/page.tsx`
- `apps/api/src/news/` module (merge any useful logic into `trends/`)
- `apps/api/src/hashtags/` module (merge any useful logic into `trends/`)

Update sitemap and `robots.ts` for new routes.

---

## 14. Hardening, SEO, Accessibility

### What the Cursor plan says
Phase 9 covers high-level. Needs more specifics.

### Checklist

**Loading states:**
- Every discovery section needs a skeleton/loading state
- Use existing `TableSkeleton` pattern from `apps/web/components/feedback/table-skeleton.tsx`

**Empty states:**
- When no trending data: "No trending topics right now. Check back soon."
- When no music data: "Music discovery coming soon."
- Use existing `EmptyState` component from `apps/web/components/feedback/empty-state.tsx`

**Error states:**
- When API fails: use existing `ErrorBanner` pattern
- Graceful degradation: if discovery API fails, homepage should still render with charts/profiles

**Accessibility:**
- Trending ticker: must pause on hover AND on keyboard focus. Respect `prefers-reduced-motion`.
- Tab navigation through all interactive elements
- ARIA labels on all buttons, region toggles, sort tabs
- Screen reader announcements for filter changes

**SEO:**
- `generateMetadata()` for all new routes
- Structured data (JSON-LD) for trending pages where appropriate
- OpenGraph tags for sharing

**Regression testing:**
- Charts pages (global, india, movers) must continue working
- Profiles page and individual profile pages unchanged
- Account/auth flows unchanged
- Admin panel unchanged
- GroupMix functionality preserved (moved lower on homepage, not removed)

---

## 15. Implementation Phases — Ordered

| Phase | What | Files | Exit Criteria |
|---|---|---|---|
| **0** | Shared DTOs in `@igshorts/shared` | `packages/shared/src/trend.types.ts`, `music.types.ts`, `pulse.types.ts`, `visit.types.ts` | Types exported, build passes |
| **1** | Navigation update | `public-header.tsx`, `public-footer.tsx` | New nav renders; chart subnav only on chart pages; mobile menu updated |
| **2** | Prisma models + migrations + Nest modules + seed script | `schema.prisma`, `apps/api/src/trends/`, `music/`, `pulse/`, `visit-diff/`, `scripts/seed-discovery.ts` | New endpoints return seed data; existing APIs untouched |
| **3** | Homepage redesign | `apps/web/app/page.tsx`, `apps/web/components/discovery/*` (10 components) | Homepage is discovery-first; old content below fold; empty/error states work |
| **4** | Trending hub + 6 category pages + redirects | `apps/web/app/trending/page.tsx`, `apps/web/app/trending/[category]/page.tsx`, redirect old `/news` and `/hashtags` | All 6 categories browsable with India/Global filter and sort tabs |
| **5** | Music discovery page | `apps/web/app/music/page.tsx`, music components | Music page functional with collections, ticker, Now Playing/Up Next, external links |
| **6** | Daily Pulse + Creator Spotlight | Pulse section wired to API; Creator Spotlight from existing ranking data | Pulse shows 5 daily slots; Spotlight shows real creator movers |
| **7** | Since Your Last Visit | `discovery/since-last-visit.tsx`, localStorage logic, member `lastVisitedAt` update | Returning visitors see real diffs; first visitors see welcome; dismissible |
| **8** | Provider adapters + refresh jobs | `apps/api/src/trends/adapters/`, scheduled jobs | At least one live provider (music OR news) behind env flag |
| **9** | QA / SEO / a11y / deploy | Metadata, sitemaps, regression, ticker accessibility | Full regression green; deploy API + web together |

---

## 16. What Is Out of Scope

1. Rebuilding ranking algorithms or FastSocial import pipeline
2. Custom in-site music streaming player (external links only)
3. Claiming Instagram-wide search or all-public-profile coverage
4. Copying Frisky/FilterMusic pixel-for-pixel or switching brand to pink/dark
5. Fabricating trend scores, popularity percentages, or creator-audio usage numbers
6. Building a full admin UI for pulse curation (CLI-first is fine for v1)
7. Meta Business Discovery API integration (separate track — see `docs/IGshorts_Data_Engine_For_Review.md`)

---

## 17. Important Rules for Cursor

1. **Do not remove existing working functionality.** Charts, profiles, auth, admin must keep working.
2. **Do not change existing ranking logic** (Global 100, India 100, competition ranking math).
3. **Do not replace the brand identity.** Keep black/white + green accent, Oswald, Inter, JetBrains Mono.
4. **Do not duplicate creator data.** Creator Spotlight and Creator of the Day must use existing CreatorProfile/RankingEntry data.
5. **Do not fabricate data.** No invented popularity scores, fake news, estimated creator usage counts, or randomly generated trends.
6. **Do not scrape** any website in violation of its terms.
7. **Label seed/editorial data** clearly. Never present editorial selections as live feeds.
8. **Keep the architecture modular.** Provider adapters should be swappable without frontend changes.
9. **Reuse existing components** (BillboardList, Avatar, FollowerCount, RankDeltaChip, etc.) inside Creator Spotlight and wherever applicable.
10. **Responsive layouts** — all new pages and components must work on desktop, tablet, and mobile.
11. **API credentials and secrets** stay server-side only.
12. **Ship UI first with seed data,** then wire live providers. Don't block UI on API integrations.

---

## 18. Gap Summary — What Was Missing from the Cursor Plan

| Gap | Where Fixed |
|---|---|
| No full Prisma model definitions | Section 2 |
| No complete API endpoint specifications | Section 3 |
| No component file names or directory structure | Section 4 |
| No details on route cleanup (redirect old /news, /hashtags) | Section 13 |
| No shared DTO type definitions | Section 10 |
| No seed script requirement | Section 11 |
| Mobile menu nav update not explicitly mentioned | Section 1 |
| Active state logic for new nav items not specified | Section 1 |
| Chart subnav scoping condition not specified | Section 1 |
| VisitDiff response shape not defined | Section 8 |
| Trending category page implementation (dynamic vs static routes) not decided | Section 5 |
| Empty/error state requirements not enumerated | Section 14 |
| Accessibility specifics for ticker (pause, reduced motion) not listed | Section 14 |
| Regression testing checklist absent | Section 14 |
| Creator Spotlight data source not explicitly mapped to existing movers logic | Section 9 |
| Daily Pulse nightly job name and separation from ranking pipeline not stated | Section 7 |
