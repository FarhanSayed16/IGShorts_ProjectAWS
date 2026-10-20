# IGshorts — Technical Stack Plan (Locked)

**Purpose:** One stack we build on now, and can upgrade later **without rewriting**.  
**Product v1:** Public dashboard of top followed Instagram accounts (persons first), ranked by public follower count.  
**Design rule:** Website ≠ data provider ≠ ranking engine. New features plug in as modules/adapters.

This document is **stack only**. Backend plan, frontend plan, and the 10–12 phase masterplan come next.

---

## 1. Stack we lock

| Layer | Choice | Why this, not something else |
|---|---|---|
| Language | **TypeScript** (frontend + backend) | One language, easier hiring, shared types, safer upgrades |
| Frontend | **Next.js 15 (App Router) + React 19** | SSR/SEO for public charts, one app for site + admin |
| Styling | **Tailwind CSS + shadcn/ui** | Fast Billboard/CMC tables, consistent, no heavy UI kit lock-in |
| Charts / sparklines | **Recharts** (or lightweight sparkline) | Rank change visuals without a fat BI tool |
| Backend API | **NestJS** | Modules, versioned APIs, queues, guards — grows cleanly |
| ORM | **Prisma** | Typed models, migrations, easy schema growth |
| Primary DB | **PostgreSQL 16** on **AWS RDS** (Aurora later if needed) | Rank history, snapshots, relations; not a toy DB |
| Cache | **Redis** via **ElastiCache** — *add when hot charts need it* | Optional in week 1; slot is already in the design |
| Jobs / sync | **BullMQ** (Redis) *or* **EventBridge + ECS worker** | Scheduled follower refresh, retries, idempotency |
| Object storage | **S3** | Avatars cache, exports, static assets |
| Auth (later) | **Cognito** or **Auth.js** | Public site first; login / claim-profile later without a rewrite |
| Infra | **AWS** (`ap-south-1`) | Matches sir’s AWS world; India latency |
| IaC | **AWS CDK (TypeScript)** | Same language as the app |
| CI/CD | **GitHub Actions** | Lint, test, migrate, deploy staging → prod |
| Secrets | **AWS Secrets Manager** | Meta tokens never in git |
| Observability | **CloudWatch** + structured logs | Freshness, failed syncs, API errors |
| Monorepo | **pnpm workspaces** (`apps/web`, `apps/api`, `packages/shared`) | Frontend/backend share DTOs |

**Not using for v1:** GraphQL, Kafka, Elasticsearch, Kubernetes, scraping APIs, MongoDB, Firebase-as-core-DB.

---

## 2. How the pieces sit together

```text
Browser
   │
   ▼
Next.js (SSR pages + admin)
   │  /api/v1/*  (BFF can proxy, secrets stay on Nest)
   ▼
NestJS API  ── Prisma ──► PostgreSQL
   │                      Redis (cache / queues)
   │
   ├── Data adapters (swap without UI change)
   │     • ManualSeedAdapter      ← Excel / CSV now
   │     • MetaGraphAdapter       ← live followers later
   │     • LicensedVendorAdapter  ← optional later
   │
   └── RankingEngine v1
         sort by follower_count
         later: extra score versions, same engine slot
```

**Upgrade test:** adding Meta API = one new adapter + config. Dashboard, DB, and ranking table stay.

---

## 3. Frontend stack (detail)

| Item | Decision |
|---|---|
| Framework | Next.js App Router, TypeScript strict |
| Rendering | SSR for chart pages (SEO), client tables for sort/filter |
| UI | Tailwind + shadcn (Table, Tabs, Badge, Avatar) |
| State | Server Components + React Query for live refresh |
| Forms (admin) | React Hook Form + Zod |
| Images | `next/image`; avatars from S3 or IG CDN via proxy later |
| Hosting | **AWS Amplify** *or* ECS behind CloudFront — Amplify is faster for MVP |

**v1 screens:** Home leaderboard, India / Global tabs, profile detail, methodology, simple admin (watchlist CRUD).

**Later without rewrite:** category filters, news ticker, claim-profile, user accounts — new routes + API modules.

---

## 4. Backend stack (detail)

| Item | Decision |
|---|---|
| Runtime | Node.js 22 LTS |
| Framework | NestJS + Fastify adapter (or Express — Fastify preferred) |
| API style | **REST, versioned:** `/api/v1/charts`, `/profiles`, `/admin` |
| Validation | Zod or class-validator on DTOs |
| Auth (v1) | Admin only (API key / Cognito). Public read = no login |
| Jobs | `SyncFollowersJob` daily; quota-aware batching |
| Files | Multer → S3 for seed CSV import |

**Core modules (create now, fill later):**

- `ProfilesModule`
- `ChartsModule`
- `RankingModule` (v1 = followers only)
- `IngestionModule` + `adapters/`
- `AdminModule`
- `HealthModule`

Empty modules we **do not delete**, so upgrades are easy:

- `HashtagsModule` (stub)
- `NewsModule` (stub)
- `ScoringModule` (stub — v2 weights)
- `AuthModule` (stub — public users)

---

## 5. Data stack (must be right on day 1)

PostgreSQL tables we commit to now:

| Table | Role |
|---|---|
| `creator_profiles` | username, name, category, country, entity_type (`person/brand/team/platform`), scope (`india/global`) |
| `data_sources` | seed_xlsx, meta_graph, vendor, editorial |
| `metric_snapshots` | **append-only** follower_count, observed_at, source_id |
| `ranking_runs` | algorithm_version, chart_type, run_at |
| `ranking_entries` | run_id, rank, profile_id, metric_value, delta |
| `audit_logs` | admin changes |

**Rules:**

- Never overwrite a snapshot. Always insert.
- Missing count = `NULL`, never `0`.
- Rank is **computed**, not typed by hand.
- Algorithm version (`followers_v1`) stored on every run so v2 scores can coexist.

---

## 6. Instagram / data providers

| Phase | Provider | Use |
|---|---|---|
| Now | **Manual seed** (this Excel → CSV import) | Watchlist of 200 India + 200 Global |
| Next | **Meta Graph API** — Business Discovery | Live public follower counts for professional accounts |
| Later | Licensed vendor (optional) | Broader discovery |
| Never | Unofficial scrapers as production source | Against ToS, fragile, not for sir’s AWS product |

Until Meta App Review is approved, the dashboard can run on **seed counts + manual refresh**. Same UI.

---

## 7. AWS map (start small, grow in place)

| Service | MVP | Later |
|---|---|---|
| Route 53 + ACM | Domain / HTTPS | — |
| CloudFront + WAF | Yes | Bot rules |
| Amplify or ECS Fargate | Next.js | Split web/API ECS |
| ECS Fargate / Elastic Beanstalk | NestJS API | Same |
| RDS PostgreSQL (single-AZ) | Yes | Multi-AZ Aurora |
| ElastiCache Redis | Skip until needed | Cache + BullMQ |
| S3 | Assets + imports | Media cache |
| Secrets Manager | Yes | — |
| EventBridge | Daily sync | More jobs |
| CloudWatch | Logs + 3 alarms | Dashboards |
| Cognito | No | Users + claim profile |

Region: **ap-south-1 (Mumbai)**.

---

## 8. Repo layout (so frontend + backend stay aligned)

```text
IGShorts_ProjectAWS/
  apps/
    web/          # Next.js
    api/          # NestJS
    worker/       # optional sync worker (can live in api at first)
  packages/
    shared/       # ChartEntry, Profile DTO, ranking versions
    db/           # Prisma schema
  infra/          # AWS CDK
  docs/
  architecture/
```

Shared types mean the dashboard cannot drift from the API.

---

## 9. Quality gates (from day 1)

- TypeScript `strict`
- ESLint + Prettier
- Prisma migrate in CI
- Unit tests on ranking sort + adapter mapping
- One smoke test: `GET /api/v1/charts/global` returns ranked rows
- Staging deploy before prod

---

## 10. What this stack is ready to add later (no rewrite)

| Future feature | Where it plugs in |
|---|---|
| Live Meta followers | `MetaGraphAdapter` |
| Engagement / impressions (claimed accounts) | new metric on `metric_snapshots` + `ScoringModule` v2 |
| Hashtags / news tickers | stub modules already in API + new Next.js routes |
| Region charts | `country_region` already on profiles |
| Login / claim profile | Cognito + `AuthModule` |
| More than 400 accounts | same tables, bigger watchlist, quota-aware jobs |

---

## 11. Locked decisions (do not reopen unless blocked)

1. TypeScript + Next.js + NestJS + PostgreSQL + Prisma + AWS.  
2. REST `/api/v1`, adapter pattern, append-only snapshots.  
3. Rank v1 = public follower count, persons-first.  
4. Seed list from the Excel watchlist; live numbers via Meta later.  
5. No scraping architecture.

---

## Next documents (after this)

1. **Backend plan** — modules, APIs, schema, jobs, adapters  
2. **Frontend plan** — pages, components, dashboard UX  
3. **Masterplan** — 10–12 phases integrating both, then we build against that
