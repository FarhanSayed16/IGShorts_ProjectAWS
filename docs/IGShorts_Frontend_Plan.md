# IGshorts — Complete Frontend Implementation Plan

**No code in this document.** This is the frontend blueprint: pages, navigation, layouts, design system, motion, components, states, and how the UI stays professional and scalable.

**Locked stack:** Next.js App Router · TypeScript · Tailwind · shadcn/ui · React Query · Recharts  
**Talks to:** Backend `/api/v1` (charts, profiles, admin)  
**v1 product:** Public ranking dashboard of famous Instagram **people**, by follower count (India + Global).

**Look target:** Billboard countdown × CoinMarketCap table × Medium typography.  
Not an Instagram clone. Not a noisy social feed.

---

## 1. Frontend responsibility

The frontend will:

1. Present ranks in a way people trust in 3 seconds (who is #1, who moved).
2. Let anyone browse India / Global charts without login.
3. Open one person and show their follower history.
4. Explain how ranking works (methodology).
5. Give admins a calm workspace to import, hide, and re-sync.
6. Stay fast, accessible, SEO-ready, and easy to add pages later.

The frontend will **not**:

- Call Instagram or Meta directly.
- Invent numbers.
- Mix “impressions” language into v1.
- Hide missing data as zero.

Every visible number comes from the API, with **as-of** time on screen.

---

## 2. Information architecture (all routes)

### 2.1 Public site

| Route | Page | v1 |
|---|---|---|
| `/` | Home / command centre | Yes |
| `/charts` | Charts index | Yes |
| `/charts/global` | Global persons leaderboard | Yes |
| `/charts/india` | India persons leaderboard | Yes |
| `/charts/:chartKey` | Future charts (brands, teams, score-v2) | Route exists, unused keys → “coming soon” |
| `/movers` | Biggest rank / follower movers | Yes |
| `/profiles` | Search / browse people | Yes |
| `/profiles/:username` | Profile detail | Yes |
| `/methodology` | How ranks work | Yes |
| `/about` | Product + team note | Yes |
| `/faq` | Short FAQ | Yes |
| `/privacy` | Privacy | Yes (needed before public) |
| `/terms` | Terms | Yes |
| `/404` | Not found | Yes |

### 2.2 Admin (separate shell)

| Route | Page | v1 |
|---|---|---|
| `/admin/login` | Admin login | Yes |
| `/admin` | Admin home / freshness | Yes |
| `/admin/profiles` | Watchlist table | Yes |
| `/admin/profiles/new` | Add one account | Yes |
| `/admin/profiles/:id` | Edit / hide / classify | Yes |
| `/admin/import` | Excel/CSV import + report | Yes |
| `/admin/sync` | Trigger sync | Yes |
| `/admin/rankings` | Trigger rebuild + last runs | Yes |
| `/admin/jobs` | Job history | Yes |
| `/admin/audit` | Change log | Yes |

### 2.3 Routes we create as empty shells (scalable, not built out)

| Route | Later feature |
|---|---|
| `/charts/hashtags` | Hashtag charts |
| `/news` | Editorial news |
| `/account` | Public user login |
| `/claim` | Creator claim profile |

Shell = same layout, “Coming in a later version” panel. No dead links in v1 nav except we simply **omit** them from the public menu.

---

## 3. Navigation and layout system

### 3.1 Two shells

**Public shell**

- Top bar (sticky, blur, 64px)
- Optional thin **status ribbon** under the bar (as-of time, algorithm name)
- Main content (max width 1200px, home can go 1280px)
- Footer

**Admin shell**

- Left sidebar (collapsible on tablet)
- Top bar with admin identity + “View public site”
- Main canvas on a slightly cooler grey

Public and admin **do not share the same header**. They share tokens, buttons, tables.

### 3.2 Public top navigation

**Left:** Wordmark `IGshorts` + small gold rank badge.

**Centre / desktop links:**

1. Home  
2. Global  
3. India  
4. Movers  
5. Profiles  
6. Methodology  

**Right:**

- Search (opens command palette or `/profiles?q=`)
- Theme toggle (light default; dark ready via tokens)
- No login button in v1 public nav

**Mobile:** Hamburger → full-screen drawer with the same links, large tap targets, search at top.

**Active state:** Gold underline + slightly heavier type. Not Instagram gradient.

### 3.3 Status ribbon (all chart pages)

One line, always:

- Chart name  
- Algorithm: `Ranked by public follower count`  
- As of: date/time  
- Source label: `Seed list` or `Meta Graph` (from API meta)  
- Last refresh freshness (`Updated 6h ago`)

If data is stale (> 36h): amber dot + “Update delayed”. Never fake freshness.

### 3.4 Footer

Four columns:

- Product (charts, movers, methodology)  
- Legal (privacy, terms)  
- About  
- Disclaimer: ranks are for **tracked watchlist**, not all of Instagram  

Bottom line: © IGshorts · `igshorts.com`

### 3.5 Admin sidebar

- Overview  
- Watchlist  
- Import  
- Sync  
- Rankings  
- Jobs  
- Audit  
- Logout  

---

## 4. Design system (professional theme)

### 4.1 Design principles

1. **Quiet chrome, loud rank.** Rank number is the hero, not decoration.  
2. **Data density without clutter.** CoinMarketCap tables, Medium spacing on reading pages.  
3. **Gold only for #1–#3 and brand moments.** Do not gold-wash the whole UI.  
4. **Motion is confirmation, not entertainment.** 150–400ms, ease-out.  
5. **Light is default.** Dark is a token switch, same layout.  
6. **One icon family, one type family.** No mixed icon packs.

### 4.2 Colour tokens (light theme — locked)

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F6F4F0` | Page background (warm paper, not stark white) |
| `surface` | `#FFFFFF` | Cards, tables, header |
| `surface-muted` | `#EEF1F6` | Zebra rows, chips, admin canvas |
| `ink` | `#0F172A` | Primary text |
| `ink-soft` | `#475569` | Secondary text |
| `line` | `#E2E8F0` | Borders, dividers |
| `navy` | `#0B1F3A` | Header, footer, admin sidebar |
| `navy-2` | `#132A4A` | Header hover / elevated navy |
| `gold` | `#C9A227` | Brand, #1, active nav |
| `gold-soft` | `#F6E7B2` | #1 row wash, medals |
| `up` | `#0F9D58` | Rank improved, +followers |
| `down` | `#C62828` | Rank dropped |
| `flat` | `#94A3B8` | No change |
| `info` | `#2563EB` | Links, focus ring |
| `warn` | `#B45309` | Stale data |
| `danger` | `#B91C1C` | Errors, destructive admin |

**Header text on navy:** `#F8FAFC`  
**Rank #2:** silver `#94A3B8` wash  
**Rank #3:** bronze `#B87333` wash  
**Rows 4+:** white / muted stripe only

**Dark theme tokens (define now, ship toggle if cheap):** canvas `#0B1220`, surface `#111827`, ink `#F8FAFC`, same gold/up/down. Do not invent a second layout.

### 4.3 Typography

| Role | Face | Notes |
|---|---|---|
| Display / ranks | **Fraunces** or **Playfair Display** | Big `#1` numerals, wordmark |
| UI / tables | **Inter** or **Plus Jakarta Sans** | All product UI |
| Mono / numbers in tables | **IBM Plex Mono** or **Tabular Inter** | Follower counts always tabular lining |

Scale (desktop):

- Rank hero: 72 / 56  
- Page title: 32  
- Section: 20  
- Body: 16 / 24  
- Table: 14 / 20  
- Caption / as-of: 12 / 16  

No more than two weights on one row: regular + semibold.

### 4.4 Iconography

**Family:** Lucide (one set).  
Stroke 1.75–2. 24px default, 16px in tables.

Required icons:

- Rank up / down / minus  
- Search, menu, close  
- Globe (global), flag/map pin (India)  
- Users, instagram (simple camera / external-link to IG)  
- Refresh, clock, shield (methodology)  
- Alert triangle (stale / error)  
- Medal / crown only on #1 (sparingly)

No 3D icons, no random SVG marketplaces.

### 4.5 Elevation and radius

- Cards: 12px radius, 1px `line`, shadow `0 8px 24px rgba(15,23,42,0.06)`  
- Buttons: 10px  
- Pills: 999px  
- Tables: 12px outer, square inner cells  
- No heavy drop shadows on the table (it should feel like a chart, not a widget pack)

### 4.6 Spacing

8-point grid. Page padding 24 desktop / 16 mobile. Section gaps 48. Table compact but not cramped (row height ~56px).

---

## 5. Motion and transitions (catalog)

All motion uses the same curve: `cubic-bezier(0.22, 1, 0.36, 1)`.

| Moment | Duration | What happens |
|---|---|---|
| Page enter | 280ms | Content fades + 8px rise |
| Route change | 200ms | Cross-fade via template; header stays |
| Nav underline | 180ms | Gold bar slides |
| Hover on row | 120ms | Surface-muted fill, no jump |
| Rank badge in | 400ms stagger 30ms | Top 10 rows cascade in on first load only |
| Number change | 400ms | Count-up / count-down of followers (only if value changed this session) |
| ↑↓ chip | 300ms | Chip pops scale 0.96→1 |
| Drawer / search | 250ms | Slide + dim overlay |
| Modal | 200ms | Scale 0.98 + fade |
| Toast | 250ms in, 4s stay | Bottom-right admin, top-centre public errors |
| Skeleton | looping 1.2s | Shimmer on table rows |
| Stale pulse | 2s | Amber dot breathe |
| Reduced motion | — | If OS prefers reduced motion: **no** cascade, **no** count-up, instant fade only |

**Do not:** parallax, particle backgrounds, Instagram-like stories rings, auto-playing video, bounce-heavy bounce.

**Do:** respect `prefers-reduced-motion` globally.

---

## 6. Page-by-page plan

---

### 6.1 Home `/`

**Job:** In 5 seconds, show who leads globally and in India, and invite the user into the full table.

**Sections (top → bottom)**

1. **Hero band (navy)**  
   - Eyebrow: `Public Instagram charts`  
   - Title: `Who leads Instagram today`  
   - Sub: ranked from our tracked famous accounts, by public followers  
   - Two CTAs: `View Global` · `View India`  
   - Tiny methodology link  

2. **Podium (Global persons)**  
   - Three large cards: #1 gold, #2 silver, #3 bronze  
   - Avatar, name, @handle, followers, Δ rank  
   - Click → profile  

3. **Twin snapshot tables**  
   - Left: Global top 10  
   - Right: India top 10  
   - Compact RankTable  
   - “See full chart →”  

4. **Movers strip**  
   - 5 biggest climbers, 5 biggest fallers (from `/movers` API)  
   - Green / red chips  

5. **Trust strip**  
   - Watchlist size, algorithm name, last updated, “Not all of Instagram”  

**Empty/loading:** Podium skeletons + 10-row skeletons.  
**SEO:** SSR the podium names and counts.

---

### 6.2 Leaderboard `/charts/global` and `/charts/india`

These two pages **share one template**. Only chart key, title, and flag/globe icon change.

**Anatomy**

1. Page header: title, short subtitle, as-of, share/copy link  
2. **Toolbar**  
   - Search in table  
   - Category filter chips (All, Actor, Musician, Athlete, Creator, Public figure…)  
   - Entity filter default **People** (locked for v1 public; admin can preview others)  
   - Density: Comfortable / Compact  
3. **Rank table** (hero of the product)  
4. Pagination or “Load more” (200 rows: paginate 50)  
5. Footnote: source + methodology link  

**Rank table columns (desktop)**

| Col | Content |
|---|---|
| Rank | Big tabular number; medal tint 1–3 |
| Δ | ↑ n / ↓ n / –  with colour |
| Account | Avatar + name + @username |
| Category | Quiet pill |
| Region | Country label |
| Followers | Right-aligned tabular, e.g. `271.2M` + exact on hover |
| Spark | Mini 7-point line if history exists |
| Open | External IG link + chevron to our profile page |

**Mobile table:** Rank + Account + Followers + Δ. Other cols hidden. Row tap → profile.

**Row states**

- Default  
- Hover  
- #1–#3 wash  
- Newly updated (soft gold flash once)  
- Unranked profiles are **not** in this table  

**Sticky first columns** on desktop: rank + account.

---

### 6.3 Charts index `/charts`

Simple directory cards: Global people, India people.  
Each card: icon, last updated, top 3 avatars stacked.  
Later this page grows new cards without nav changes.

---

### 6.4 Movers `/movers`

Two lists or a split table:

- Biggest rank gains  
- Biggest rank drops  
- Optional tab: biggest follower count gains  

Filters: Global / India.  
Empty state: “Need at least two ranking runs to show movers.”

---

### 6.5 Profiles index `/profiles`

**Job:** Find someone.

- Large search field (name or @username)  
- Category chips  
- Scope chips: All / Global chart / India chart  
- Result cards: avatar, name, @, rank badges (G #4 · IN #1), followers  
- Empty: “Not on our watchlist yet”  

---

### 6.6 Profile detail `/profiles/:username`

**Job:** One person, clearly.

**Header**

- Large avatar  
- Name, @username, verified-handle badge if we have it  
- Category · country  
- Buttons: View on Instagram (new tab) · Copy link  
- Rank badges: `Global #2` `India #1` (only charts they appear on)

**Stat row**

- Followers (big)  
- Change vs last run  
- Rank change  
- Observed at  

**Chart**

- Follower history spark/area (Recharts)  
- If only one snapshot: honest empty “History starts after the next sync”

**About this rank**

- Entity type, scopes, algorithm, source  
- Link to methodology  

**Nearby ranks**

- Two above / two below on the same chart (context)

**404:** Unknown username → not found illustration + search CTA.  
**Unranked:** Profile exists but no follower count → “Listed, not yet ranked”.

---

### 6.7 Methodology `/methodology`

Medium-like reading width (680px). Calm, high trust.

Must include:

- We rank a **watchlist**, not the whole of Instagram  
- v1 metric = public follower count  
- Null is not zero  
- Persons vs brands/teams  
- India vs Global (same person can be on both)  
- Data sources (seed now, Meta later)  
- Update cadence  
- What we will add later (one short paragraph)

No sales language. This page is why journalists/users will believe the table.

---

### 6.8 About `/about`

Short: what IGshorts is, India + Global, AWS-hosted, contact.  
Not a long company story in v1.

---

### 6.9 FAQ `/faq`

Accordion, 8–10 questions:

- Is this official Instagram? **No.**  
- Why is X missing? Watchlist.  
- Why no impressions?  
- How often does it update?  
- Why is a brand not on the people chart?  

---

### 6.10 Privacy / Terms

Standard pages, same reading layout. Footer legal links.

---

### 6.11 404 / error boundary

Navy band, gold wordmark, “This page isn’t on the chart”, button Home.  
API failure banner on chart pages: “Couldn’t load ranks” + Retry. Table not replaced by a blank white screen.

---

### 6.12 Admin pages (compact, professional, not flashy)

**Login** — centred card on navy, gold wordmark, email/password, no public nav.

**Overview** — four stat cards: profiles, ranked, last sync, last ranking. If stale, warn card.

**Watchlist** — dense table: username, name, entity, scopes, last count, last sync, active, actions.

**Add / Edit** — form: username, name, url, category, country, entity type, India/Global checkboxes, listed toggle.

**Import** — drop zone, preview counts, run import, show report (created / merged / skipped / bad usernames).

**Sync** — button “Sync now”, optional username, live job status.

**Rankings** — “Rebuild charts”, list of recent runs (status, counts).

**Jobs / Audit** — read-only tables.

Admin motion is **minimal**: toasts, table refresh, no podium animations.

---

## 7. Component inventory (shared UI)

Build these once. Pages only compose them.

### 7.1 App chrome

- PublicHeader  
- StatusRibbon  
- PublicFooter  
- MobileNavDrawer  
- AdminSidebar  
- AdminTopbar  
- CommandSearch (palette: jump to profile / chart)

### 7.2 Rank / data

- RankNumber (medal tint 1–3)  
- RankDeltaChip (↑↓–)  
- FollowerCount (compact M/K + tooltip exact)  
- RankTable  
- RankTableRow  
- PodiumCard  
- MoversStrip  
- Sparkline  
- ChartToolbar  
- CategoryPills  
- FreshnessBadge  
- SourceBadge  
- ScopeBadge (India / Global)

### 7.3 Profile

- Avatar (image + initials fallback)  
- ProfileHeader  
- StatTile  
- HistoryChart  
- NearbyRanks  

### 7.4 Feedback

- TableSkeleton  
- PodiumSkeleton  
- EmptyState  
- ErrorBanner  
- StaleBanner  
- Toast  
- ConfirmDialog (admin hide / rebuild)

### 7.5 Content

- ReadingLayout (methodology, legal)  
- FaqAccordion  
- ComingSoonPanel (stub routes)

**Rule:** A new future chart page should reuse RankTable + ChartToolbar + StatusRibbon. No new table component.

---

## 8. Frontend folder map (`apps/web`)

```text
apps/web/
  app/
    layout                     # fonts, providers, public or root
    page                       # home
    charts/
      page                     # index
      [chartKey]/page          # global | india | future
    movers/page
    profiles/page
    profiles/[username]/page
    methodology/page
    about/page
    faq/page
    privacy/page
    terms/page
    not-found
    error
    admin/
      layout                   # admin shell + auth gate
      login/page
      page                     # overview
      profiles/...
      import/page
      sync/page
      rankings/page
      jobs/page
      audit/page

  components/
    chrome/
    rank/
    profile/
    feedback/
    admin/
    content/

  features/                    # one folder per domain (hooks + view-models)
    charts/
    profiles/
    movers/
    admin/

  lib/
    api/                       # fetch wrappers for /api/v1
    format/                    # followers, dates, deltas
    seo/
    motion/                    # durations, reduced-motion helper
    auth/                      # admin token

  styles/
    tokens.css                 # colours, radius, shadow
    globals.css

  public/
    brand/                     # wordmark, og image, favicon
```

**Feature folders, not a dump of 80 files in `/components`.**  
Pages stay thin: fetch + compose.

---

## 9. Data, SEO, and state

### 9.1 Rendering

| Page | Mode |
|---|---|
| Home, charts, profile, methodology | **SSR** (SEO + first paint with real ranks) |
| Movers | SSR |
| Admin | Client, noindex |
| Search filtering on table | Client (React Query) on already-loaded page or query params |

### 9.2 API usage (frontend → backend)

| UI | Backend |
|---|---|
| Home podium + top 10 | `GET /charts/global?limit=10` and `/charts/india?limit=10` |
| Full table | `GET /charts/:key` |
| Movers | `GET /charts/:key/movers` |
| Ribbon | `GET /charts/:key/meta` |
| Profile | `GET /profiles/:username` + `/history` |
| Search | `GET /profiles?q=` |
| Admin CRUD / import / sync | `/api/v1/admin/*` |

No direct DB. No Meta keys in the browser.

### 9.3 SEO

- Title pattern: `#1 Cristiano Ronaldo · Global Instagram chart · IGshorts`  
- Meta description from top 3 names  
- Open Graph image: podium card (static template in v1 is enough)  
- Canonical per chart  
- JSON-LD ItemList on chart pages  
- `sitemap.xml` for public routes  
- `noindex` on admin  

### 9.4 Performance budget

- LCP < 2.5s on home (SSR + cached API)  
- Table 50 rows without jank  
- Images: next/image, avatar 64/96/160 sizes  
- Fonts: max two families, subset  
- No layout shift from rank medals (reserved width)

---

## 10. Responsive, a11y, i18n

**Breakpoints:** 375 · 768 · 1024 · 1280

| Viewport | Behaviour |
|---|---|
| Mobile | Stack podium, compact table, bottom-friendly nav drawer |
| Tablet | Two-column home snapshots, table with 5 cols |
| Desktop | Full table, sticky header + sticky rank/account cols |

**A11y (required in v1)**

- Contrast: ink on canvas, gold on navy checked  
- Focus ring `info` 2px  
- Rank delta not colour-only (arrow + number)  
- Table has captions / headers  
- Skip to content  
- Keyboard: search, drawer, FAQ accordion  
- Alt text: “Avatar of Virat Kohli”  
- Reduced motion respected  

**i18n:** English only in v1. All copy in a `messages/en.json` so Hindi can be added later without hunting strings.

---

## 11. Content and microcopy (tone)

- Calm, factual, slightly premium.  
- Say **“tracked accounts”**, never “every Instagram user”.  
- Say **“public follower count”**, never “impressions” in v1.  
- Errors: “We couldn’t load this chart. Try again.”  
- Unranked: “On the watchlist — waiting for a follower count.”  
- Import report: plain numbers, not celebration confetti.

---

## 12. Empty, loading, error, permission states

Every data page must specify all four:

| State | UI |
|---|---|
| Loading | Skeletons matching final layout (no spinner-only) |
| Empty chart | Illustration + “No ranked people yet” + methodology |
| Error | Banner + retry; keep chrome |
| Stale | Amber ribbon, data still shown |
| Unauthenticated admin | Redirect `/admin/login` |
| Forbidden | “You don’t have access” |

---

## 13. Scalability rules (frontend)

1. **New chart = new `chartKey` + same Leaderboard template.**  
2. **New metric = new column config**, not a new table component.  
3. **New audience (login, claim) = new route group**, same tokens.  
4. **Design tokens first** — no hex in random components after tokens exist.  
5. **Feature folders** — hashtags/news get `features/hashtags` later, not a rewrite.  
6. **No Instagram scraping UI** — “Open on Instagram” is an outbound link only.

---

## 14. Implementation order (frontend only)

| Step | Deliverable |
|---|---|
| F1 | App shell, tokens, fonts, header, footer, motion defaults |
| F2 | RankTable + RankDelta + FollowerCount (mocked JSON) |
| F3 | Home (podium + twin top 10) |
| F4 | Global + India leaderboard template |
| F5 | Profile detail + history empty/chart |
| F6 | Movers, methodology, about, FAQ, legal, 404 |
| F7 | Wire React Query to real `/api/v1` |
| F8 | Search / profiles index |
| F9 | Admin shell + login + watchlist + import + toasts |
| F10 | Sync / rankings / jobs / audit screens |
| F11 | SEO, sitemap, OG, a11y pass, reduced motion |
| F12 | Coming-soon shells for hashtags/news (hidden from nav) |

F2 can proceed **before** backend is ready, using fixture JSON that matches the chart DTO.

---

## 15. Frontend definition of done (v1)

1. Home shows Global and India podiums from real or fixture chart data.  
2. Full 200-row-capable table with rank, Δ, followers, category, pagination.  
3. Profile page with honest unranked/empty history states.  
4. Methodology published and linked from ribbon + footer.  
5. Light professional theme applied everywhere (navy / paper / gold / green-red deltas).  
6. Motion catalog implemented and disabled when reduced-motion is on.  
7. Mobile + desktop both usable; table not a horizontal mess without a plan.  
8. Admin can import and hide without using public nav.  
9. No fake zeros, no impressions copy, no scraper buttons.  
10. Lighthouse a11y + SEO baseline acceptable on Home and one chart page.

---

## 16. Out of scope for frontend v1

- Native apps  
- Public user accounts / likes / comments  
- Live IG embeds feed  
- Dark theme polish beyond tokens (toggle optional)  
- Marketing 3D hero  
- Hashtag / news pages (shells only)  
- Multi-language UI  

---

**This frontend plan pairs with** `docs/IGShorts_Backend_Plan.md`.  
**Next:** Masterplan — 10–12 phases that sequence frontend + backend into one build order.
