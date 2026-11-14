# IGshorts UI/UX Implementation Plan (Phased Engineering Spec)

> **Document Version:** 1.0.0  
> **Target Scope:** Production UI/UX enhancement based on screenshot audit (`docs/uiux_design_enhancement_from_screenshots.md`).  
> **Brand Lock:** Billboard Black/White/Green identity, standard competition ranking (`1224`), verified follower counts only.

---

## Architecture Map & Target Files

```text
apps/web/
├── app/
│   ├── page.tsx                               # Homepage editorial masthead + discovery layout
│   ├── charts/[chartKey]/page.tsx             # Server chart loader
│   ├── movers/page.tsx                        # Velocity & rank change hub
│   ├── profiles/[username]/page.tsx           # Creator profile hero & metric telemetry
│   └── trending/[category]/page.tsx           # Vertical category pages
├── components/
│   ├── chrome/
│   │   ├── editorial-masthead.tsx             # [NEW] Masthead banner for publication identity
│   │   ├── public-header.tsx                  # Nav links, subnav scoping
│   │   └── public-footer.tsx                  # Trust links & edition footer
│   ├── discovery/
│   │   ├── discovery-media.tsx                # Resilient image with onError fallback
│   │   ├── category-grid.tsx                  # Category navigation grid
│   │   ├── featured-trend.tsx                 # Headline editorial story card
│   │   ├── now-playing-panel.tsx              # Featured audio discovery panel
│   │   └── up-next-list.tsx                   # Curated audio queue
│   └── rank/
│       ├── chart-view.tsx                     # Editorial report header + GroupMix integration
│       ├── billboard-list.tsx                 # Row density, mobile alignment, rank chips
│       └── follower-count.tsx                 # Tabular follower formatting
apps/api/
└── src/scripts/
    └── seed-discovery.ts                      # Update 404 Unsplash image constants
```

---

## Phase A — Chrome & Editorial Masthead (P0)

### Goals
- Establish unambiguous publication authority and brand value proposition on first viewport across desktop, tablet, and mobile.
- Declare the nature of the platform: *The Public Instagram Observatory & Cultural Discovery*.

### Files to Modify / Create
- `apps/web/components/chrome/editorial-masthead.tsx` (New component)
- `apps/web/app/page.tsx` (Insert masthead below ticker, above featured story)
- `apps/web/components/chrome/public-header.tsx` (Refine subnav underline alignment)

### Implementation Detail
- Create `<EditorialMasthead />` showing:
  - Eyebrow: `IGSHORTS OBSERVED EDITION · FASTSOCIAL + VERIFIED PUBLIC LEDGER`
  - Headline: `PUBLIC INSTAGRAM PEOPLE CHARTS & CULTURAL DISCOVERY`
  - Subtitle: `Tracking 12,107 indexed creator profiles and cultural momentum across Music, Tech, Culture, and Sports.`
  - As-of timestamp and audit methodology link.
- Keep background transparent or canvas-aligned with subtle bottom hairline border.

### Out of Scope
- Rebuilding header navigation or modifying member auth login routes.

### Test Checklist
- [ ] Desktop (1440px): Masthead renders cleanly without pushing featured trend off-screen.
- [ ] Mobile (390px): Masthead text wraps comfortably without horizontal overflow.
- [ ] Dark Mode: Ink/canvas contrast remains sharp and legible.

---

## Phase B — Resilient Media & Category Grid (P0)

### Goals
- Eradicate all broken images (`404` errors) across Category Grid, Trend Cards, and Category pages.
- Ensure `<DiscoveryMedia>` never displays browser error icons if any remote asset fails to load.

### Files to Modify
- `apps/web/components/discovery/discovery-media.tsx` (Add client error boundary & SVG fallback)
- `apps/web/components/discovery/category-grid.tsx` (Replace broken News & Internet Culture URLs)
- `apps/api/src/scripts/seed-discovery.ts` (Update seed database image constants)

### Implementation Detail
- In `discovery-media.tsx`, convert image element to use React client component with `useState(false)` for `hasError`:
  - When `hasError === true` or `!imageUrl`: render high-contrast SVG geometric pattern with emerald accent watermark and category label.
- Replace broken Unsplash image IDs with robust, verified high-resolution editorial photos:
  - News: `photo-1585829365295-ab7cd400c167` (Newspaper/Press editorial)
  - Internet Culture: `photo-1526374965328-7f61d4dc18c5` (Digital matrix / viral network)

### Out of Scope
- Building custom image uploading or CDN infrastructure.

### Test Checklist
- [ ] Inspect `/` in headless Edge: "News" and "Internet Culture" category cards load beautiful photos.
- [ ] Simulate broken URL: Component falls back to elegant branded gradient block instead of broken icon.
- [ ] `/trending/news` and `/trending/internet-culture` load with zero visual artifacts.

---

## Phase C — Profile Detail Follower Telemetry (P0)

### Goals
- Fulfill core user expectation on `/profiles/[username]`: display the creator's verified follower count prominently in the top hero block.

### Files to Modify
- `apps/web/app/profiles/[username]/page.tsx`

### Implementation Detail
- In the hero header card:
  - Add a dedicated follower count highlight alongside the rank badge and portrait:
    - Large tabular numeral (e.g. `679.8M` or `679,800,000`).
    - Label: `VERIFIED PUBLIC FOLLOWERS` with source citation (`FastSocial Open Index` or `Seed List`).
    - Rank delta chip positioned adjacent to current rank.
- Maintain honest null handling: if follower count is missing, display prominent amber pill: *"Unranked — Missing Verified Count"*.

### Out of Scope
- Adding real-time Instagram scraping or modifying PostgreSQL snapshot records.

### Test Checklist
- [ ] Check `/profiles/cristiano`: Hero prominently displays `679.8M` followers and `#1` rank.
- [ ] Check unranked profile: Displays *"Missing verified count"* without throwing errors.
- [ ] Mobile (390px): Hero card elements stack gracefully without clipping.

---

## Phase D — Charts Report Hierarchy & Saved List Split (P1)

### Goals
- Transform Global 100 and India 100 from simple lists into comprehensive, magazine-quality ranked reports.
- Restore the Saved List Split (`GroupMix`) to `chart-view.tsx` so users understand the whole universe distribution.

### Files to Modify
- `apps/web/components/rank/chart-view.tsx`
- `apps/web/components/rank/billboard-list.tsx`

### Implementation Detail
- In `chart-view.tsx`:
  - Re-integrate `<GroupMix mix={mix} ... />` below the paginated BillboardList as an editorial appendix.
  - Refine the report header: combine `total ranked`, `as of date`, `algorithm version (followers_v1)`, and methodology link into a structured report header banner.
- In `billboard-list.tsx`:
  - Enforce fixed tabular width for rank numbers (`w-12 sm:w-16`) to guarantee vertical column alignment.
  - Optimize mobile spacing for follower numbers and category pills.

### Out of Scope
- Modifying standard competition ranking mathematics or sorting logic.

### Test Checklist
- [ ] `/charts/global`: Report header displays as-of date and total ranked.
- [ ] Bottom of `/charts/global`: GroupMix donut displays audience breakdown (Major, Public, Established, Community).
- [ ] Mobile view: Billboard list rows remain aligned with no horizontal overflow.

---

## Phase E — Movers Velocity Hub Polish (P1)

### Goals
- Resolve the sparse, abandoned appearance of `/movers` when the system is in its initial debut cycle.

### Files to Modify
- `apps/web/app/movers/page.tsx`

### Implementation Detail
- Add an editorial guidance panel explaining the velocity tracking rules:
  - How rank drift is computed ($\Delta = \text{Rank}_{\text{previous}} - \text{Rank}_{\text{current}}$).
  - Snapshot cadence (weekly comparison cycle).
- Provide quick-jump preview links to the Global 100 and India 100 leaderboards so visitors are guided to active rankings.

### Out of Scope
- Inventing fake rank changes or mocking historical data.

### Test Checklist
- [ ] `/movers` renders with balanced visual rhythm.
- [ ] Links to Global and India leaderboards work properly.

---

## Phase F — Music Discovery & Ergonomics Polish (P1)

### Goals
- Polish the interactive ergonomics of the `/music` discovery hub without adding an in-app audio streaming player.

### Files to Modify
- `apps/web/components/discovery/now-playing-panel.tsx`
- `apps/web/components/discovery/up-next-list.tsx`

### Implementation Detail
- Replace raw "SELECT" text links in `up-next-list.tsx` with styled track index badges and play-target indicators.
- Ensure Spotify and YouTube action buttons have clear icon badges and external link indicators (`↗`).
- Maintain strict editorial labeling: `EDITORIAL SELECTION · OPENS SPOTIFY OR YOUTUBE`.

### Out of Scope
- Building an HTML5 audio player or streaming music files.

### Test Checklist
- [ ] Track switching in Up Next updates the Now Playing featured card state.
- [ ] Outbound links to Spotify and YouTube open in new tabs with `noopener noreferrer`.

---

## Phase G — Verification, Regression & Build Pass

### Goals
- Ensure zero TypeScript compiler errors, clean ESLint validation, zero hydration warnings, and flawless builds.

### Execution Steps
1. Run `pnpm turbo build` or `pnpm --filter @igshorts/web build`.
2. Re-run headless screenshot verification script across all updated routes.
3. Visually verify desktop, tablet, and mobile captures.
