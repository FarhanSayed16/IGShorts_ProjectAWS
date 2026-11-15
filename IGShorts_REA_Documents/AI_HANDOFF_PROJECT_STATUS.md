# IGshorts — AI Handoff / Current Project Status

> **Purpose:** One concise context file for another AI or engineer.  
> **Repo:** `https://github.com/FarhanSayed16/IGShorts_ProjectAWS`  
> **Branch:** `main`  
> **As of:** 2026-11-15 · HEAD around `2066baf`  
> **Owner product framing:** Public Instagram **people charts** on a **curated watchlist** — not “all of Instagram,” not AnonyIG-style anonymous lookup.

---

## 1. What this product is

**IGshorts** = Billboard × Bloomberg-style observatory for **famous Instagram people** on a tracked watchlist.

- Ranks by **public follower count** (honest snapshots).
- Scopes: **Global** and **India** person boards.
- Competition ranking **1224** (ties share rank; next skips).
- Missing metrics stay **`null`** — never invent `0`, impressions, “who viewed you,” or fake live counts.
- Brand UI: black / white / mint-green editorial (Billboard-like). Dark + light theme via `data-theme`.

**Explicitly out of scope (do not build):**  
Reverse-engineering AnonyIG / unofficial Instagram scrape / “search any IG user on Earth” outside Meta-allowed + your own DB. Search = **your watchlist/DB**, expandable later via admin import, claims, or official Meta APIs.

---

## 2. Monorepo layout

```text
IGShorts_ProjectAWS/
├── apps/web          # Next.js 15 App Router · React 19 · Tailwind 4 · port 3000
├── apps/api          # NestJS 11 + Fastify · Prisma · port 4000 · /api/v1
├── packages/db       # Prisma schema + migrations (PostgreSQL)
├── packages/shared   # DTOs, API_PATHS, chart keys, discovery types
├── infra             # AWS CDK (optional; current deploy is Vercel + Render + Supabase)
├── docs/             # Plans & runbooks (many; see §8)
├── RUN.md            # Local run commands
├── DEPLOY.md         # Vercel web + Render API + Supabase DB
└── docker-compose.yml # Local Postgres
```

**Package manager:** `pnpm@11.17.0` · **Node:** `>=22`  
**Workspace scripts:** root `package.json` (`pnpm dev`, `db:migrate`, `seed:import`, `job:pipeline`, …).

---

## 3. Stack & deploy

| Layer | Tech | Hosting (intended) |
|-------|------|--------------------|
| Web | Next 15.5.x | **Vercel** (root filter `@igshorts/web`) |
| API | Nest + Fastify | **Render** Docker (repo-root `Dockerfile`) |
| DB | PostgreSQL 16 + Prisma | **Supabase** DB name `igshorts` (local: Docker) |
| Shared types | `@igshorts/shared` | Built before web/api |

**Local:** `docker compose up -d postgres` → `pnpm dev` → web `http://localhost:3000`, API `http://localhost:4000/api/v1/health`.  
**Admin local:** `admin@localhost` / `change-me-now` (see `RUN.md`).  
**Env:** copy `apps/api/.env.example`, `apps/web/.env.local` from examples; cloud secrets in gitignored `deploy.env`.

**Recent deploy fix:** fonts are **self-hosted** (`apps/web/app/fonts/*` + `next/font/local`) because `next/font/google` flakes on Vercel (Next.js #99114). Commit `2066baf`.

---

## 4. Data model (Prisma — `packages/db/prisma/schema.prisma`)

Core ranking:

| Model | Role |
|-------|------|
| `CreatorProfile` | Watchlist person (`igUsername` unique, display name, avatar, category, …) |
| `ProfileScope` | `global` / `india` membership |
| `MetricSnapshot` | Append-only follower observations (`metricValue` **nullable BigInt**) |
| `DataSource` | Provenance (`seed_xlsx`, `meta_graph`, `editorial`, …) |
| `RankingRun` / `RankingEntry` | Chart rebuild outputs |

Discovery / product extras:

| Model | Role |
|-------|------|
| `TrendTopic` | Editorial/discovery trends |
| `MusicTrack` | Music cards / collections |
| `DailyPulseItem` | Daily pulse feed |
| `Member` / `ProfileTrack` | Member signup + tracked profiles |
| `JobRun` / `SystemSchedule` / `ProfileRefreshState` | Jobs & refresh |
| `AnalyticsEvent` | Interaction events (consent-aware planned) |
| `ClaimRequest` | Profile claim requests |
| `AdminUser` / `AuditLog` | Admin + audit |

**Chart keys** (`packages/shared`): `global_persons`, `india_persons`.

---

## 5. Backend surface (Nest, prefix `/api/v1`)

Implemented controllers (high level):

- **Charts** — list boards, entries, meta  
- **profiles** — list/search watchlist, detail, history  
- **movers / analytics groups** — velocity-style views  
- **admin** — overview, watchlist CRUD, import, sync, Wikipedia enrich, ranking rebuild, jobs, audit, schedules, members, analytics summary  
- **members** — signup/login/me, track profiles  
- **trends / music / pulse / visit-diff** — discovery feeds  
- **claim** — claim request POST  
- **analytics** — event ingest  
- **jobs** — admin + internal cron hooks  
- **health** — liveness/readiness  
- Shell/placeholder: news, hashtags, regions, scoring  

Data pipeline scripts (API package): `seed:import`, `job:pipeline`, `job:discovery`, `seed:discovery`, `enrich:portraits`, etc.

**Honesty rule for music/trends:** prefer stored/editorial/licensed data; do not invent Spotify rip catalogs or fake IG engagement.

---

## 6. Frontend routes (`apps/web`)

**Public / product**

| Route | Notes |
|-------|--------|
| `/` | Discovery homepage (ticker, hero, charts teaser, pulse, music, pyramid, fallbacks if API down) |
| `/charts`, `/charts/global`, `/charts/india` | Leaderboards |
| `/movers` | Weekly movers |
| `/profiles`, `/profiles/[username]` | Watchlist + profile |
| `/trending`, `/trending/[category]` | Trends explorer |
| `/music` | Music discovery + player dock |
| `/methodology`, `/about`, `/scoring`, `/regions` | Explainer / shells |
| `/account` | Member signup/track |
| `/claim` | Claim flow (schema exists; product still gated) |
| `/help`, `/support`, `/faq`, `/privacy`, `/terms`, `/cookies` | Legal/support UX |
| `/maintenance` | Maintenance state |
| `/news`, `/hashtags` | Soft / thin |

**Admin** (`/admin/*`): login, overview, watchlist, import, sync, rankings, jobs, schedules, content, members, analytics, audit, settings.

**Chrome:** theme toggle, command palette, audio dock, page-view / route beacons, follower pyramid (locale-safe number formatting important — avoid hydration locale mismatch).

---

## 7. Locked product rules (for any new work)

1. Charts = **curated watchlist ranks**, never marketed as full Instagram world rank.  
2. Never invent impressions, anonymous story views, or fabricated live metrics.  
3. `null` follower ≠ `0`.  
4. Ranking math = competition **1224**.  
5. UI brand: black / white / green; avoid purple-AI defaults.  
6. No AnonyIG / unofficial Instagram RE or scrape integration.  
7. Expand coverage via: admin import, seed lists, Meta Business Discovery (when tokens exist), claim requests — not anonymous scrapers.  
8. Number formatting must be **locale-stable** for SSR (e.g. fixed `en-US` or client-only format) to avoid hydration errors.

---

## 8. Documentation map (what exists vs what to open)

There are **~40+** markdown files. Prefer these; treat older plans as background.

### Start here

| File | Use |
|------|-----|
| **`docs/AI_HANDOFF_PROJECT_STATUS.md`** | **This file** — current status handoff |
| `README.md` | Product overview + architecture marketing |
| `RUN.md` | Local commands |
| `DEPLOY.md` | Vercel + Render + Supabase |
| `docs/IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md` | Phased build order 0–10 (source of unfinished work) |

### Active planning / deltas

| File | Use |
|------|-----|
| `docs/IGSHORTS_MASTER_PLAN_DELTA_SUGGESTIONS.md` | Review deltas |
| `docs/ADMIN_CONTROL_AND_INTERACTION_ANALYTICS_PLAN.md` | Admin OCC + analytics |
| `docs/LEGAL_SUPPORT_AND_UX_STATES_PLAN.md` | Legal, help, UX states |
| `docs/uiux_implementation_plan.md` | UI implementation |
| `docs/discovery_homepage_enhanced_plan.md` | Homepage discovery |
| `.cursor/plans/system_master_plan_0c1aff78.plan.md` | Cursor plan artifact |
| `.cursor/plans/discovery_homepage_plan_288a870e.plan.md` | Discovery plan artifact |

### Data engine / lookup (honest scope)

| File | Use |
|------|-----|
| `docs/IGshorts_Data_Engine_Final_Blueprint.md` | Refresh / pipeline blueprint |
| `docs/IGshorts_Refresh_Engine_Design.md` | Tiered refresh |
| `docs/IGshorts_Search_What_Is_Possible.md` | **What search can legally/product-wise be** |
| `docs/IGShorts_Local_Creator_Lookup.md` | Local/watchlist lookup framing |
| `docs/IGShorts_Lookup_Explained.md` | Lookup explanation |
| `docs/IGshorts_Final_Decision.md` | Locked decisions |
| `docs/IGshorts_Provider_Benchmark.md` | Provider comparison |

### Older / still useful reference

| File | Use |
|------|-----|
| `docs/IGShorts_Master_Plan.md`, `End_to_End_Plan`, `Backend_Plan`, `Frontend_Plan`, `Tech_Stack_Plan` | Original planning |
| `docs/IGShorts_MVP_Follower_Dashboard.md` | MVP framing |
| `docs/IGShorts_Ops_Runbook.md` | Ops |
| `docs/IGShorts_Execution_Checklist.md`, `Phase_1_to_12_Audit.md` | Checklists / audits |
| `IGshorts_Cursor_Handoff/*` | Earlier Cursor brief |
| `UI_UX_REDESIGN_SPEC.md` | Redesign spec |
| Various `ANTIGRAVITY_*`, `gptgeneratedenhancements.md` | External review prompts / ideas |

**Rule for AIs:** If docs conflict, prefer **`AI_HANDOFF_PROJECT_STATUS.md` + code + `IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md`** over older phase docs.

---

## 9. Current status snapshot

### Done / largely in place

- Monorepo web + API + shared + Prisma schema (incl. discovery, analytics, claim, schedules).  
- Charts Global/India, movers, profiles, methodology.  
- Discovery homepage with fallbacks when API cold.  
- Music/trends/pulse modules (quality varies; honesty still a theme).  
- Admin shell (watchlist, import, sync, jobs, etc.).  
- Member signup/track, claim table, analytics event model.  
- Theme engine, media dock, follower pyramid.  
- Font self-host fix for Vercel builds.  
- Legal/help/support/cookies/maintenance routes present (depth varies).

### Fragile / incomplete (expect work)

- **API must be up** for live music/trends/ticker; otherwise homepage uses editorial fallbacks (local 500s on music endpoints when DB/discovery empty or API down are expected).  
- Render free tier sleeps → cold starts.  
- Meta Graph refresh gated on real credentials.  
- Claim / Meta harden = master-plan Phase 10.  
- Interaction analytics + cookie consent coupling still plan-driven.  
- Some routes are thin shells (`regions`, `scoring`, news/hashtags).  
- Master plan Appendix A listed trust/honesty bugs; verify against current code before re-fixing.

### Explicitly deferred by product owner (2026-11-15)

- AnonyIG reverse-engineering / unofficial Instagram global search — **skipped**.  
- Next search work (when resumed): watchlist search by `@username` / display name / profile URL + persist recent searches in **our** DB.

---

## 10. How another AI should work in this repo

1. Read this file + `RUN.md` + relevant module under `apps/` / `packages/db`.  
2. Do not invent follower metrics or scrape Instagram unofficially.  
3. Prefer small, honest UX + schema changes; keep shared DTOs in `@igshorts/shared` in sync.  
4. After web font/layout changes, ensure `next build` does not use `next/font/google`.  
5. Commit only when asked; deploy path is GitHub `main` → Vercel (web) + Render (API).  
6. For unfinished roadmap, follow phase order in `docs/IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md`.

---

## 11. Quick commands

```powershell
# Local
docker compose up -d postgres
pnpm install
pnpm build:shared
pnpm db:generate
pnpm db:migrate
pnpm dev

# Seed if charts empty
pnpm --filter @igshorts/api build
pnpm seed:import
pnpm job:pipeline

# Production web build check
pnpm --filter @igshorts/shared build
pnpm --filter @igshorts/web build
```

---

## 12. One-sentence truth for stakeholders

**IGshorts is a curated public Instagram people ranking + discovery observatory on our own database — not a full-Instagram anonymous search engine.**
