# IGshorts — Phase 1 to 12 Audit

**Date:** 2026-10-20  
**Scope:** Code, infra, CI, and docs vs Master Plan + Backend + Frontend + Tech Stack.  
**Not in scope:** `infra/cdk.out` (generated; should not be committed).

**Verdict (code, after the fix pass):** P0 application issues (fake auth, fixture ranks, null→0, ranking latest-null, Docker context, generated secrets) are closed in this repo. Remaining honesty gaps that **cannot** be closed in code: live `ap-south-1` URL, ACM HTTPS on a real cert, RDS restore drill executed, Phase 12 production. Do not tick Phase 10–11 until those exist.

**Original verdict (pre-fix):** The product skeleton was real but not Phase 12 complete. Phases 10–11 had been ticked without a working staging URL. Use the P0/P1 tables below as the historical required-fix list.

Use this file as the **required-fix list**. Do not start v2 until P0 is closed.

---

## 1. Honest phase scorecard

| Phase | Checklist says | Audit says | Notes |
|---|---|---|---|
| 1 Foundation | Done | **Mostly done** | Repo, packages, compose, README exist. Node 24 used locally vs lock on 22. `cdk.out` not gitignored. |
| 2 Data core | Done | **Done** | Prisma tables, health, modules, error JSON exist. |
| 3 Watchlist / import | Done | **Mostly done** | Excel import + merge works. Bad usernames reported but still imported. No real file/S3 write. |
| 4 Ranking APIs | Done | **Mostly done** | Engine + chart APIs exist. History turns null into `0`. Chart `source` hardcoded. No e2e. |
| 5 UI foundation | Done | **Partial** | Tokens file exists but pages hardcode hex. Motion catalog unused. Fonts loaded, not applied. |
| 6 Public dashboard | Done | **Partial** | Pages wired, but API failure falls back to **fixture ranks** as if live. |
| 7 Depth & trust | Done | **Mostly done** | Pages exist. `messages/en.json` unused. No history chart, no nearby ranks. |
| 8 Admin | Done | **Unsafe** | Screens exist. Auth is fake. Login prefilled. Sync page missing. |
| 9 Jobs / stubs | Done | **Partial** | CLI pipeline exists. No cron HTTP. Pipeline does **not** sync providers. Meta adapter never called. |
| 10 AWS / CI / SEO | Ticked done | **Scaffolding only** | CDK + workflows exist and would fail to deploy as written. No HTTPS. No staging URL. |
| 11 Quality & demo | Ticked done | **Document only** | Demo kit exists; no evidence of staging QA. Weak/legacy rows not decided. |
| 12 Production | Open (correct) | **Not started** | No domain, prod stack, runbook, or live charts. |

**v1 definition of done:** **not met.**

---

## 2. Required fixes — P0 (must fix before calling v1 done)

These block a honest demo and a safe staging deploy.

### Security

| ID | Issue | Where | What to do |
|---|---|---|---|
| P0-01 | Admin guard accepts any Bearer token longer than 10 characters | `apps/api/src/common/guards/admin-auth.guard.ts` | Verify a signed JWT (or compare API key to env only). Reject everything else. |
| P0-02 | Hardcoded login `admin@igshorts.com` / `admin` | `apps/api/src/auth/auth.service.ts` | Use `admin_users` + hashed password (or Cognito). Remove source credentials. |
| P0-03 | Fake session token (`igshorts_admin_jwt_session_` + timestamp) | `apps/api/src/auth/auth.service.ts` | Issue a real JWT using `ADMIN_JWT_SECRET` from config. |
| P0-04 | `ADMIN_API_KEY` / `adminApiKey` never loaded in `app.config.ts`; guard falls back to `dev_admin_api_key_igshorts` | `apps/api/src/config/app.config.ts`, guard | Bind env. No hardcoded default in production. |
| P0-05 | Admin API key hardcoded in the **browser bundle** | `apps/web/lib/api/admin-client.ts` | Never send a baked-in key. Use login token only. |
| P0-06 | Login form prefilled with password `admin` | `apps/web/app/admin/login/page.tsx` | Empty fields. |
| P0-07 | `GET /api/v1/auth/me` unguarded, always “authenticated” | `apps/api/src/auth` | Guard it; return 401 when no valid session. |
| P0-08 | Same dev key in CDK secret template and compose | `infra/lib/igshorts-stack.ts`, `docker-compose.yml` | Generate secrets; do not ship the demo key to AWS. |

### Honesty (product trust)

| ID | Issue | Where | What to do |
|---|---|---|---|
| P0-09 | API failure replaced with mock Cristiano/Virat ranks | `apps/web/app/page.tsx`, `charts/global`, `charts/india`, `movers`, `profiles`, `profiles/[username]` | Show error banner + empty/skeleton. Fixtures only in local Story/dev flag, never in SSR HTML. |
| P0-10 | Movers paint `+1` / `−1` when delta is 0 (`rank_delta \|\| 1`) | `apps/web/app/page.tsx`, `apps/web/app/movers/page.tsx` | Use the real delta; hide row if 0. |
| P0-11 | History API turns null followers into `0` | `apps/api/src/charts/charts.service.ts` `getProfileHistory` | Keep `null`. Type `HistoryDataPoint.follower_count` as `number \| null`. |
| P0-12 | Invented counts on charts index (`142+`, `73+`) and admin overview fallback (`332` / `147`) | `apps/web/app/charts/page.tsx`, `apps/web/app/admin/page.tsx` | Use API or show “unavailable”. |
| P0-13 | Chart rows hardcode `source: 'seed_xlsx'` and `observed_at` = rank persist time | `apps/api/src/charts/charts.service.ts` | Persist/join real source + snapshot `observed_at`. Meta must be honest. |

### Correctness

| ID | Issue | Where | What to do |
|---|---|---|---|
| P0-14 | Ranking uses latest snapshot, including a later **null**, which unranks a person | `apps/api/src/ranking/ranking.service.ts` | Latest **non-null** `follower_count`. |
| P0-15 | Public `/profiles` can throw on BigInt JSON | `apps/api/src/profiles/profiles.service.ts`, `main.ts` | Map to DTOs (`number \| null`) or add BigInt serializer. |
| P0-16 | Daily job does not sync providers; only rebuilds ranks | `apps/api/src/jobs/jobs.service.ts` | Sync due profiles (adapter) then rebuild. Isolate per-username failures. |

### Cloud / deploy (Phase 10 actually working)

| ID | Issue | Where | What to do |
|---|---|---|---|
| P0-17 | Docker build context is wrong (Dockerfiles need repo root; CDK/CI build `apps/api` or `apps/web`) | `apps/api/Dockerfile`, `apps/web/Dockerfile`, `infra/lib/igshorts-stack.ts`, `.github/workflows/deploy-staging.yml` | Build from monorepo root (or rewrite Dockerfiles). Add `.dockerignore`. |
| P0-18 | ECS `DATABASE_URL` reads a key RDS secrets do not have | `infra/lib/igshorts-stack.ts` | Build Prisma URL from `username`/`password`/`host`/`port` or store a generated URL. |
| P0-19 | ALB is HTTP port 80 only — no HTTPS | `infra/lib/igshorts-stack.ts` | ACM + 443 (or CloudFront). |
| P0-20 | `cdk.out` (full app copies) not gitignored | `.gitignore` | Ignore `infra/cdk.out/`, `infra/**/*.js` (if compiled). |
| P0-21 | No real staging URL; Phase 10–11 ticked anyway | checklist, demo kit | Untick until smoke passes on a live `ap-south-1` URL. |

---

## 3. Required fixes — P1 (should fix before demo / staging)

### Backend

| ID | Issue | What to do |
|---|---|---|
| P1-01 | No `POST /admin/ingestion/sync` or `/internal/jobs/daily`; no Nest cron | Add guarded sync + daily trigger (cron or EventBridge hitting the API). |
| P1-02 | Unknown `chartKey` treated as Global | Allow-list `global_persons` / `india_persons`; else 400. |
| P1-03 | Movers on first run still return 10 rows with delta 0 | Empty until a previous successful run; filter `rankDelta !== 0`. |
| P1-04 | Import still creates rows for bad usernames; no `skipped` in report | Skip invalid handles; return skipped + bad list. |
| P1-05 | Admin create profile: no space strip, no 409 on duplicate | Same normalizer as profiles; unique conflict → 409. |
| P1-06 | Admin cannot PATCH scopes (India + Global) | Add scope update. |
| P1-07 | Editorial metric can write 0/negative and bypass Metrics module | Use `MetricsService.appendSnapshot`; reject `<= 0`. |
| P1-08 | Ranking run stuck `running` if persist fails | try/catch → `failed`. |
| P1-09 | Pipeline always logs `success` even when partial | Write real `partial` / `failed`. |
| P1-10 | Admin overview `isStale: false` when there is **no** run | No run = stale. |
| P1-11 | Hidden profile still on `GET /profiles/:username` | Honour `is_listed` on public detail. |
| P1-12 | `PROVIDER` vs `METRICS_PROVIDER` mismatch | One env flag. Meta adapter stays off in v1. |
| P1-13 | `StorageService.saveFile` is a fake path | Write local disk in dev; S3 in staging. |
| P1-14 | `packages/db` build does not `prisma generate`; Docker same | Add generate to build. |
| P1-15 | No e2e: import → rank → GET chart; hide → rebuild → gone | Add `apps/api/test/` smokes. |
| P1-16 | Pagination DTO unused; query params parsed by hand | Bind DTO so ValidationPipe runs. |
| P1-17 | `GET /auth/admin/login` vs actual `POST /auth/login`; watchlist vs profiles paths | Freeze **one** contract in `packages/shared` and point web at it. |

### Frontend

| ID | Issue | What to do |
|---|---|---|
| P1-18 | Design tokens unused; hex copied in every page | Use `var(--color-*)` / Tailwind theme from tokens only. |
| P1-19 | Playfair + IBM Plex Mono loaded, never applied | Map `--font-display` / `--font-mono` in CSS. |
| P1-20 | `messages/en.json` never imported | Drive public copy from it (Phase 7 exit). |
| P1-21 | Motion catalog unused | Wire durations; keep reduced-motion. |
| P1-22 | `/admin/sync` missing | Page + sidebar + client call (needs P1-01). |
| P1-23 | Import is a button to a hardcoded server path, not a drop zone; report omits skipped/bad | File upload UI + full report. |
| P1-24 | Admin noindex via invalid client `<head>` | App Router `export const metadata = { robots: { index: false } }` on admin layout (server). |
| P1-25 | No Open Graph, favicon, `metadataBase`, canonical | Add `public/` brand assets + metadata. |
| P1-26 | Chart JSON-LD hardcoded `https://igshorts.com`, counts current page only | Use `NEXT_PUBLIC_SITE_URL`; `numberOfItems` = total. |
| P1-27 | Title pattern `#1 Name · Global …` not used | Dynamic titles + top-3 description on home/charts. |
| P1-28 | Profile: no nearby ranks, no Recharts history, ignores `profileUrl` | Match frontend plan. |
| P1-29 | Rank table: no spark, sticky cols, #2/#3 wash, caption | Match table spec. |
| P1-30 | Skip link wraps header too | `#main-content` around the page only. |
| P1-31 | Admin layout always says “Local Dev · Port 4000” | Show real env. |
| P1-32 | Coming-soon `/hashtags` `/news` `/regions` `/scoring` are indexable | `noindex` + omit from sitemap. |
| P1-33 | FAQ missing “Is this official Instagram?” and “Why no impressions?” | Add. |
| P1-34 | Hardcoded “332 unique profiles” in methodology/FAQ | From API meta. |

### Infra / CI / docs

| ID | Issue | What to do |
|---|---|---|
| P1-35 | Smoke grep `"chart_key"` vs API `chartKey` | Align (prefer snake_case in JSON contract **or** fix the smoke). |
| P1-36 | CI/deploy Prisma scripts (`db:generate`, `db:migrate:deploy`) do not match `packages/db` | Use `generate` / `migrate:deploy`. |
| P1-37 | Deploy pushes ECR; CDK uses `fromAsset` and never creates ECR | One path: CDK assets **or** ECR + new task def. |
| P1-38 | Pipeline container command `node dist/scripts/run-pipeline.js` vs image WORKDIR `/app` | `node apps/api/dist/scripts/run-pipeline.js` (or fix WORKDIR). |
| P1-39 | ECS API missing `CORS_ORIGIN` (defaults to localhost) | Set to the public web origin. |
| P1-40 | Failed-job alarm missing; stale-ranking metric never published | `putMetricData` from jobs; add alarm. |
| P1-41 | CI pnpm 10 vs repo `pnpm@11.17.0` | Pin 11.17.0. |
| P1-42 | SNS topic has no subscribers | Email/on-call. |
| P1-43 | No backup restore procedure (only RDS retention) | Document + run one restore on staging. |
| P1-44 | Demo kit has no staging URL; claims HTTP-only cookies (code uses localStorage) | Fix kit after auth fix. |
| P1-45 | Weak/legacy rows (Ranbir fan, Danish Zehen, Avicii) not decided | Hide or keep in writing + admin. |
| P1-46 | Untick Phase 10–11 in checklist until verified; footer still says “Current phase: 5” | Honest status. |
| P1-47 | Architecture `05_aws_deployment.puml` shows CloudFront/Amplify/Redis — not the CDK | Update diagram to the real stack. |
| P1-48 | `infra/bin/infra.ts` imports `source-map-support` not in `infra/package.json` | Add dep or remove import. |

---

## 4. Enhancements — P2 (nice, not v1 blockers)

| ID | Enhancement |
|---|---|
| P2-01 | Real shadcn/ui + Recharts as originally locked |
| P2-02 | Theme toggle (dark tokens already in CSS) |
| P2-03 | Command palette search |
| P2-04 | Full-screen mobile nav drawer |
| P2-05 | Stub HTTP 501 routes for scoring/hashtags/news/regions |
| P2-06 | `vendor.adapter.ts`, `editorial.adapter.ts`, `adapter.registry.ts`, `scoring-v2.engine.ts` as named files |
| P2-07 | Request-id on logs; `freshness_hours` column |
| P2-08 | Roles `admin` / `editor` |
| P2-09 | Split admin controllers as in backend plan |
| P2-10 | `/charts/[chartKey]` coming-soon catch-all |
| P2-11 | `/account` and `/claim` shells |
| P2-12 | Confirm dialogs on hide / rebuild |
| P2-13 | ESLint on `packages/*` and `infra` |
| P2-14 | Compose README: currently starts api+web+db, docs still say “start database” |
| P2-15 | Production CDK stage + prod GitHub workflow (Phase 12) |
| P2-16 | Route 53 + CloudFront as in original AWS map |
| P2-17 | Dedicated ops runbook (job fail, rollback, CloudWatch) — required for Phase 12, not before staging works |

---

## 5. Phase-by-phase missing work (checklist view)

### Phase 1
- [ ] Gitignore `cdk.out`
- [ ] Align Node (22 vs 24) and pnpm (10 vs 11.17) in CI/Docker/engines
- [ ] README: migrate after generate; clarify compose starts full stack

### Phase 2
- [ ] Optional: stub modules expose a 501 route (plan B12)

### Phase 3
- [ ] Skip bad usernames on import
- [ ] Real storage write
- [ ] Decide legacy/weak rows

### Phase 4
- [ ] Null history, honest source/as-of, chartKey allow-list, movers empty, BigInt DTO
- [ ] e2e tests

### Phase 5
- [ ] Apply tokens + display/mono fonts
- [ ] Wire motion catalog

### Phase 6
- [ ] Remove live fixture fallback
- [ ] Home methodology CTA + real movers (no fake +1)

### Phase 7
- [ ] Use `messages/en.json`
- [ ] History chart, nearby ranks, FAQ gaps, skip-link

### Phase 8
- [ ] Real auth
- [ ] Sync page
- [ ] Import drop zone + full report
- [ ] Server-side admin noindex + auth gate

### Phase 9
- [ ] Daily job = sync + rebuild via HTTP/cron
- [ ] Meta stub actually registered behind `PROVIDER=seed`
- [ ] Honest job status

### Phase 10
- [ ] Fix Docker/CDK/CI until staging boots
- [ ] HTTPS, DATABASE_URL, CORS, smoke contract
- [ ] Alarms that fire on real metrics
- [ ] OG/sitemap/robots correctness
- [ ] One backup restore

### Phase 11
- [ ] Staging URL in demo kit
- [ ] Walk the 5-minute script on that URL
- [ ] Copy audit (no “verified Top 100” in root metadata)
- [ ] Ranked vs pending from live API

### Phase 12 (after P0/P1)
- [ ] Domain, prod stack, prod workflow
- [ ] Real admin users
- [ ] Provider stays `seed` until Meta approval
- [ ] Runbook + 24–48h watch
- [ ] v2 backlog (Meta live, brands charts, claim, hashtags, scoring)

---

## 6. Risks if we ignore this

| Risk | If unfixed |
|---|---|
| Anyone can hit `/api/v1/admin/*` with a dummy Bearer token | Watchlist wipe / fake ranks |
| Staging deploy as currently written | Build fail or API with no DB URL |
| HTTP-only ALB | Credentials and admin on cleartext |
| Fixture fallback in SSR | Google/sir see fake Billboard numbers when API is down |
| Null → 0 in history | We violate the core product rule |
| Committing `cdk.out` | Huge noisy diffs, stale copies of the apps |

---

## 7. Suggested fix order

1. **Auth + remove client API key** (P0-01 to P0-08)  
2. **Honesty** — fixtures, fake deltas, null≠0, BigInt, ranking latest-non-null (P0-09 to P0-15)  
3. **Jobs actually sync** (P0-16, P1-01)  
4. **Wire frontend to honest empty/error** + tokens (P1-18 to P1-21)  
5. **Docker/CDK/CI** until staging health + chart smoke (P0-17 to P0-21, P1-35 to P1-40)  
6. **Admin sync/import/noindex** (P1-22 to P1-24)  
7. **SEO + methodology copy** (P1-25 to P1-34)  
8. **Phase 11 demo on a real URL**  
9. **Phase 12** only after sir signs staging  

---

## 8. What is already in good shape (do not redo)

- Prisma v1 schema (profiles, scopes, snapshots, ranking runs/entries, audit, jobs).  
- `followers_v1` engine: persons only, null excluded, competition rank, unit tests.  
- Seed adapter: India/Global sheets, millions → int, blank → null, scope merge, entity_type.  
- Public routes: home, charts, movers, profiles, methodology, about, FAQ, legal, 404.  
- Admin screens exist (watchlist, import trigger, rebuild, jobs, audit).  
- Shared constants: chart keys, algorithm, entity types.  
- Helmet + CORS allowlist + Fastify rate limit on the API.  
- No Instagram scraping in the architecture.  
- Privacy/terms pages exist (not “live on prod” yet).

---

**Bottom line for the team:** we have a **demo-shaped app**, not a **Phase 12 product**. Close the P0 list first; that is the work that makes the master plan true.
