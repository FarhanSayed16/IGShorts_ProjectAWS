# IGshorts UI/UX Design Enhancement (Screenshot-Led)

> **Document Version:** 1.0.0  
> **Source Evidence:** Production visual audit of [https://ig-shorts-project-aws.vercel.app](https://ig-shorts-project-aws.vercel.app) across Desktop (1440×900), Mobile (390×844), and Tablet (768×1024) viewports.  
> **Brand Lock:** Billboard editorial charts identity — High-contrast black/white canvas (`#f3f3f3` light / `#0f0f0f` dark), sharp borders, Oswald display typography, Inter body, and emerald green accents (`#00d26a` / `#00e38c`). No generic SaaS blues, no cream/terracotta, no fake stats.

---

## 1. Executive Summary

A comprehensive visual tour across 20 routes and 3 viewports on the live production deployment revealed that while the core architectural primitives (Next.js 15 App Router, NestJS API, Supabase data ingestion, and Turborepo) are functioning with zero runtime hydration crashes, the front-end user experience suffers from several key editorial and hierarchy weaknesses:

1. **Unclear Product Identity on First Viewport (Homepage)**: Landing on the homepage (`/`) presents the header and ticker, immediately followed by an AI product feature card. There is no editorial masthead, sub-headline, or clear statement explaining that IGshorts is the **public authority ranking of Instagram personalities and cultural trends**.
2. **Broken Editorial Imagery & 404 External Assets**: The Unsplash image URLs for News and Internet Culture return HTTP 404. Furthermore, `<DiscoveryMedia>` lacks client error handling, rendering raw broken image browser placeholders instead of the branded SVG/gradient fallbacks.
3. **Missing Follower Telemetry on Profile Detail**: On individual creator profiles (`/profiles/[username]`), the hero card prominently shows rank and bio but omits the verified follower count (`679.8M`), forcing users to search through textual paragraphs to find the actual metric.
4. **Weak Report Hierarchy on Charts**: The Global 100 and India 100 leaderboards feature a warning ribbon and filter chips, but the Saved List Split (`GroupMix`) donut is absent from `chart-view.tsx`, and the table density on mobile needs tighter alignment between rank, avatar, and follower counts.
5. **Sparse Empty States on Secondary Pages**: `/movers` displays two blank debut cards with excessive empty space below the fold when no rank drift exists yet, rather than offering informative tracking cycle previews.
6. **Music Discovery Ergonomics**: The Music page offers external Spotify/YouTube links as mandated, but the "Up Next" panel has raw text buttons ("SELECT") floating on empty backgrounds without clear track separation.

---

## 2. Screenshot Tour Inventory

| Route | Viewports Audited | Primary Observations | Severity |
|---|---|---|---|
| `/` (Homepage) | 1440×900, 390×844, 768×1024 | Immediate transition into AI tools card; no editorial masthead; broken images in "News" and "Internet Culture" category cards. | **P0** |
| `/trending` | 1440×900, 390×844, 768×1024 | Clean 3-column grid; region toggle and sorting work; card footer typography feels slightly ungrounded. | **P1** |
| `/trending/news` | 1440×900, 390×844 | Broken Unsplash hero image (`404`); single card leaves 66% horizontal whitespace empty. | **P0** |
| `/trending/internet-culture` | 1440×900, 390×844 | Broken Unsplash meme image (`404`); sparse 1-card row. | **P0** |
| `/trending/technology` | 1440×900, 390×844 | 2 cards load well; typography and badge chips clear. | **P2** |
| `/trending/entertainment` | 1440×900, 390×844 | OTT premiere card renders properly; needs tighter summary rhythm. | **P2** |
| `/trending/music` | 1440×900, 390×844 | Functional; outbound links to Spotify work properly. | **P2** |
| `/trending/sports-gaming` | 1440×900, 390×844 | Tournament card renders; clean status tags. | **P2** |
| `/music` | 1440×900, 390×844, 768×1024 | Ticker smooth; Now Playing card clear; Up Next list has plain text "SELECT" and wide padding. | **P1** |
| `/charts/global` | 1440×900, 390×844, 768×1024 | #1 Cristiano hero card impactful; `GroupMix` omitted from page body; stale ribbon warning banner styling prominent. | **P1** |
| `/charts/india` | 1440×900, 390×844 | Virat Kohli #1 hero card renders; regional filters functional; search responsive. | **P1** |
| `/movers` | 1440×900, 390×844 | Gainers and Decliners both show debut state; page feels empty and abandoned. | **P1** |
| `/profiles` | 1440×900, 390×844 | 12,013 profiles table renders cleanly; search with debouncing; pagination works. | **P2** |
| `/profiles/cristiano` | 1440×900, 390×844 | Hero card lacks prominent follower metric; "Major" tier table clean but disconnected from top hero. | **P0** |
| `/methodology` | 1440×900, 390×844 | High quality editorial typography; clear 5-point manifesto. | **P2** |
| `/about` | 1440×900, 390×844 | Concise mission statement; clean layout. | **P2** |
| `/faq` | 1440×900, 390×844 | Accordion and editorial Q&A legible. | **P2** |
| `/account` | 1440×900, 390×844 | Clean form; clear disclaimer about non-ownership proof. | **P2** |
| `/news` (Redirect) | 1440×900, 390×844 | Correctly redirects to `/trending/news`. | **Pass** |
| `/hashtags` (Redirect) | 1440×900, 390×844 | Correctly redirects to `/trending/internet-culture`. | **Pass** |

---

## 3. Cross-Cutting Findings

### 3.1. Visual Hierarchy & Masthead Presence
- **Issue**: On the homepage, users are plunged into an AI tech story without any orienting context. The brand logo in the header reads `IGSHORTS`, but the page does not declare what IGshorts is.
- **Remedy**: Introduce a sharp editorial masthead banner above the discovery stack that frames the publication: *"IGSHORTS · THE PUBLIC INSTAGRAM OBSERVATORY & CULTURAL DISCOVERY"*, accompanied by the live tracked metrics count (12,107 profiles) and current issue date.

### 3.2. Broken Image Resilience & Fallback Handling
- **Issue**: Unsplash image URLs (`photo-1504711434869-ddd1f1e126cd` and `photo-1611162617474-5b21e11e480f`) return HTTP 404, causing raw browser image error symbols across CategoryGrid and TrendCards.
- **Remedy**: 
  1. Replace broken external URLs in seed scripts and constants with permanent reliable Unsplash IDs or local high-contrast SVG patterns.
  2. Implement an automatic image error fallback in `DiscoveryMedia` using React state `hasError` to seamlessly switch to branded geometric gradient cards with category watermarks.

### 3.3. Information Density & Follower Metrics Prominence
- **Issue**: On `/profiles/[username]`, the most critical metric (public follower count) is absent from the primary hero container.
- **Remedy**: Embed a bold, tabular-numeral follower counter directly in the creator header alongside the rank badge (e.g., `#1 · 679.8M Followers · Standard Competition Rank`).

### 3.4. Mobile First-Class Ergonomics
- **Issue**: On mobile (390px), tables in `chart-view.tsx` and `billboard-list.tsx` push follower counts and deltas to the right edge with potential wrapping, and the sticky header takes up significant vertical space.
- **Remedy**: Optimize mobile padding, tighten rank number spacing, and ensure follower deltas sit neatly stacked below the follower count.

---

## 4. Brand-Safe Design Principles (Locked Tokens)

All enhancements strictly adhere to the established tokens in `apps/web/styles/tokens.css`:
- **Palette**: Monochromatic charcoal/white foundation with emerald accents.
  - Light Canvas: `#f3f3f3`, Surface: `#ffffff`, Line: `#e6e6e6`
  - Dark Canvas: `#0f0f0f`, Surface: `#1a1a1a`, Line: `#2b2b2b`
  - Accent Green: `#00d26a` (Light) / `#00e38c` (Dark)
  - Text: Ink `#111111` / Ink Muted `#5c5c5c` / Ink Faint `#8a8a8a`
- **Typography**: 
  - Headlines & Titles: **Oswald** (`font-display`, uppercase, letter-spacing `0.02em`, tight leading).
  - Body Text: **Inter** (`font-sans`, high legibility, neutral editorial tone).
  - Data, Numbers & Ranks: **JetBrains Mono** (`tabular-nums`, lining figures).
- **Prohibited Aesthetics**:
  - NO purple/indigo SaaS gradients.
  - NO warm terracotta/cream "AI-generated" palettes.
  - NO rounded pill buttons with heavy drop shadows (keep radii at `2px`–`4px` for architectural sharpness).

---

## 5. Page-by-Page Recommendations

### 5.1. Discovery Homepage (`/`)
- **Observation**: First screen displays ticker, then immediately `<FeaturedTrend>` with AI story.
- **Problem**: New visitors miss the core brand promise (Instagram public rankings + cultural trends).
- **Proposal**: 
  1. Add an **Editorial Masthead Strip** right beneath the ticker with publication metadata:
     - Left: *"IGSHORTS · THE PUBLIC INSTAGRAM DIRECTORY & CULTURAL OBSERVATORY"*
     - Center: *"TRACKED WATCHLIST: 12,107 INDEXED CREATORS"*
     - Right: Live As-of Date & Edition Indicator.
  2. Tighten vertical gap between Featured Trend and Category Grid.
  3. Fix broken category images (News and Internet Culture).
- **Likely Files**: `apps/web/app/page.tsx`, `apps/web/components/discovery/category-grid.tsx`, `apps/web/components/discovery/featured-trend.tsx`.
- **Priority**: **P0**

### 5.2. Creator Profile Detail (`/profiles/[username]`)
- **Observation**: Hero card displays Rank #1, portrait, bio, and "View on Instagram", but omits the verified follower count.
- **Problem**: Core user expectation on a leaderboard site is to see the exact follower metric immediately.
- **Proposal**:
  1. Add a dedicated **Follower Metric Pillar** to the hero card:
     - Large display number: `679,800,000` (or `679.8M`).
     - Subtitle: *"Verified Public Followers · Standard Competition Ranking"*.
     - Rank Delta chip adjacent to current position.
  2. Connect the audience tier table directly to the hero score with an active tier highlight indicator.
- **Likely Files**: `apps/web/app/profiles/[username]/page.tsx`.
- **Priority**: **P0**

### 5.3. Global 100 & India 100 Leaderboards (`/charts/global`, `/charts/india`)
- **Observation**: `chart-view.tsx` fetches `mix` (audience breakdown) but never renders it. Stale ribbon is rendered as a separate orange bar without cohesive report framing.
- **Problem**: The page feels disjointed and lacks the "Billboard Magazine" report feel.
- **Proposal**:
  1. Integrate the **Saved List Split (`GroupMix`)** as a clean editorial appendix section at the bottom of the chart view, explaining the dataset context and audit rules.
  2. Refine the table header bar: integrate the freshness date, total ranked count, and methodology link into a unified editorial report header.
  3. Ensure active filter chips (`All`, `Actors`, `Sports`, etc.) have strong tactile contrast.
- **Likely Files**: `apps/web/components/rank/chart-view.tsx`, `apps/web/components/rank/billboard-list.tsx`.
- **Priority**: **P1**

### 5.4. Category & Trending Hub Pages (`/trending`, `/trending/[category]`)
- **Observation**: `/trending/news` and `/trending/internet-culture` have broken images and 1 solitary card leaving the page feeling bare.
- **Problem**: Visitors feel the site is abandoned or broken.
- **Proposal**:
  1. Update image URLs to high-quality, reliable Unsplash IDs with permanent availability.
  2. In `DiscoveryMedia`, add automated graceful fallback handling so broken images never show broken icons.
  3. For sparse category views, add an editorial discovery explainer block explaining the curation criteria for that specific vertical.
- **Likely Files**: `apps/web/components/discovery/discovery-media.tsx`, `apps/api/src/scripts/seed-discovery.ts`, `apps/web/app/trending/[category]/page.tsx`.
- **Priority**: **P0**

### 5.5. Music Discovery (`/music`)
- **Observation**: Now Playing card is functional, but Up Next items have raw "SELECT" text links and generous empty space.
- **Problem**: Visual layout feels like an unstyled HTML list rather than a curated audio curation console.
- **Proposal**:
  1. Polish `now-playing-panel.tsx` and `up-next-list.tsx`: give Up Next tracks numbered badges, duration/album chips, and a crisp hover state.
  2. Ensure the Tickertape-style music ticker pauses cleanly on keyboard focus and hover.
- **Likely Files**: `apps/web/components/discovery/now-playing-panel.tsx`, `apps/web/components/discovery/up-next-list.tsx`.
- **Priority**: **P1**

### 5.6. Movers & Velocity Ticker (`/movers`)
- **Observation**: Two large white boxes with "DEBUT - Gainers appear after next ranking run" floating over vast black space.
- **Problem**: Empty states look unfinished.
- **Proposal**:
  1. Add an informative **"How Velocity Is Measured"** explainer card alongside the debut state.
  2. Offer a quick-jump module pointing directly to the live Global Top 10 and India Top 5 so the page provides immediate navigational value.
- **Likely Files**: `apps/web/app/movers/page.tsx`.
- **Priority**: **P1**

---

## 6. Component-Level Redesign Notes

### 6.1. `DiscoveryMedia` (`discovery-media.tsx`)
- Add stateful error boundary:
  ```tsx
  const [imageError, setImageError] = useState(false);
  if (!imageUrl || imageError) {
    return <BrandedFallbackPattern category={category} label={label} />;
  }
  return <img src={imageUrl} alt={alt} onError={() => setImageError(true)} ... />;
  ```

### 6.2. `BillboardList` (`billboard-list.tsx`)
- Enhance hero card (#1): Add verified rank crown/badge and clear typography scale.
- Tighter mobile layout: Ensure rank numbers have a fixed tabular column width (`w-12 sm:w-16`) to eliminate horizontal jaggedness.

### 6.3. `GroupMix` (`group-mix.tsx`)
- Maintain donut chart SVG; refine legend typography so percentages and counts line up with monospaced tabular numbers.

---

## 7. Content & Information-Design Rules

1. **Honest Data Only**: If a creator count is missing, display *"Unranked — Missing Verified Count"*. Never coerce `null` to `0`.
2. **Attribution Tags**: Every editorial item must preserve its small uppercase tag: `TECHNOLOGY · FEATURED · EDITORIAL SELECTION`.
3. **Outbound Music Only**: Music cards must explicitly label actions as `LISTEN ON SPOTIFY ↗` and `LISTEN ON YOUTUBE ↗`.
4. **Time Clarity**: All time stamps must distinguish between *Published Date* and *Observation/Check Date*.

---

## 8. Do-Not-Change List

- ❌ DO NOT alter standard competition ranking mathematics (`1224` rank logic in `apps/api/src/ranking/`).
- ❌ DO NOT modify database schemas or delete existing profile tracks.
- ❌ DO NOT change brand color tokens (`#f3f3f3` / `#111111` / `#00d26a`).
- ❌ DO NOT install external third-party music streaming widgets.
- ❌ DO NOT scrape live Instagram endpoints.

---

## 9. Priority Matrix (P0 / P1 / P2)

| Priority | Item | Impact | Effort | Files |
|---|---|---|---|---|
| **P0** | Fix 404 image URLs & add `<DiscoveryMedia>` onError fallback | Eliminates broken UI artifacts across Home, Trending, and Category pages | Small | `discovery-media.tsx`, `category-grid.tsx`, `seed-discovery.ts` |
| **P0** | Add prominent Follower Count to Creator Profile hero card | Solves core product utility: seeing the follower metric on profile pages | Small | `apps/web/app/profiles/[username]/page.tsx` |
| **P0** | Add Editorial Masthead to Homepage first viewport | Fixes muddy product identity; establishes authority on arrival | Small | `apps/web/app/page.tsx`, `apps/web/components/chrome/editorial-masthead.tsx` |
| **P1** | Restore `GroupMix` to `chart-view.tsx` and refine report header | Provides complete dataset context and Billboard magazine feel | Medium | `apps/web/components/rank/chart-view.tsx` |
| **P1** | Enhance `/movers` empty state with methodology & leader jumps | Prevents dead-end feel when tracking cycle is in debut state | Small | `apps/web/app/movers/page.tsx` |
| **P1** | Polish Music discovery Up Next panel & track cards | Improves interactive feel and readability without in-app streaming | Small | `now-playing-panel.tsx`, `up-next-list.tsx` |
| **P2** | Polish responsive mobile tables in `billboard-list.tsx` | Prevents edge wrapping on small 390px screens | Small | `apps/web/components/rank/billboard-list.tsx` |
| **P2** | Add category explainer blurbs to sparse category pages | Improves context when category has few initial seed entries | Small | `apps/web/app/trending/[category]/page.tsx` |

---

## 10. Success Criteria & Acceptance Checks

- [ ] All 20 site routes render without any broken image icons or browser error placeholders.
- [ ] Homepage first viewport communicates the IGshorts mission and publication date clearly.
- [ ] Profile pages display the creator's follower count prominently in the hero section.
- [ ] Global and India chart pages feature cohesive report headers and include the Saved List Split.
- [ ] No regressions in ranking math, database tables, or authentication flows.
- [ ] All viewports (Desktop 1440px, Tablet 768px, Mobile 390px) display well-balanced, legible typography.
