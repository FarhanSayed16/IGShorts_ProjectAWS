# IGshorts — Execution Checklist

Use with [`IGShorts_Master_Plan.md`](IGShorts_Master_Plan.md).  
Tick items as they are **done and verified**, not as soon as a file exists.

Legend: `[ ]` pending · `[x]` done · `N/A` skipped with written reason.

---

## Phase 1 — Project foundation

### 1.1 Repository
- [ ] Monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/db`, `infra`, `docs`
- [ ] pnpm workspaces + Node 22
- [ ] TypeScript strict on web, api, shared
- [ ] `.env.example` for web and api
- [ ] README: local run steps
- [ ] `.gitignore` covers node_modules, `.env`, dist

### 1.2 Conventions
- [ ] ESLint + Prettier
- [ ] API will use `/api/v1` prefix
- [ ] Shared DTOs package created (even if empty types)

### 1.3 Product constants
- [ ] Chart keys: `global_persons`, `india_persons`
- [ ] Algorithm name: `followers_v1`
- [ ] Entity types + scopes defined once

### 1.4 Local run
- [ ] Docker Compose Postgres 16
- [ ] API boots
- [ ] Next.js empty app boots

**Phase 1 exit**
- [ ] Fresh clone runs API health + web without secrets in git

---

## Phase 2 — Data core and API skeleton

### 2.1 Schema
- [ ] `data_sources`
- [ ] `creator_profiles`
- [ ] `profile_scopes`
- [ ] `metric_snapshots` (no update-in-place)
- [ ] `ranking_runs` + `ranking_entries`
- [ ] `admin_users`
- [ ] `audit_logs`
- [ ] `job_runs`
- [ ] Username unique index
- [ ] First migration applies

### 2.2 Module folders
- [ ] config, common, database, health
- [ ] auth, profiles, metrics, ingestion, ranking, charts, admin, jobs, storage, audit
- [ ] stubs: scoring, hashtags, news, regions

### 2.3 Health & errors
- [ ] `GET /api/v1/health`
- [ ] `GET /api/v1/health/ready` (DB)
- [ ] Standard error JSON
- [ ] CORS for local web

**Phase 2 exit**
- [ ] Ready fails when DB down; all module folders exist

---

## Phase 3 — Watchlist, metrics, seed import

### 3.1 Profiles
- [ ] Username normalized (lowercase, no `@`)
- [ ] `GET /api/v1/profiles`
- [ ] `GET /api/v1/profiles/:username`
- [ ] Create / update / hide (admin paths)

### 3.2 Metrics
- [ ] Append-only snapshots
- [ ] Latest follower helper
- [ ] History helper
- [ ] Null stored; never written as 0

### 3.3 Seed adapter
- [ ] India sheet import
- [ ] Global sheet import
- [ ] Millions → integer
- [ ] Blank count → null
- [ ] Same username merged + both scopes
- [ ] Category → entity_type
- [ ] Source `seed_xlsx`
- [ ] Import report (created / merged / skipped / missing / bad)

### 3.4 Seed QA
- [ ] `@m cstan` fixed or flagged
- [ ] Mané / Agüero encoding
- [ ] Weak/legacy rows flagged
- [ ] Brands/teams not marked person

### 3.5 Storage
- [ ] Import file path interface (local now)

**Phase 3 exit**
- [ ] 400-row watchlist imported without duplicate people
- [ ] Re-import merges

---

## Phase 4 — Ranking and public chart APIs

### 4.1 Engine
- [ ] Persons only on default charts
- [ ] Null followers excluded
- [ ] Tie-break documented (username)
- [ ] Deltas vs previous successful run

### 4.2 Persist
- [ ] ranking_runs written
- [ ] ranking_entries written
- [ ] algorithm_version `followers_v1`

### 4.3 APIs
- [ ] `GET /api/v1/charts`
- [ ] `GET /api/v1/charts/global_persons`
- [ ] `GET /api/v1/charts/india_persons`
- [ ] movers endpoint
- [ ] meta endpoint (as_of, source, freshness)
- [ ] profile history endpoint
- [ ] Query: limit, offset, category, q

### 4.4 Tests
- [ ] Ranking unit tests (sort, ties, null, hidden)
- [ ] Seed mapping unit tests

**Phase 4 exit**
- [ ] Both people charts return computed ranks
- [ ] Brands absent from people charts
- [ ] Second run can show ↑↓

---

## Phase 5 — Frontend foundation

### 5.1 Tokens
- [ ] Canvas / navy / gold / up / down
- [ ] Fonts loaded
- [ ] Lucide only
- [ ] Reduced-motion helper

### 5.2 Chrome
- [ ] Public header + mobile drawer
- [ ] Nav links: Home, Global, India, Movers, Profiles, Methodology
- [ ] Footer + watchlist disclaimer
- [ ] Status ribbon slot

### 5.3 Components on fixtures
- [ ] RankNumber + medals 1–3
- [ ] RankDeltaChip
- [ ] FollowerCount
- [ ] RankTable
- [ ] PodiumCard
- [ ] Skeletons / empty / error

### 5.4 Motion
- [ ] Page fade
- [ ] Hover
- [ ] Stagger off when reduced-motion

**Phase 5 exit**
- [ ] Mock home looks on-theme on mobile and desktop

---

## Phase 6 — Public dashboard wired

### 6.1 Client
- [ ] API client to Nest `/api/v1`
- [ ] Error retry banner

### 6.2 Home
- [ ] Hero + CTAs
- [ ] Global podium
- [ ] Twin top 10
- [ ] Trust strip (algorithm + as-of)
- [ ] Movers strip or honest empty

### 6.3 Charts
- [ ] `/charts/global` template
- [ ] `/charts/india` same template
- [ ] Search + category pills
- [ ] Pagination 50
- [ ] Status ribbon from meta
- [ ] Stale state
- [ ] `/charts` index cards

**Phase 6 exit**
- [ ] Live API ranks on home + both tables
- [ ] API down ≠ blank white page
- [ ] No “impressions” copy

---

## Phase 7 — Depth and trust

### 7.1 Profiles
- [ ] `/profiles` search
- [ ] `/profiles/:username` stats + IG outbound
- [ ] History chart or honest empty
- [ ] Nearby ranks
- [ ] Unranked state
- [ ] Unknown username 404

### 7.2 Movers
- [ ] `/movers` gains/drops
- [ ] Empty copy if only one run

### 7.3 Pages
- [ ] Methodology (all required points)
- [ ] About
- [ ] FAQ
- [ ] Privacy
- [ ] Terms
- [ ] 404
- [ ] Error boundary

### 7.4 A11y
- [ ] Focus ring
- [ ] Skip link
- [ ] Δ not colour-only
- [ ] Copy in `messages/en.json`

**Phase 7 exit**
- [ ] Methodology linked from ribbon and footer
- [ ] Keyboard nav works

---

## Phase 8 — Admin

### 8.1 Auth
- [ ] Admin login
- [ ] JWT (or equivalent) on all admin APIs
- [ ] `/admin/login` noindex
- [ ] Unknown user redirected

### 8.2 Shell
- [ ] Sidebar: Overview, Watchlist, Import, Sync, Rankings, Jobs, Audit
- [ ] Toasts

### 8.3 Screens
- [ ] Overview stats + stale warning
- [ ] Watchlist table
- [ ] Add profile
- [ ] Edit / hide / entity / scopes
- [ ] Import + report UI
- [ ] Sync trigger
- [ ] Rebuild rankings
- [ ] Jobs list
- [ ] Audit list

### 8.4 Audit events
- [ ] Profile write
- [ ] Import
- [ ] Ranking run
- [ ] Login

**Phase 8 exit**
- [ ] Hide + rebuild removes person from public chart
- [ ] Public nav has no admin entry

---

## Phase 9 — Automation and stubs

### 9.1 Jobs
- [ ] Sync → rebuild sequence
- [ ] job_runs logged
- [ ] One username fail ≠ full fail
- [ ] Cron or internal trigger documented

### 9.2 Meta stub
- [ ] Adapter folder + registry
- [ ] `PROVIDER=seed` default
- [ ] No live Meta calls in v1

### 9.3 Stubs
- [ ] scoring / hashtags / news / regions boot
- [ ] Frontend coming-soon routes hidden from nav

### 9.4 Editorial metric
- [ ] Admin path audited (optional use)

**Phase 9 exit**
- [ ] Daily pipeline can run without UI clicks
- [ ] App boots with stubs

---

## Phase 10 — AWS, CI/CD, security, SEO

### 10.1 AWS
- [ ] RDS Postgres `ap-south-1`
- [ ] API hosted
- [ ] Web hosted + HTTPS
- [ ] S3 imports
- [ ] Secrets Manager
- [ ] WAF / SG baseline

### 10.2 CI/CD
- [ ] Lint, typecheck, tests
- [ ] Staging migrate + deploy
- [ ] Smoke: health + global chart

### 10.3 Security
- [ ] Rate limit public GET
- [ ] No secrets in client
- [ ] Backup + one restore test

### 10.4 Observability
- [ ] CloudWatch logs
- [ ] Alarm: 5xx
- [ ] Alarm: failed job
- [ ] Alarm: ranking stale > 36h

### 10.5 SEO
- [ ] Sitemap
- [ ] robots noindex admin
- [ ] OG titles
- [ ] Chart JSON-LD (if planned in frontend)

**Phase 10 exit**
- [ ] Staging public + admin URLs work
- [ ] Smoke green

---

## Phase 11 — Quality and demo

### 11.1 Data
- [ ] Bad usernames resolved
- [ ] People chart is people
- [ ] Ranked vs pending counts known
- [ ] Weak/legacy rows decided

### 11.2 QA paths
- [ ] Home → chart → profile → Instagram
- [ ] India filters
- [ ] Movers after two runs
- [ ] Admin hide reflected publicly
- [ ] Mobile + desktop
- [ ] Error + stale banners

### 11.3 Copy
- [ ] Watchlist language
- [ ] No impressions
- [ ] As-of visible

### 11.4 Demo
- [ ] Staging URL
- [ ] 5-minute script
- [ ] Known limits written

**Phase 11 exit**
- [ ] Sir can use staging unassisted
- [ ] Phases 1–11 ticked
- [ ] v1 gaps list written

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

## v1 done when

- [ ] Global + India people leaderboards live
- [ ] Computed follower ranks + history
- [ ] Null ≠ 0
- [ ] Admin operate without deploy
- [ ] Jobs path exists
- [ ] Meta stub off
- [ ] AWS staging (prod if Phase 12)
- [ ] No scrapers / no secrets in git
- [ ] Theme + methodology live
- [ ] Demo to sir complete

---

**Current phase:** 1  
**Last updated:** 2026-10-20
