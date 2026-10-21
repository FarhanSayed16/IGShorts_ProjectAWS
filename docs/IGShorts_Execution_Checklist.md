# IGshorts — Execution Checklist

Use with [`IGShorts_Master_Plan.md`](IGShorts_Master_Plan.md).  
Tick items as they are **done and verified**, not as soon as a file exists.

Legend: `[ ]` pending · `[x]` done · `N/A` skipped with written reason.

---

## Phase 1 — Project foundation

### 1.1 Repository
- [x] Monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/db`, `infra`, `docs`
- [x] pnpm workspaces + Node 22 (tested with Node v24)
- [x] TypeScript strict on web, api, shared, db
- [x] `.env.example` for web and api
- [x] README: local run steps
- [x] `.gitignore` covers node_modules, `.env`, dist

### 1.2 Conventions
- [x] ESLint + Prettier
- [x] API will use `/api/v1` prefix
- [x] Shared DTOs package created (`@igshorts/shared`)

### 1.3 Product constants
- [x] Chart keys: `global_persons`, `india_persons`
- [x] Algorithm name: `followers_v1`
- [x] Entity types + scopes defined once

### 1.4 Local run
- [x] Docker Compose Postgres 16
- [x] API boots (tested /api/v1/health)
- [x] Next.js empty app boots (verified next build)

**Phase 1 exit**
- [x] Fresh clone runs API health + web without secrets in git

---

## Phase 2 — Data core and API skeleton

### 2.1 Schema
- [x] `data_sources`
- [x] `creator_profiles`
- [x] `profile_scopes`
- [x] `metric_snapshots` (no update-in-place)
- [x] `ranking_runs` + `ranking_entries`
- [x] `admin_users`
- [x] `audit_logs`
- [x] `job_runs`
- [x] Username unique index
- [x] First migration generated and locked (`20261020000000_init`)

### 2.2 Module folders
- [x] config, common, database, health
- [x] auth, profiles, metrics, ingestion, ranking, charts, admin, jobs, storage, audit
- [x] stubs: scoring, hashtags, news, regions

### 2.3 Health & errors
- [x] `GET /api/v1/health`
- [x] `GET /api/v1/health/ready` (DB)
- [x] Standard error JSON (`ApiErrorResponse`)
- [x] CORS for local web

**Phase 2 exit**
- [x] Ready fails when DB down; all module folders exist

---

## Phase 3 — Watchlist, metrics, seed import

### 3.1 Profiles
- [x] Username normalized (lowercase, no `@`)
- [x] `GET /api/v1/profiles`
- [x] `GET /api/v1/profiles/:username`
- [x] Create / update / hide (admin paths)

### 3.2 Metrics
- [x] Append-only snapshots
- [x] Latest follower helper
- [x] History helper
- [x] Null stored; never written as 0

### 3.3 Seed adapter
- [x] India sheet import
- [x] Global sheet import
- [x] Millions → integer
- [x] Blank count → null
- [x] Same username merged + both scopes
- [x] Category → entity_type
- [x] Source `seed_xlsx`
- [x] Import report (created / merged / skipped / missing / bad)

### 3.4 Seed QA
- [x] `@m cstan` fixed or flagged (`@m cstan` -> `mcstan`)
- [x] Mané / Agüero encoding
- [x] Weak/legacy rows flagged
- [x] Brands/teams not marked person (classified as `brand`, `team`, `platform`)

### 3.5 Storage
- [x] Import file path interface (local disk; S3 copy when `S3_BUCKET_IMPORTS` is set)

**Phase 3 exit**
- [x] 400-row watchlist imported without duplicate people (332 unique profiles, 68 merged into both scopes)
- [x] Re-import merges (upsert logic prevents duplicate people rows)

---

## Phase 4 — Ranking and public chart APIs

### 4.1 Engine
- [x] Persons only on default charts
- [x] Null followers excluded
- [x] Tie-break documented (alphabetical username)
- [x] Deltas vs previous successful run

### 4.2 Persist
- [x] ranking_runs written
- [x] ranking_entries written
- [x] algorithm_version `followers_v1`

### 4.3 APIs
- [x] `GET /api/v1/charts`
- [x] `GET /api/v1/charts/global_persons`
- [x] `GET /api/v1/charts/india_persons`
- [x] movers endpoint (`/charts/:chartKey/movers`)
- [x] meta endpoint (`/charts/:chartKey/meta` - as_of, source, freshness)
- [x] profile history endpoint (`/profiles/:username/history`)
- [x] Query: limit, offset, category, q

### 4.4 Tests
- [x] Ranking unit tests (sort, ties, null, hidden, deltas)
- [x] Seed mapping unit tests
- [x] Chart-flow smokes (allow-list, hidden history 404, hide → rebuild omits row)

**Phase 4 exit**
- [x] Both people charts return computed ranks
- [x] Brands absent from people charts
- [x] Second run can show ↑↓

---

## Phase 5 — Frontend foundation

### 5.1 Tokens
- [x] Canvas / navy / gold / up / down
- [x] Fonts loaded
- [x] Lucide only
- [x] Reduced-motion helper

### 5.2 Chrome
- [x] Public header + mobile drawer
- [x] Nav links: Home, Global, India, Movers, Profiles, Methodology
- [x] Footer + watchlist disclaimer
- [x] Status ribbon slot

### 5.3 Components on fixtures
- [x] RankNumber + medals 1–3
- [x] RankDeltaChip
- [x] FollowerCount
- [x] RankTable
- [x] PodiumCard
- [x] Skeletons / empty / error

### 5.4 Motion
- [x] Page fade
- [x] Hover
- [x] Stagger off when reduced-motion

**Phase 5 exit**
- [x] Mock home looks on-theme on mobile and desktop


---

## Phase 6 — Public dashboard wired

### 6.1 Client
- [x] API client to Nest `/api/v1`
- [x] Error retry banner

### 6.2 Home
- [x] Hero + CTAs
- [x] Global podium
- [x] Twin top 10
- [x] Trust strip (algorithm + as-of)
- [x] Movers strip or honest empty

### 6.3 Charts
- [x] `/charts/global` template
- [x] `/charts/india` same template
- [x] Search + category pills
- [x] Pagination 50
- [x] Status ribbon from meta
- [x] Stale state
- [x] `/charts` index cards

**Phase 6 exit**
- [x] Live API ranks on home + both tables
- [x] API down ≠ blank white page
- [x] No “impressions” copy


---

## Phase 7 — Depth and trust

### 7.1 Profiles
- [x] `/profiles` search
- [x] `/profiles/:username` stats + IG outbound
- [x] History chart or honest empty
- [x] Nearby ranks
- [x] Unranked state
- [x] Unknown username 404

### 7.2 Movers
- [x] `/movers` gains/drops
- [x] Empty copy if only one run

### 7.3 Pages
- [x] Methodology (all required points)
- [x] About
- [x] FAQ
- [x] Privacy
- [x] Terms
- [x] 404
- [x] Error boundary

### 7.4 A11y
- [x] Focus ring
- [x] Skip link
- [x] Δ not colour-only
- [x] Copy in `messages/en.json`

**Phase 7 exit**
- [x] Methodology linked from ribbon and footer
- [x] Keyboard nav works


---

## Phase 8 — Admin

### 8.1 Auth
- [x] Admin login
- [x] JWT (or equivalent) on all admin APIs
- [x] `/admin/login` noindex
- [x] Unknown user redirected

### 8.2 Shell
- [x] Sidebar: Overview, Watchlist, Import, Sync, Rankings, Jobs, Audit
- [x] Toasts

### 8.3 Screens
- [x] Overview stats + stale warning
- [x] Watchlist table
- [x] Add profile
- [x] Edit / hide / entity / scopes
- [x] Import + report UI
- [x] Sync trigger
- [x] Rebuild rankings
- [x] Jobs list
- [x] Audit list

### 8.4 Audit events
- [x] Profile write
- [x] Import
- [x] Ranking run
- [x] Login

**Phase 8 exit**
- [x] Hide + rebuild removes person from public chart
- [x] Public nav has no admin entry


---

## Phase 9 — Automation and stubs

### 9.1 Jobs
- [x] Sync → rebuild sequence
- [x] job_runs logged
- [x] One username fail ≠ full fail
- [x] Cron or internal trigger documented

### 9.2 Meta stub
- [x] Adapter folder + registry
- [x] `PROVIDER=seed` default
- [x] No live Meta calls in v1

### 9.3 Stubs
- [x] scoring / hashtags / news / regions boot
- [x] Frontend coming-soon routes hidden from nav

### 9.4 Editorial metric
- [x] Admin path audited (optional use)

**Phase 9 exit**
- [x] Daily pipeline can run without UI clicks
- [x] App boots with stubs


---

## Phase 10 — AWS, CI/CD, security, SEO

### 10.1 AWS
- [ ] RDS Postgres `ap-south-1`
- [ ] API hosted
- [ ] Web hosted + HTTPS (ACM certificate ARN via CDK context)
- [x] S3 imports (CDK defined, not deployed)
- [x] Secrets Manager (CDK defined, generated secrets)
- [x] WAF / SG baseline (CDK defined)

### 10.2 CI/CD
- [x] Lint, typecheck, tests (local / GitHub Actions)
- [ ] Staging migrate + deploy
- [ ] Smoke: health + global chart on a live URL

### 10.3 Security
- [x] Rate limit public GET
- [x] No secrets in client
- [x] Backup restore procedure written (`docs/IGShorts_Ops_Runbook.md`)
- [ ] Backup + one restore test on a live RDS snapshot

### 10.4 Observability
- [x] CloudWatch logs (CDK defined)
- [x] Alarm: 5xx (CDK defined)
- [x] Alarm: failed job (CDK defined)
- [x] Alarm: ranking stale > 36h (CDK defined)

### 10.5 SEO
- [x] Sitemap
- [x] robots noindex admin
- [x] OG titles
- [x] Chart JSON-LD (if planned in frontend)

**Phase 10 exit**
- [ ] Staging public + admin URLs work
- [ ] Smoke green

---

## Phase 11 — Quality and demo

### 11.1 Data
- [x] Bad usernames skipped on import
- [x] People chart is people
- [x] Ranked vs pending counts known
- [x] Weak/legacy rows decided (hide unofficial/memorial: Ranbir fan, Danish Zehen, Avicii)

### 11.2 QA paths
- [ ] Home → chart → profile → Instagram (on staging)
- [ ] India filters
- [ ] Movers after two runs
- [ ] Admin hide reflected publicly
- [ ] Mobile + desktop
- [x] Error + stale banners (code)

### 11.3 Copy
- [x] Watchlist language
- [x] No impressions
- [x] As-of visible

### 11.4 Demo
- [ ] Staging URL
- [x] 5-minute script
- [x] Known limits written

**Phase 11 exit**
- [ ] Sir can use staging unassisted
- [ ] Phases 1–11 ticked
- [x] v1 gaps list written (`docs/IGShorts_Phase_1_to_12_Audit.md`)

---

## Phase 12 — Production

### 12.1 Prod
- [ ] Domain / HTTPS
- [ ] Prod env + backups
- [ ] Admin users
- [ ] Provider still seed until Meta approval

### 12.2 Launch
- [ ] Privacy + terms live
- [ ] Prod smoke
- [ ] First prod ranking run
- [ ] Watch 24–48h

### 12.3 Handover
- [ ] Runbook (import, sync, rebuild, hide, job fail)
- [ ] Diagrams + this checklist archived as v1

### 12.4 v2 backlog (listed, not built)
- [ ] Meta live followers
- [ ] Brands/teams charts
- [ ] Claim / Insights
- [ ] Hashtags / news / regions
- [ ] Scoring v2
- [ ] Public accounts

**Phase 12 exit**
- [ ] Prod charts live
- [ ] Runbook with team

---

## UI/UX Redesign Implementation (Post-Spec Execution)

### Redesign Phase 1: Design System Foundation
- [x] 1.1 Replace and expand CSS tokens in `apps/web/styles/tokens.css`
- [x] 1.2 Switch fonts to Outfit, Inter, JetBrains Mono in `apps/web/app/layout.tsx`
- [x] 1.3 Add shadow scale, radius scale, and spacing tokens in `tokens.css`
- [x] 1.4 Update dark mode variable mappings in `tokens.css` & `globals.css`
- [x] 1.5 Add gradient definitions, motion keyframes, and reusable component classes in `tokens.css` & `globals.css`
- [x] 1.6 Verify `next build` passes cleanly with Phase 1

### Redesign Phase 2: Core Components Redesign
- [x] 2.1 PublicHeader: observatory dark bar, trophy gold glow, animated active indicator, command palette shortcut
- [x] 2.2 PublicFooter: deep brand theme, gold headings, link hovers, bottom copyright bar
- [x] 2.3 StatusRibbon: compact 32px height, gradient ribbon background, pulsing freshness dot
- [x] 2.4 RankTable: rank number styling (#1 gold, #2 silver, #3 bronze), alternating zebra stripes, category badges
- [x] 2.5 RankDeltaChip: pill chip with status background, border, arrow icon, tabular nums
- [x] 2.6 PodiumCard: elevated #1 center card (-32px), gold glow, avatar rank ring, follower stat typography
- [x] 2.7 Avatar: rank-coloured ring borders (#1 gold, #2 silver, #3 bronze) and size variants
- [x] 2.8 Sparkline: SVG mini area chart with gradient fill and trend stroke
- [x] 2.9 Verify `next build` passes cleanly with Phase 2

### Redesign Phase 3: Page Redesigns
- [x] 3.1 Home (`/`): multi-tone dark gradient hero, gold headline highlight, podium stagger entrance, movers ticker strip, trust pillars
- [x] 3.2 Charts (`/charts/global` & `/charts/india`): segmented control scope switcher, sticky pagination, search input with ⌘K badge
- [x] 3.3 Movers (`/movers`): Climbers / Slips columns with coloured accent borders, enhanced empty state
- [x] 3.4 Profiles (`/profiles`): 3-column card grid with category accents, search and sort toolbar
- [x] 3.5 Profile Detail (`/profiles/[username]`): Hero banner, stat card counters, nearby ranks, history chart
- [x] 3.6 Methodology (`/methodology`): Editorial layout, numbered sections, callouts, trust signals
- [x] 3.7 FAQ (`/faq`): Interactive accordion components with animated chevron indicators
- [x] 3.8 About & Legal (`/about`, `/privacy`, `/terms`): Editorial typography, narrow container
- [x] 3.9 Verify `next build` passes cleanly with Phase 3

### Redesign Phase 4: Admin & Polish
- [x] 4.1 Admin Shell & Pages: Sidebar navigation layout, stat cards with status accents, action cards with feedback
- [x] 4.2 Error & 404: Branded 404 and Error pages
- [x] 4.3 Accessibility: WCAG 2.1 AA focus rings, contrast checks, keyboard navigation
- [x] 4.4 Responsive: Mobile audit across all 6 breakpoints (xs, sm, md, lg, xl, 2xl)
- [x] 4.5 Verify full build, test, lint, format passes with 0 errors

---

## v1 done when

- [x] Global + India people leaderboards live
- [x] Computed follower ranks + history
- [x] Null ≠ 0
- [x] Admin operate without deploy
- [x] Jobs path exists
- [x] Meta stub off
- [ ] AWS staging (prod if Phase 12)
- [x] No scrapers / no secrets in git
- [x] Theme + methodology live
- [ ] Demo to sir complete

---

**Current phase:** UI/UX Redesign Completed (Observatory Theme Active)  
**Last updated:** 2026-10-20

