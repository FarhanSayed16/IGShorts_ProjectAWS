# IGshorts — Master Plan (Project Execution)

**This is the document we build from.**  
Phases and sub-phases are the official order. Do not skip a phase’s exit criteria.

**Product v1:** Public dashboard of famous Instagram **people**, ranked by **public follower count** (India + Global watchlist).  
**Look:** Billboard × CoinMarketCap × Medium. Navy / paper / gold.  
**Stack:** TypeScript · Next.js · NestJS · PostgreSQL · Prisma · AWS `ap-south-1`.  
**Rule:** No scraping. Missing counts = empty, never zero. Rank is computed, not typed from Excel.

---

## How to use this plan

1. Work **one phase at a time**.  
2. Finish every sub-phase checklist in [`IGShorts_Execution_Checklist.md`](IGShorts_Execution_Checklist.md).  
3. A phase is done only when its **exit criteria** are true.  
4. Detail for modules/pages lives in the source docs; this file is the **sequence**.

| Source | Use when |
|---|---|
| `IGShorts_Tech_Stack_Plan.md` | Stack, AWS, adapters |
| `IGShorts_Backend_Plan.md` | Modules, APIs, schema, jobs |
| `IGShorts_Frontend_Plan.md` | Pages, design, motion, components |
| `IGShorts_Seed_List_Review.md` | Excel watchlist QA |
| `IGShorts_MVP_Follower_Dashboard.md` | v1 product definition |
| `IGshorts_Instagram_Account_Research_and_Architecture.xlsx` | India 200 + Global 200 seed |
| `architecture/*.puml` | Diagrams for sir / team |

**v1 is done at the end of Phase 11.** Phase 12 is go-live. After that is backlog, not a rewrite.

---

## Locked decisions (do not reopen)

1. v1 ranks **persons** by public **follower count** only.  
2. Watchlist is our universe (200 India + 200 Global, merged by username).  
3. Brands/teams stay in DB, **off** the default people chart.  
4. REST `/api/v1`, adapter pattern, append-only snapshots.  
5. Frontend never talks to Instagram/Meta.  
6. Meta Graph adapter is **wired off** until App Review.  
7. TypeScript everywhere. One monorepo.

---

## Phase map (12 phases)

```text
 1  Foundation          repo, env, conventions
 2  Data core           Postgres schema, health
 3  Watchlist           profiles, metrics, Excel import
 4  Ranking APIs        followers_v1 + public chart endpoints
 5  UI foundation       tokens, chrome, table (fixtures)
 6  Public dashboard    home, India/Global charts, live API
 7  Depth & trust       profile, movers, methodology, legal, motion
 8  Admin               login, CRUD, import, rebuild
 9  Automation          jobs, audit, Meta stub, future folders
10  Cloud               AWS staging, CI/CD, security, SEO
11  Quality & demo      seed cleanup, tests, sir demo
12  Launch              production, handover, v2 backlog
```

Phases 1–4 are mostly backend.  
Phase 5 can **overlap** 3–4 using fixture JSON.  
Phases 6–8 need APIs from 4.  
Do not start 10 until 8 is usable.

---

# Phase 1 — Project foundation

**Goal:** A repo and rules everyone can build on. No product features yet.

### 1.1 Repository

- Monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/db`, `infra`, `docs`
- pnpm workspaces, Node 22, TypeScript strict
- `.env.example` for API and web (no secrets committed)
- README: how to run API + web locally

### 1.2 Engineering conventions

- ESLint + Prettier
- Conventional commits (optional but folder names locked)
- API prefix `/api/v1`
- Shared DTOs in `packages/shared` (ChartEntry, ProfilePublic, ChartMeta)

### 1.3 Product constants (code config, not Excel)

- Chart keys: `global_persons`, `india_persons`
- Algorithm: `followers_v1`
- Entity types: person / brand / team / platform / other
- Scopes: india / global

### 1.4 Local run

- Docker Compose: PostgreSQL 16 only (Redis later)
- `api` health on localhost
- `web` empty Next.js app with fonts reserved

**Exit criteria**

- [ ] Clone → install → API health + empty Next page both run  
- [ ] No secrets in git  
- [ ] Shared types package exists  

---

# Phase 2 — Data core and API skeleton

**Goal:** Database and NestJS skeleton matching the backend plan.

### 2.1 Prisma schema (create all v1 tables now)

- `data_sources`
- `creator_profiles`
- `profile_scopes`
- `metric_snapshots` (append-only)
- `ranking_runs` / `ranking_entries`
- `admin_users`
- `audit_logs`
- `job_runs`

Indexes: unique username; snapshots by profile+metric+time; latest run by chart_key.

### 2.2 Nest modules (folders exist)

Working: `config`, `common`, `database`, `health`  
Empty-but-present: `auth`, `profiles`, `metrics`, `ingestion`, `ranking`, `charts`, `admin`, `jobs`, `storage`, `audit`  
Stubs: `scoring`, `hashtags`, `news`, `regions`

### 2.3 Health

- `GET /api/v1/health`
- `GET /api/v1/health/ready` (DB)

### 2.4 Error shape

One JSON: `code`, `message`, `details`. CORS allowlist for local web origin.

**Exit criteria**

- [ ] Migration applies on empty Postgres  
- [ ] Ready endpoint fails if DB is down  
- [ ] Every module folder listed above exists  

---

# Phase 3 — Watchlist, metrics, seed import

**Goal:** Excel becomes database. History can be stored.

### 3.1 Profiles module

- Normalize username (lowercase, no `@`)  
- Unique username  
- Public: `GET /profiles`, `GET /profiles/:username`  
- Admin create/update/hide (can be unguarded internally until Phase 8, **must** be guarded before staging)

### 3.2 Metrics module

- Append snapshot only  
- Latest follower count  
- History series  
- Null allowed; never coerce to 0  

### 3.3 Manual seed adapter

- Read India + Global sheets / CSV  
- Convert millions → integer when present  
- Merge duplicate usernames into one profile + two scopes  
- Map category → entity_type  
- Source = `seed_xlsx`  
- Import report: created, merged, skipped, missing_counts, bad_usernames  

### 3.4 Seed QA during import

Fix or flag from `IGShorts_Seed_List_Review.md`:

- `@m cstan` → `@mcstan`  
- Encoding (Mané, Agüero)  
- Weak rows: Ranbir “fan/official”, Danish Zehen legacy, Avicii legacy  
- Brands/teams classified, not deleted  

### 3.5 Storage

- Dev: local file  
- Interface ready for S3 in Phase 10  

**Exit criteria**

- [ ] Import both 200-row lists without duplicating Kohli-style overlaps  
- [ ] Profiles with no count have `NULL` followers  
- [ ] Import report lists bad usernames  
- [ ] Re-import is merge, not a second copy  

---

# Phase 4 — Ranking engine and public chart APIs

**Goal:** The product number: who is #1.

### 4.1 Ranking engine `followers_v1`

- Filter: chart scope + `entity_type = person` + listed + non-null followers  
- Sort: followers desc, username asc on ties  
- Competition rank  
- Compare to previous **successful** run → rank_delta, metric_delta  
- Unranked (null) excluded from table  

### 4.2 Ranking persistence

- Write `ranking_runs` + `ranking_entries`  
- Store `algorithm_version = followers_v1`  
- Manual trigger: rebuild both charts  

### 4.3 Charts API (frontend contract)

- `GET /api/v1/charts`  
- `GET /api/v1/charts/:chartKey` (limit, offset, category, q)  
- `GET /api/v1/charts/:chartKey/movers`  
- `GET /api/v1/charts/:chartKey/meta` (as_of, algorithm, source, freshness)  
- `GET /api/v1/profiles/:username/history`  

Row payload: rank, previous_rank, rank_delta, name, username, avatar, url, category, country, followers, follower_delta, observed_at, source.

### 4.4 Tests

- Sort, ties, nulls, hide-from-chart  
- Seed mapping millions / blank / merge scopes  

**Exit criteria**

- [ ] `GET /charts/global_persons` and `/india_persons` return ranked people only  
- [ ] Second rebuild produces ↑↓ where counts changed  
- [ ] Brands not on default people chart  
- [ ] Meta field honest (seed vs later meta)  

---

# Phase 5 — Frontend foundation (can overlap Phase 3–4)

**Goal:** Professional shell and table, even on fixture data.

### 5.1 Design tokens

- Colours: canvas `#F6F4F0`, navy `#0B1F3A`, gold `#C9A227`, up/down  
- Fonts: display + Inter + tabular numbers  
- Lucide icons only  
- Radius, shadow, 8-point spacing  
- `prefers-reduced-motion` helper  

### 5.2 Public chrome

- Header + mobile drawer  
- Nav: Home, Global, India, Movers, Profiles, Methodology  
- Status ribbon slot  
- Footer + disclaimer (“tracked watchlist, not all of Instagram”)  

### 5.3 Core components (mocked JSON matching DTO)

- RankNumber, RankDeltaChip, FollowerCount  
- RankTable + row states (#1–#3 wash)  
- PodiumCard  
- TableSkeleton, EmptyState, ErrorBanner  
- Avatar fallback  

### 5.4 Motion defaults

- Page fade 280ms  
- Row hover 120ms  
- First-load stagger (disabled if reduced motion)  
- No parallax / particles  

**Exit criteria**

- [ ] Home mock shows podium + two top-10 tables in the locked theme  
- [ ] Table usable on mobile (rank, account, followers, Δ)  
- [ ] Tokens live in one place (no random hex in pages)  

---

# Phase 6 — Public dashboard wired to API

**Goal:** Real ranks on Home and both chart pages.

### 6.1 API client

- React Query / server fetch to Nest  
- Chart keys from config  
- Error + retry on banners  

### 6.2 Home `/`

- Navy hero + two CTAs  
- Global podium #1–#3  
- Twin Top 10 (Global / India)  
- Movers strip (if two runs exist, else hide or empty copy)  
- Trust strip: watchlist size, algorithm, as-of  

### 6.3 Leaderboard template

- `/charts/global` and `/charts/india` (same template)  
- Toolbar: search, category pills, people-only  
- Pagination 50  
- Sticky rank + account on desktop  
- Status ribbon from `/meta`  
- Stale amber if freshness too old  

### 6.4 Charts index `/charts`

Cards for Global people and India people.

**Exit criteria**

- [ ] Killing the API shows error banner, not a blank page  
- [ ] Home and full tables match API ranks  
- [ ] Copy never says “impressions”  
- [ ] SSR titles work for SEO baseline  

---

# Phase 7 — Depth, trust pages, polish

**Goal:** A site, not only a table.

### 7.1 Profiles

- `/profiles` search + chips  
- `/profiles/:username` header, stats, history chart, nearby ranks  
- Unranked copy: “Listed, not yet ranked”  
- 404 for unknown username  
- Outbound “View on Instagram” only  

### 7.2 Movers `/movers`

- Gains / drops  
- Empty: need two ranking runs  

### 7.3 Trust & legal

- Methodology (watchlist, metric, nulls, persons vs brands, cadence, sources)  
- About, FAQ, Privacy, Terms  
- Footer links  

### 7.4 System pages

- 404  
- Error boundary  
- Coming-soon shells **not** in public nav  

### 7.5 A11y and motion pass

- Contrast, focus ring, skip link  
- Δ not colour-only  
- Reduced motion kills count-up and stagger  

**Exit criteria**

- [ ] Methodology live and linked from ribbon + footer  
- [ ] Profile history honest with 0 or 1 snapshot  
- [ ] Keyboard can open nav and FAQ  
- [ ] English copy in one messages file  

---

# Phase 8 — Admin workspace

**Goal:** We can operate the watchlist without deploys.

### 8.1 Auth

- Admin login JWT (or API key only on local — JWT before staging)  
- Guard all `/admin/*` and `/api/v1/admin/*`  
- `/admin/login` (noindex)  

### 8.2 Admin shell

- Sidebar: Overview, Watchlist, Import, Sync, Rankings, Jobs, Audit  
- Toasts, no podium animations  

### 8.3 Screens

- Overview: counts + last sync + last ranking + stale warning  
- Watchlist table + add + edit (entity, scopes, hide)  
- Import drop zone + full report UI  
- Sync now (all / one username)  
- Rebuild rankings + run list  
- Jobs + audit read-only  

### 8.4 Audit writes

Profile change, import, editorial metric, ranking run, login.

**Exit criteria**

- [ ] Unauthenticated admin URL redirects to login  
- [ ] Hide profile → disappears from public people chart after rebuild  
- [ ] Import report visible in UI  
- [ ] Public site has no admin links in the main nav  

---

# Phase 9 — Automation and future-proof slots

**Goal:** Daily pipeline + upgrade joints.

### 9.1 Jobs

- Sequence: sync due profiles → rebuild charts → log `job_runs`  
- Idempotent, per-username failure isolation  
- Nest cron now; EventBridge in Phase 10  
- Stale-data flag if last success too old  

### 9.2 Meta adapter stub

- Folder + registry entry `meta`  
- Feature flag `PROVIDER=seed`  
- Methods exist; live calls **off**  
- Rate-limit config placeholders  

### 9.3 Future stubs (backend + frontend)

- Backend: scoring, hashtags, news, regions (not implemented)  
- Frontend routes exist as Coming Soon, **hidden from nav**  

### 9.4 Editorial metric (emergency)

Admin can type a follower count with note + source `editorial` — audited, not default.

**Exit criteria**

- [ ] One command/job rebuilds both charts  
- [ ] Switching provider flag does not require UI changes  
- [ ] Stub modules do not break boot  

---

# Phase 10 — AWS, CI/CD, security, SEO

**Goal:** Staging that looks like production.

### 10.1 AWS (`ap-south-1`)

- RDS PostgreSQL  
- API on ECS Fargate (or agreed host)  
- Web on Amplify or ECS + CloudFront  
- S3 for imports  
- Secrets Manager  
- HTTPS, WAF baseline, security groups  

### 10.2 CI/CD

GitHub Actions: lint, typecheck, unit tests, migrate (staging), deploy staging, smoke `GET /health` + `GET /charts/global_persons`.

### 10.3 Security

- Helmet, rate limit public GET  
- Admin HTTPS only  
- No tokens in responses or client bundle  
- Backups + restore tested once  

### 10.4 Observability

- CloudWatch logs  
- Alarms: 5xx, failed job, ranking older than 36h  

### 10.5 SEO / prod web

- Sitemap, robots (noindex admin)  
- OG titles, JSON-LD ItemList on charts  
- Performance pass (LCP, avatars)  

**Exit criteria**

- [ ] Staging URLs work for public + admin  
- [ ] Smoke tests green  
- [ ] Secrets only in Secrets Manager  
- [ ] Staging restore from backup proven  

---

# Phase 11 — Quality, seed cleanup, stakeholder demo

**Goal:** Something we can show Saurabh sir without caveats we forgot.

### 11.1 Data quality

- Fix remaining bad usernames  
- Confirm entity_type on brands/teams  
- Decide weak/legacy rows (hide vs keep)  
- Persons chart looks like “famous people”, not Zomato at #196 as a person  
- Document how many rows are ranked vs pending count  

### 11.2 Product QA (full paths)

- Home → Global → row → profile → Instagram outbound  
- India chart filters  
- Movers after two rebuilds (change one seed count in staging to demo ↑↓)  
- Admin import / hide / rebuild / public reflects  
- Mobile + desktop  
- Stale and error banners  

### 11.3 Copy audit

No “all of Instagram”, no “impressions”, no fake precision. As-of visible.

### 11.4 Demo kit

- Staging URL  
- 5-minute script: Home, table, profile, methodology, admin hide  
- Known limits slide: seed counts until Meta; watchlist not firehose  

**Exit criteria**

- [ ] Sir can click a staging site unassisted  
- [ ] People charts contain people  
- [ ] Checklist file for Phases 1–11 is ticked  
- [ ] Written list of v1 known gaps  

---

# Phase 12 — Production launch and handover

**Goal:** Live on domain, then stop and only add planned v2.

### 12.1 Production

- Domain (IGshorts.com when ready)  
- Prod env, backups on  
- Admin users created  
- Feature flag still `seed` until Meta approval  

### 12.2 Launch checks

- Privacy + terms live  
- Health + charts smoke on prod  
- First prod ranking run  
- Monitor 24–48h  

### 12.3 Handover

- Runbook: import, sync, rebuild, hide, what to do if job fails  
- Architecture diagrams  
- This master plan + checklist archived as v1  

### 12.4 v2 backlog (do **not** build in v1)

- Meta Graph live followers (App Review)  
- Exact integer counts replacing rounded millions  
- Brands / teams charts  
- Claim profile + Insights  
- Hashtags, news tickers, region engine  
- Public user accounts  
- Scoring v2  

**Exit criteria**

- [ ] Prod public charts load on HTTPS  
- [ ] Runbook with the team  
- [ ] v2 backlog written, not started unless sir asks  

---

## v1 definition of done (whole project)

All must be true:

1. Public Global and India **people** leaderboards.  
2. Rank = computed follower count from snapshots.  
3. History append-only; re-sync does not wipe yesterday.  
4. Null counts unranked.  
5. Home, table, profile, movers, methodology, legal.  
6. Admin import / hide / rebuild.  
7. Daily job path exists.  
8. Meta adapter present, off.  
9. Staging (and prod after Phase 12) on AWS.  
10. No scrapers, no impressions copy, no secrets in git.  
11. Theme: navy / paper / gold, motion professional.  
12. Sir can demo the dashboard.

---

## Parallelism (so we move faster)

| Can start | After |
|---|---|
| Phase 5 UI fixtures | Phase 1 |
| Phase 6 wiring | Phase 4 APIs + Phase 5 chrome |
| Phase 7 | Phase 6 |
| Phase 8 | Phase 3 + 4 (guard auth before staging) |
| Phase 9 | Phase 4 |
| Phase 10 | Phase 8 usable |
| Phase 11 | Phase 10 staging **or** solid local + tunnel, but AWS preferred |
| Phase 12 | Phase 11 sign-off |

---

## Explicitly out of v1

Scraping · GraphQL · Kafka · K8s · user social features · hashtag firehose · news CMS · true impressions for unmanaged accounts · native apps.

---

**Execution ticks live in** [`docs/IGShorts_Execution_Checklist.md`](IGShorts_Execution_Checklist.md).  
If a sub-phase is unclear, open the backend or frontend plan — do not invent a new architecture.
