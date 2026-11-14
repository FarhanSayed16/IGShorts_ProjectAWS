# Antigravity Prompt — IGshorts UI/UX Audit, Design Spec & Implementation Plan

**Copy everything below the line into Antigravity as the working brief.**  
This document is the single source of context for a screenshot-led UI/UX audit and a subsequent Billboard-style enhancement plan + implementation.

---

## Your mission (read this first)

You are working on **IGshorts**, a public Instagram people-charts + discovery website.

1. **Take a complete visual tour** of the live production site (desktop + mobile widths). Capture or thoroughly inspect every major page listed below.
2. From what you **actually see** (not guesses), decide what UI/UX enhancements will make the product clearer, more report-like, more editorial, and more trustworthy — **without breaking the Billboard black / white / green identity**.
3. Write a **consolidated design enhancement file** (markdown) that is specific, page-by-page, and prioritized.
4. Then write (or append) a **phased implementation plan** tied to real files in this monorepo.
5. Only after the design file + plan exist, **implement** the approved UI/UX changes in code, keeping brand tokens and chart ranking math intact.

Do **not** invent a new brand. Do **not** switch to purple/indigo, cream/terracotta, or Frisky pink/dark. Do **not** rebuild the ranking algorithm. Do **not** fabricate live trend metrics or creator audio-usage counts.

---

## Live system to screenshot / inspect

| Layer | Host | URL |
|---|---|---|
| Website (Next.js) | Vercel | **https://ig-shorts-project-aws.vercel.app** |
| API (NestJS) | Render | **https://igshorts-projectaws.onrender.com/api/v1** |
| Database | Supabase PostgreSQL | (backend only; do not expose credentials) |
| Repo | GitHub | `FarhanSayed16/IGShorts_ProjectAWS` |

**Note:** Render Free sleeps after ~15 minutes idle. If API calls fail or pages look empty of data, wait ~60s and retry once before concluding a UI bug.

### Pages you MUST open (full tour)

**Public discovery & charts**

1. `/` — Discovery homepage (ticker, featured, categories, Now Trending, Music on Repeat, Creator Spotlight, Daily Pulse, Since Last Visit, Charts strip)
2. `/trending` — Trending hub (region + sort tabs + card grid)
3. `/trending/music`, `/trending/news`, `/trending/internet-culture`, `/trending/entertainment`, `/trending/technology`, `/trending/sports-gaming`
4. `/music` — Music discovery (ticker, collection tabs, Now Playing, Up Next, collections, On Repeat)
5. `/charts/global` — Global 100 (ranking list + Saved list split)
6. `/charts/india` — India 100
7. `/movers` — Gainers / losers
8. `/profiles` — Watchlist / directory
9. `/profiles/[any-ranked-username]` — e.g. a top Global name from the chart
10. `/methodology`
11. `/about`
12. `/faq`

**Auth / account (if reachable without secrets)**

13. `/account` — member sign-in / account surface
14. Public header Sign in flow

**Optional admin (only if credentials exist; otherwise skip)**

15. `/admin/login` and admin overview — do not break auth; do not commit secrets

### Viewport matrix (required)

For every page above, inspect at least:

- **Desktop** ~1440×900  
- **Tablet** ~768×1024  
- **Mobile** ~390×844  

Also check: sticky header, chart subnav, tickers, horizontal music strips, long chart tables, empty states, and loading states.

### Soft redirects (verify they land correctly)

- `/news` → `/trending/news`  
- `/hashtags` → `/trending/internet-culture`

---

## Product identity (locked)

IGshorts is:

- An **editorial discovery + ranking** site for a **curated watchlist** of public Instagram people.
- Ranked by **public follower count** (`followers_v1`), not impressions, not engagement guesses.
- Expanding into **Trending / Music / Daily Pulse** discovery, but charts remain under **Charts**.
- Visual language inspired by **Billboard charts**: bold display type, high contrast, sharp editorial layouts, green accent — **not** a generic SaaS dashboard.

Brand copy anchors:

- Name: **IGshorts**
- Tagline: Public Instagram people charts
- Mission: Public charts of famous Instagram people on our tracked watchlist, ranked by public follower count. Not all of Instagram. Not impressions.

---

## Brand system — DO NOT REPLACE

Source of truth: `apps/web/styles/tokens.css`

### Light mode (default product look)

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#f3f3f3` | Page background |
| `--surface` | `#ffffff` | Cards / panels |
| `--ink` | `#111111` | Primary text |
| `--ink-muted` | `#5c5c5c` | Secondary text |
| `--ink-faint` | `#8a8a8a` | Tertiary |
| `--line` | `#e6e6e6` | Borders / dividers |
| `--subnav` | `#111111` | Chart subnav bar |
| `--subnav-active` / `--accent` | `#00d26a` | Active + brand green |
| `--accent-soft` | `#e8fff3` | Soft green wash |
| Up / Down | `#00a857` / `#e11d48` | Rank deltas |

### Typography (keep)

- Display / chart titles: **Oswald** (`.chart-title`, `.font-display`)
- UI body: **Inter**
- Numbers / mono: **JetBrains Mono** where already used for ranks/counts

### Layout rules already preferred by the product

- Sharp, editorial edges (small radii only; avoid pill-heavy SaaS chrome)
- Black subnav on chart routes; green active underline
- Billboard-style ranked lists (`BillboardList`, `RankDeltaChip`, `FollowerCount`, `Avatar`)
- Discovery uses a `discovery/` component set under `apps/web/components/discovery/`

### Explicitly forbidden visual directions

- Purple-on-white / purple-to-indigo themes
- Warm cream + terracotta “AI default” looks
- Broadsheet hairline newspaper pastiche as a full restyle
- Frisky.fm pink / dark-radio clone
- Glow stacks, glassmorphism overload, emoji-as-badges, rounded-full pill clusters
- Replacing Oswald/Inter with Inter-only generic stacks
- Inventing popularity % or “used by N creators” unless the field is non-null from a proven source

---

## Architecture context (so you edit the right places)

Monorepo:

```text
apps/web          → Next.js 15 frontend (Vercel)
apps/api          → NestJS API (Render)
packages/shared   → DTOs, API_PATHS, chart keys, discovery types
packages/db       → Prisma schema + migrations
infra/            → AWS CDK (not the current live host path)
```

Important frontend areas:

| Area | Paths |
|---|---|
| Tokens | `apps/web/styles/tokens.css`, `apps/web/app/globals.css` |
| Chrome | `apps/web/components/chrome/public-header.tsx`, `public-footer.tsx`, `command-palette.tsx` |
| Discovery UI | `apps/web/components/discovery/*` |
| Charts / rank | `apps/web/components/rank/*` especially `chart-view.tsx`, `billboard-list.tsx`, `group-mix.tsx` |
| Feedback | `apps/web/components/feedback/*` |
| Homepage | `apps/web/app/page.tsx` |
| Trending | `apps/web/app/trending/**` |
| Music | `apps/web/app/music/**` |
| Messages | `apps/web/messages/en.json` |

Backend note for UI honesty:

- Discovery rows may be labeled `sourceLabel: editorial` — UI should keep “Editorial selection” clear.
- Creator Spotlight may fall back to top chart people when movers are empty.
- Do not fabricate movers, freshness, or usage counts in the UI.

---

## What the current site already has (baseline)

Use this as the “as-is” checklist while screenshotting:

### Navigation
- Top links: Trending · Music · Charts · Profiles · Methodology · About
- Logo → Home (`/`)
- Chart subnav (Global 100 / India 100 / Movers / Watchlist) only on `/charts/*` and `/movers`
- Command palette (⌘/Ctrl+K), Sign in, theme toggle

### Homepage discovery stack (top → bottom)
1. Trending ticker  
2. Featured trend  
3. Explore categories (6 lanes)  
4. Now Trending (region + Popular / Rising / New)  
5. Music on Repeat strip  
6. Creator Spotlight  
7. Daily Pulse  
8. Since Last Visit (client)  
9. Charts strip (Global top 10 / India top 5 / GroupMix)  

### Charts
- Global 100 / India 100 with search, category chips, pagination
- Saved list split (GroupMix donut) — currently demoted below the ranking list
- Freshness / stale ribbon logic exists in API + UI
- Movers page for gainers/losers

### Music
- External Spotify / YouTube links only — **no in-app streaming player**

### Data honesty rules (must survive redesign)
- Editorial seed is allowed and must stay labeled
- Never invent growth %, audio usage, or news claims
- Charts ranking math stays unchanged

---

## Known pain points to investigate (from product owner)

These are starting hypotheses. Confirm or revise with screenshots:

1. **Charts feel unclear / not “report-like” enough** — hierarchy between title, freshness, ranked list, filters, and Saved list split needs stronger editorial clarity.
2. **Pages feel sparse or uneven** — large empty whitespace, weak section rhythm, cards that still feel like placeholders even when content exists.
3. **Discovery vs Charts story is muddy** — visitors may not instantly understand what IGshorts is for on first viewport.
4. **Billboard list density / readability** — rank, avatar, name, category, followers, delta may need tighter scan patterns on desktop and mobile.
5. **Music & trending cards** — media, metadata chips, and CTAs need more confidence without looking like a generic media grid.
6. **Mobile UX** — sticky chrome, ticker, horizontal strips, and long tables need polish.
7. **Empty / loading / error states** — should feel intentional and brand-consistent, not abandoned.
8. **Information design** — more “report / chart magazine” clarity: captions, as-of dates, methodology cues, source labels.
9. **Motion** — keep purposeful (ticker pause, reduced-motion respect); avoid noisy animation.
10. **Accessibility** — contrast, focus rings, tab semantics, ticker clones, aria-pressed / live regions.

---

## Design north star (what “better” means here)

Target feeling: **Billboard chart magazine + modern discovery lane**, still black / white / green.

Good outcomes:

- First viewport of Home instantly says: **IGshorts · public people charts + what’s trending**
- Global 100 reads like a serious ranked report, not a dashboard widget dump
- Every section has one job, one headline, one supporting line
- Imagery and type create hierarchy; green accent is reserved for status/active/CTA emphasis
- Mobile is first-class, not a squeezed desktop
- Trust cues (editorial label, as-of, methodology) are visible without clutter

Inspiration **patterns only** (do not copy brand or pixels):

- Billboard chart pages (rank density, display type, bold hierarchy)
- Tickertape-style slim tickers (pause on hover/focus)
- Frisky / FilterMusic layout rhythm for music browsing — **not** their colors

---

## Required deliverable #1 — Consolidated UI/UX Design Enhancement File

Create this file in the repo (suggested path):

`docs/uiux_design_enhancement_from_screenshots.md`

### Required structure

```markdown
# IGshorts UI/UX Design Enhancement (Screenshot-Led)

## 1. Executive summary
## 2. Screenshot tour inventory
   - Page, viewport, what was observed, severity
## 3. Cross-cutting findings
   - Hierarchy, density, trust, motion, a11y, mobile
## 4. Brand-safe design principles (locked tokens)
## 5. Page-by-page recommendations
   - Home
   - Trending (+ categories)
   - Music
   - Charts Global / India
   - Movers
   - Profiles / Profile detail
   - Methodology / About / FAQ
   - Chrome (header, footer, command palette)
## 6. Component-level redesign notes
   - BillboardList, TrendCard, MusicCard, FeaturedTrend, GroupMix, StatusRibbon, etc.
## 7. Content & information-design rules
## 8. Do-not-change list
## 9. Priority matrix (P0 / P1 / P2)
## 10. Success criteria / acceptance checks
```

Each recommendation must include:

- **Observation** (what the screenshot showed)  
- **Problem** (why it hurts UX)  
- **Proposal** (concrete UI change)  
- **Constraint check** (still black/white/green? still honest data?)  
- **Likely files** (paths in this repo)  
- **Priority** (P0/P1/P2)

---

## Required deliverable #2 — Implementation Plan

Create or update:

`docs/uiux_implementation_plan.md`  
(and/or a Cursor plan under `.cursor/plans/` if you use that workflow)

Phased plan requirements:

1. **Phase A — Chrome & global rhythm** (header, spacing scale, section titles, footer)
2. **Phase B — Charts report redesign** (Global/India/Movers scanability; freshness; GroupMix placement)
3. **Phase C — Homepage discovery polish** (first viewport story; section cadence)
4. **Phase D — Trending & Music surfaces**
5. **Phase E — Profiles & trust pages**
6. **Phase F — A11y, empty/loading/error, responsive QA**
7. **Phase G — Deploy API+web together if needed; regression pass**

Each phase: goals, files, out-of-scope, test checklist.

---

## Implementation rules (after the plan exists)

1. Keep `tokens.css` brand values; you may **extend** tokens carefully, not replace the identity.
2. Do **not** change Global 100 / India 100 ranking math or Prisma ranking pipeline.
3. Do **not** remove working charts, profiles, auth, or admin.
4. Prefer enhancing existing components over inventing parallel systems.
5. Reuse `BillboardList`, `Avatar`, `RankDeltaChip`, `FollowerCount`, feedback components.
6. Keep Spotify/YouTube outbound-only for music.
7. Keep editorial labeling.
8. Responsive desktop/tablet/mobile required for every changed surface.
9. After UI changes: verify live pages still load; charts still show ranked people; discovery still labeled editorial where appropriate.
10. Commit messages should explain *why* (clarity, hierarchy, report feel), not only *what*.

---

## Screenshot workflow (do this first)

1. Open the live site base URL.  
2. Walk the page list in order; capture desktop + mobile for each.  
3. On Charts, scroll through: title → filters → ranked list → Saved list split → pagination.  
4. On Home, note first-viewport story vs below-fold charts.  
5. On Music, confirm there is no custom player and listen links are obvious.  
6. Record empty/sparse/confusing moments with severity.  
7. Only then write the consolidated design file.  
8. Only then write the implementation plan.  
9. Only then start coding against the plan.

If the API is sleeping and data is missing, retry after wake; distinguish **data cold-start** from **design emptiness**.

---

## Acceptance criteria for your final work

- [ ] Consolidated design enhancement markdown exists and is screenshot-grounded  
- [ ] Implementation plan exists with phases and file paths  
- [ ] Brand remains black / white / green Billboard identity  
- [ ] Charts feel clearer as a ranked report  
- [ ] Home/Trending/Music feel more intentional and less sparse  
- [ ] Mobile layouts improved, not broken  
- [ ] No fabricated metrics  
- [ ] Ranking logic untouched  
- [ ] Regression: `/charts/global`, `/charts/india`, `/profiles`, `/`, `/trending`, `/music` all usable  

---

## Short starter message you can paste into Antigravity

If you want a short kickoff message that points at this file:

```text
Read docs/ANTIGRAVITY_UIUX_AUDIT_AND_ENHANCEMENT_PROMPT.md end to end.

Then:
1) Screenshot / visually audit the live site https://ig-shorts-project-aws.vercel.app across the page list and viewports in that doc.
2) Write docs/uiux_design_enhancement_from_screenshots.md (consolidated UI/UX findings + proposals).
3) Write docs/uiux_implementation_plan.md (phased plan tied to real files).
4) Implement the P0/P1 UI/UX enhancements while keeping the Billboard black/white/green brand and without changing ranking math.

Do not invent a new color system. Do not fabricate trend/audio metrics. Prefer editorial clarity and chart-report hierarchy.
```

---

## Extra local context files (optional reading)

- `DEPLOY.md` — Vercel + Render deploy model  
- `apps/web/styles/tokens.css` — brand tokens  
- `.cursor/plans/discovery_homepage_plan_288a870e.plan.md` — discovery homepage plan (already implemented)  
- `docs/discovery_homepage_enhanced_plan.md` — discovery detail  
- `docs/gptgeneratedenhancements.md` — earlier product ideation (ideas only; not a mandate to copy)  
- `UI_UX_REDESIGN_SPEC.md` — prior redesign notes (use critically; brand lock above wins)

---

**End of Antigravity brief.**
