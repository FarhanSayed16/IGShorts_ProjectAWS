# IGshorts — Complete Backend Implementation Plan

**No code in this document.** This is the backend blueprint: folders, modules, services, APIs, data, jobs, and how features are split so we can upgrade later without a rewrite.

**Locked stack:** NestJS · Node 22 · PostgreSQL · Prisma · REST `/api/v1` · AWS `ap-south-1`  
**v1 job:** Rank famous Instagram **people** by public follower count (India 200 + Global 200 watchlist).  
**Rule:** Website, data provider, and ranking engine stay separate.

---

## 1. Backend responsibility (what this app owns)

The backend is the **source of truth**. It will:

1. Store the watchlist (profiles, category, country, person vs brand vs team).
2. Ingest follower numbers from a **provider adapter** (Excel now, Meta later).
3. Keep **history** of every count (never overwrite).
4. Compute ranks and rank-change (↑↓).
5. Serve public chart and profile APIs.
6. Give admins a way to add, hide, fix, and re-sync accounts.
7. Stay healthy, logged, and secret-safe on AWS.

It will **not** scrape Instagram. It will **not** invent follower counts. Missing = empty, never zero.

---

## 2. Application shape

Two processes can share the same NestJS project at first:

| Process | Role |
|---|---|
| **API server** | HTTP `/api/v1/*` for web + admin |
| **Worker** | Scheduled sync + ranking runs (same codebase, different start command) |

Later we can split `apps/worker` without changing modules.

---

## 3. Folder and file map (`apps/api`)

Every feature lives in its **own module folder**. A module always has the same kinds of files (names only):

| File kind | What it is for |
|---|---|
| `*.module` | Wires the feature |
| `*.controller` | HTTP routes |
| `*.service` | Business rules |
| `*.repository` | Database reads/writes (optional if Prisma is used directly in service at first) |
| `dto/` | Request and response shapes |
| `*.constants` | Chart types, algorithm names, entity types |
| `*.spec` | Tests for that feature |

### 3.1 Root tree

```text
apps/api/
  src/
    main                          # bootstrap, CORS, version prefix
    app.module                    # root wiring only

    config/                       # env, AWS region, sync cadence, feature flags
    common/                       # shared guards, filters, interceptors, pagination
    database/                     # Prisma client module
    health/                       # liveness / readiness
    auth/                         # admin now; public users later (stub ok)
    profiles/                     # watchlist of IG accounts
    metrics/                      # follower snapshots (history)
    ingestion/                    # pull data from providers
      adapters/                   # one folder per provider
    ranking/                      # how rank is calculated
    charts/                       # public leaderboard APIs
    admin/                        # protected write APIs
    jobs/                         # scheduled work
    storage/                      # S3 import/export
    audit/                        # who changed what

    scoring/                      # STUB — future IGshorts Score
    hashtags/                     # STUB
    news/                         # STUB
    regions/                      # STUB — extra geo charts later

  test/                           # e2e smoke tests
  prisma/                         # lives in packages/db, API consumes it
```

### 3.2 `common/` (shared, no feature logic)

- Exception filter (one error JSON shape)
- Logging interceptor (request id, path, duration)
- Auth guard (admin)
- Roles / public decorator
- Pagination helper
- Validation pipe
- Rate-limit guard (public APIs)
- Idempotency helper (jobs)

### 3.3 `config/`

- App config (port, env, api version)
- Database config
- Redis config (optional until we add cache)
- Meta / provider config (feature flag: `PROVIDER=seed | meta`)
- Sync config (batch size, hours between runs, rate-limit budget)
- AWS config (region, bucket, secrets names)

---

## 4. How features are divided into modules

Think of the backend as **10 working modules + 4 future stubs**.

```text
                    ┌─────────────┐
                    │    Admin    │  writes
                    └──────┬──────┘
                           ▼
┌──────────┐  seed/meta   ┌────────────┐   snapshots   ┌──────────┐
│ Ingestion│─────────────►│  Profiles  │◄─────────────►│ Metrics  │
│ + Adapters│             └─────┬──────┘               └────┬─────┘
└──────────┘                    │                           │
                                ▼                           ▼
                          ┌──────────┐                 ┌──────────┐
                          │ Ranking  │◄────────────────│  Charts  │
                          └──────────┘   latest run    └──────────┘
                                ▲
                                │
                          ┌──────────┐
                          │   Jobs   │  daily: sync → snapshot → rank
                          └──────────┘
```

| Module | v1 status | Owns |
|---|---|---|
| Health | Build | Is the API / DB up |
| Auth | Build (admin only) | Who may write |
| Profiles | Build | The 400-account watchlist |
| Metrics | Build | Follower history |
| Ingestion | Build | Talking to data providers |
| Ranking | Build | Turning numbers into #1…#N |
| Charts | Build | Public dashboard APIs |
| Admin | Build | Human corrections |
| Jobs | Build | Daily pipeline |
| Audit | Build | Trace of admin + jobs |
| Storage | Build light | CSV/Excel import to S3 |
| Scoring | **Stub** | Weighted score later |
| Hashtags | **Stub** | Tag charts later |
| News | **Stub** | Tickers later |
| Regions | **Stub** | Extra geo later |

Stubs = module exists, one health/ping or `501 not implemented` route, empty service. We do **not** skip creating the folder.

---

## 5. Database plan (Prisma / PostgreSQL)

All tables live in `packages/db`. Backend never “edits Excel” at runtime. Excel is only an **import source**.

### 5.1 Tables we create in v1

**data_sources**  
Who produced a number.

- Fields: id, code (`seed_xlsx`, `meta_graph`, `editorial`, `vendor`), display name, is_active  
- Why: every follower count must point at a source

**creator_profiles**  
The watchlist. One row per Instagram username.

- Identity: id, ig_username (unique, no `@` stored, lowercase), display_name, profile_url, avatar_url  
- Classification: entity_type (`person` | `brand` | `team` | `platform` | `other`)  
- Scope: on **join table** or flags: `is_india_chart`, `is_global_chart` (one person can be in both)  
- Extra: category, country_region, is_verified_handle, is_active, is_listed (hide without delete)  
- Meta later: ig_user_id, last_synced_at, last_sync_status, last_sync_error  
- Research leftover: seed_rank, seed_confidence, seed_notes, ranking_source_url  

**profile_scopes** (optional but cleaner)  
- profile_id, scope (`india` | `global`)  
- Lets Kohli appear on both charts without two profile rows

**metric_snapshots**  
Append-only history. **Never update a row.**

- profile_id, source_id  
- metric_name (`follower_count` now; later `following`, `media_count`, `impressions`)  
- metric_value (integer, **nullable**)  
- observed_at, ingested_at, freshness_hours  
- raw_payload_ref (optional JSON/S3 key of provider response)

**ranking_runs**  
One computed leaderboard snapshot.

- chart_key (`global_persons`, `india_persons`, later `global_all`)  
- algorithm_version (`followers_v1`)  
- status (`running` | `success` | `failed`)  
- started_at, finished_at, profile_count, notes

**ranking_entries**  
Rows inside a run.

- run_id, rank (1…N), profile_id  
- metric_value, previous_rank, rank_delta, previous_metric_value, metric_delta  
- is_tied

**admin_users** (simple v1)  
- email, password_hash or cognito_sub, role (`admin` | `editor`), is_active

**audit_logs**  
- actor, action, entity_type, entity_id, before/after summary, created_at, ip

**job_runs**  
- job_name, started_at, finished_at, status, stats (synced, failed, skipped), error

### 5.2 Data rules (non-negotiable)

1. Username unique. Store without `@`.  
2. Blank follower count is `NULL`, never `0`.  
3. Snapshots are insert-only.  
4. Rank is **never** typed by a human as the live rank. Humans only seed / hide / boost later.  
5. Default public charts: **persons only**. Brands/teams stay in DB, hidden from v1 chart via filter.  
6. Algorithm version stored on every ranking run.

### 5.3 Indexes (plan, not SQL)

- username unique  
- snapshots: (profile_id, metric_name, observed_at desc)  
- ranking_entries: (run_id, rank)  
- latest successful run lookup by chart_key  

---

## 6. Module-by-module implementation plan

---

### 6.1 Health module

**Why:** AWS target group + humans need a simple “is it up”.

**Files**

- health.module  
- health.controller  
- health.service  

**Routes**

- `GET /api/v1/health` — process up  
- `GET /api/v1/health/ready` — DB reachable  

**Later:** Redis ping, last successful ranking age.

---

### 6.2 Auth module

**Why:** Public **read**. Admin **write**.

**v1**

- Admin login (JWT from Nest) **or** API key header for first demo  
- Guard on all `/admin/*`  
- Roles: admin, editor  

**Files**

- auth.module  
- auth.controller  
- auth.service  
- jwt.strategy / api-key.guard  
- dto: login request, token response  

**Routes (v1)**

- `POST /api/v1/auth/admin/login`  
- `GET /api/v1/auth/me`  

**Stub for later (create empty service methods, do not implement):**

- public user signup  
- creator “claim profile”  
- Cognito swap (config flag)

---

### 6.3 Profiles module

**Why:** The watchlist is the product’s universe. Charts only rank what is here.

**Files**

- profiles.module  
- profiles.controller          # public read  
- profiles.service  
- profiles.repository  
- dto: profile public card, profile detail, list filters  
- constants: entity types, categories  

**Public routes**

- `GET /api/v1/profiles` — search / filter (category, country, entity_type, scope)  
- `GET /api/v1/profiles/:username` — detail + latest followers + rank on each chart  

**Service jobs**

- Get by username  
- List with filters + pagination  
- Create / update / deactivate (called by Admin, not public)  
- Ensure username normalized  
- Mark sync status  

**Does not do:** talking to Instagram, computing rank.

---

### 6.4 Metrics module

**Why:** History of numbers, independent of “who is #1 today”.

**Files**

- metrics.module  
- metrics.service  
- metrics.repository  
- dto: snapshot, history series  

**Service jobs**

- Append snapshot (reject overwrite)  
- Latest snapshot per profile for a metric  
- History for sparkline (`from`, `to`)  
- Bulk latest followers for a set of profile ids (for ranking)  

**Public (via profiles/charts, not a noisy extra API unless needed)**

- `GET /api/v1/profiles/:username/history?metric=follower_count`  

**Rule:** ingestion and ranking **call this module**. They do not write snapshots themselves.

---

### 6.5 Ingestion module + adapters

**Why:** This is the upgrade joint. UI and ranking never know if data came from Excel or Meta.

**Files**

```text
ingestion/
  ingestion.module
  ingestion.service              # orchestrates: pick adapter → normalize → save profile + snapshot
  ingestion.types                # NormalizedProfile, NormalizedMetric (headings only)
  adapters/
    adapter.interface            # contract every provider must satisfy
    adapter.registry             # seed | meta | vendor
    manual-seed.adapter          # Excel/CSV
    meta-graph.adapter           # STUB implementation until App Review
    vendor.adapter               # empty stub
    editorial.adapter            # admin typed a number with a note
```

**Adapter contract (behaviour, not code)**

Each adapter can:

1. Import or refresh a batch of usernames  
2. Return **normalized** fields only: username, name, url, followers (nullable), source, observed_at, raw ref  
3. Say “unsupported” or “rate limited” instead of crashing  
4. Never return a fake zero  

**Ingestion service steps**

1. Load due watchlist batch (active profiles).  
2. Call current adapter.  
3. Upsert profile identity fields (name/url/avatar) if provided.  
4. Append metric snapshot via Metrics module.  
5. Update last_synced_at / error.  
6. Write job_run stats.  

**Admin / job triggers**

- Import seed file (India sheet, Global sheet)  
- Sync all  
- Sync one username  
- Switch provider flag (`seed` → `meta`) without changing charts  

**v1 adapter: Manual seed**

- Read CSV/XLSX from S3 or local import  
- Map columns from the research sheet: rank, account_name, username, profile_url, follower_count_millions, category, country_region, confidence, notes, scope  
- Convert millions → integer when present; blank stays null  
- Set entity_type from category (Brand/Team/Platform vs Person)  
- Attach both scopes if the same username is in both sheets (merge, do not duplicate)

**Meta adapter (folder exists in v1, live calls later)**

- Business Discovery by username  
- Map follower_count, id, profile picture  
- Honour rate limits and batch size from config  

---

### 6.6 Ranking module

**Why:** Ranking is a **versioned algorithm**, not “ORDER BY in the controller”.

**Files**

```text
ranking/
  ranking.module
  ranking.service                # runs a chart
  ranking.engine.interface
  algorithms/
    followers-v1.engine          # sort by follower_count desc, skip nulls (or last)
    scoring-v2.engine            # STUB
  ranking.repository
  dto: run summary, entry
```

**followers_v1 rules**

- Input: latest non-null follower_count per profile  
- Filter: chart_key (india / global) + entity_type (persons default)  
- Sort: followers desc, then username asc for ties  
- Rank: 1…N dense or competition rank (pick **competition rank**: 1,2,2,4 — document it)  
- Delta: compare to **previous successful run** of same chart_key + algorithm  
- Profiles with null followers: **excluded from rank** (listed as “unranked / pending” if we need them)

**Service jobs**

- `runChart(chart_key)`  
- `runAllCharts()`  
- Get latest successful run  
- Get previous run for delta  

**Does not do:** HTTP, Instagram, admin UI.

---

### 6.7 Charts module (public dashboard API)

**Why:** This is what the frontend leaderboard calls. Thin: read latest ranking run + join profile + latest metric.

**Files**

- charts.module  
- charts.controller  
- charts.service  
- dto: chart list item, chart meta, movers  
- constants: chart keys  

**Public routes**

- `GET /api/v1/charts` — list available charts (india_persons, global_persons)  
- `GET /api/v1/charts/:chartKey` — ranked rows  
  Query: `limit`, `offset`, `category`, `q` (search name/username)  
- `GET /api/v1/charts/:chartKey/movers` — biggest ↑↓ since last run  
- `GET /api/v1/charts/:chartKey/meta` — as_of, algorithm, source, last_sync  

**Response fields per row (contract for frontend)**

- rank, previous_rank, rank_delta  
- display_name, username, avatar_url, profile_url  
- category, country_region, entity_type  
- follower_count, follower_delta  
- observed_at, source  

**Cache slot:** Redis key per chartKey later; v1 can skip Redis and query Postgres.

---

### 6.8 Admin module

**Why:** Sir / we can correct the watchlist without a deploy.

**All routes behind Auth.**

**Files**

- admin.module  
- admin.profiles.controller  
- admin.ingestion.controller  
- admin.ranking.controller  
- admin.service (facade that calls other modules — no extra business rules)

**Routes**

**Profiles**

- `GET /api/v1/admin/profiles`  
- `POST /api/v1/admin/profiles` — add one account  
- `PATCH /api/v1/admin/profiles/:id` — name, category, scopes, hide, entity_type  
- `POST /api/v1/admin/profiles/import` — upload seed file  

**Ingestion**

- `POST /api/v1/admin/ingestion/sync` — all or username list  
- `POST /api/v1/admin/ingestion/editorial-metric` — typed follower count + note (emergency)  

**Ranking**

- `POST /api/v1/admin/ranking/run` — rebuild charts now  

**Jobs**

- `GET /api/v1/admin/jobs` — recent job_runs  
- `GET /api/v1/admin/audit`  

Every write goes to Audit.

---

### 6.9 Jobs module

**Why:** Daily pipeline must not depend on someone opening the admin.

**Files**

```text
jobs/
  jobs.module
  jobs.registry
  sync-followers.job             # ingestion batch
  rebuild-rankings.job           # after sync
  stale-data-alert.job           # if last success > N hours
```

**Daily sequence (one scheduled trigger)**

1. Sync due profiles (adapter).  
2. If enough successes, rebuild all v1 charts.  
3. Log job_run.  
4. If last ranking is stale, alarm (CloudWatch later).  

**v1 trigger:** EventBridge cron hitting `POST /internal/jobs/daily` (guarded) **or** Nest `@Cron` inside the API until we split a worker.

**Rules**

- Idempotent: same day re-run does not corrupt history (new snapshots with new observed_at; new ranking_run).  
- Partial failure: one bad username does not fail the whole job.  
- Quota: batch size from config (Meta 200/hour later).  

---

### 6.10 Storage module

**Why:** Seed Excel/CSV and optional avatar cache.

**Files**

- storage.module  
- storage.service  

**Jobs**

- Put/get import files on S3  
- (Later) cache profile images  

v1 local disk is allowed in development; same interface, S3 in staging/prod.

---

### 6.11 Audit module

**Files**

- audit.module  
- audit.service  

**Events to record**

- Profile created / updated / hidden  
- Import finished  
- Editorial metric added  
- Ranking run  
- Admin login  

---

### 6.12 Future stubs (create empty, do not build)

**scoring/**

- scoring.module  
- scoring.service (returns “not enabled”)  
- Will later compute IGshorts Score from multiple metrics  

**hashtags/**

- Placeholder for tag watchlist + charts  

**news/**

- Placeholder for editorial news / ticker APIs  

**regions/**

- Extra state/metro charts; v1 only uses `country_region` on the profile as a **label**, not a separate engine  

---

## 7. Public vs admin API map (v1)

### Public (no login)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Up check |
| GET | `/api/v1/charts` | Chart catalog |
| GET | `/api/v1/charts/:chartKey` | Leaderboard |
| GET | `/api/v1/charts/:chartKey/movers` | Gainers / losers |
| GET | `/api/v1/charts/:chartKey/meta` | As-of + methodology bits |
| GET | `/api/v1/profiles` | Browse / search |
| GET | `/api/v1/profiles/:username` | One account |
| GET | `/api/v1/profiles/:username/history` | Follower sparkline |

### Admin (auth)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/admin/login` | Token |
| GET | `/api/v1/admin/profiles` | Manage watchlist |
| POST | `/api/v1/admin/profiles` | Add account |
| PATCH | `/api/v1/admin/profiles/:id` | Edit / hide / classify |
| POST | `/api/v1/admin/profiles/import` | Excel/CSV |
| POST | `/api/v1/admin/ingestion/sync` | Pull providers |
| POST | `/api/v1/admin/ranking/run` | Rebuild ranks |
| GET | `/api/v1/admin/jobs` | Job history |
| GET | `/api/v1/admin/audit` | Change log |

All public APIs under `/api/v1` so `/api/v2` can exist later.

---

## 8. Cross-cutting implementation plan

### 8.1 Validation

- Username: Instagram-legal charset, stored lowercase, no `@`  
- Chart key: allow-list only  
- Import: max rows, required columns, skip bad row with error list  

### 8.2 Errors

One JSON: `code`, `message`, `details`.  
Codes: `NOT_FOUND`, `VALIDATION`, `UNRANKED`, `PROVIDER_FAILED`, `UNAUTHORIZED`, `RATE_LIMITED`.

### 8.3 Security

- Secrets only from env / Secrets Manager  
- Helmet, CORS allowlist (web origin)  
- Admin routes HTTPS only  
- Rate limit public GET  
- No Meta token on any response  
- Audit admin writes  

### 8.4 Observability

Log on every request (id, route, status, ms).  
Log every job (synced / failed / skipped).  
Metrics to add: last ranking age, adapter error rate.  
Alarms later: API 5xx, job failed, ranking older than 36h.

### 8.5 Testing (backend only)

| Test | Covers |
|---|---|
| Unit: username normalize | `@M Cstan` / spaces / case |
| Unit: followers_v1 sort + ties + nulls | Ranking engine |
| Unit: seed adapter mapping | Millions → int, blank → null, merge scopes |
| Unit: entity_type from category | Brand/team vs person |
| e2e: import seed → run rank → GET chart | Happy path |
| e2e: hidden profile disappears from public chart | Admin hide |

---

## 9. Seed import behaviour (from the Excel)

When we import India 200 + Global 200:

1. Normalize username; skip / report `@m cstan`.  
2. If username exists, **merge** — add the other scope, do not create a second person.  
3. Map category → entity_type.  
4. Follower millions × 1,000,000 → integer if present.  
5. Source = `seed_xlsx`. Confidence and notes stored on profile, not as live rank.  
6. After both sheets: optional `rebuild rankings` (only profiles with a count appear in Top-N).  
7. Return an import report: created, merged, skipped, missing_counts, bad_usernames.

Public chart default filter: `entity_type = person`.

---

## 10. Implementation order (backend only)

Build in this order so each step is demo-able:

| Step | Deliverable |
|---|---|
| B1 | Nest app, config, health, Prisma schema, migrations |
| B2 | Profiles CRUD (admin) + public get-by-username |
| B3 | Metrics append + history |
| B4 | Manual seed adapter + import endpoint |
| B5 | Ranking engine followers_v1 + ranking tables |
| B6 | Charts public APIs (india + global persons) |
| B7 | Admin hide/edit + audit |
| B8 | Jobs: daily sync-from-seed refresh + rebuild |
| B9 | Auth on admin |
| B10 | Meta adapter **stub wired** (flag off) |
| B11 | Tests for ranking + import |
| B12 | Stub modules (scoring, hashtags, news, regions) so folders exist |

Frontend can start against B6 mock or B6 real.

---

## 11. What “easy upgrade later” means in this plan

| Change later | What we add | What we do **not** touch |
|---|---|---|
| Live IG followers | Meta adapter + job batching | Charts UI contract, ranking table shape |
| Brands chart | New chart_key, same engine | Profile table |
| Engagement / score | New metric_name + scoring-v2 engine + new algorithm_version | Old `followers_v1` runs stay |
| Claim profile / impressions | Auth stub → Cognito + extra metrics | Public leaderboard v1 |
| 2000 accounts | Config batch size + worker split | Modules |
| Redis cache | Charts service cache layer | Ranking math |

---

## 12. Backend definition of done (v1)

Backend v1 is done when **all** of these are true:

1. India and Global **person** charts served from `/api/v1/charts/...`  
2. Rank is computed from stored follower counts, not from Excel rank column  
3. History exists as snapshots; re-sync does not destroy yesterday  
4. Accounts with no count are unranked, not zero  
5. Brands/teams can live in DB but are off the default people chart  
6. Admin can import, hide, and rebuild  
7. Daily job path exists  
8. Meta adapter folder exists, switched off  
9. Health endpoint green on staging  
10. No scrapers, no secrets in git  

---

## 13. Out of scope for this backend v1

- GraphQL  
- User signup / feed / DMs  
- Hashtag firehose  
- News CMS (folder only)  
- True impressions for accounts we do not manage  
- Kubernetes  
- Scraping services  

---

**Next:** Frontend plan (pages, dashboard structure, what it calls).  
**Then:** Masterplan of 10–12 phases that stitches frontend + backend into a build order.
