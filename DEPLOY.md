# IGshorts — Render + Vercel deploy

You will deploy **two services**. Database work is already done.

## Cost — be realistic

| Piece | Plan | Money |
|---|---|---|
| Website | Vercel Hobby | **$0** |
| API | Render Web Service, instance **Free** | **$0** |
| Database | Supabase `igshorts` (already created) | **$0** extra |
| Redis / Upstash | Not used | skip |

Docker on Render is **not a paid add-on**. Docker vs Node is just how the app is built. What costs money is the **instance type**. In the Render form you must pick **Free** ($0, 512 MB). If you pick Starter it is **$7/month**.

Free Render is a **demo**, not 24/7 production:

- Sleeps after **15 minutes** with no traffic
- Next visitor waits **~1 minute** while it wakes
- 512 MB RAM, 0.1 CPU — Nest + Prisma should fit, but it can be tight
- 750 free instance-hours/month (sleeping does not count)
- Render may restart it anytime
- Do **not** create Render Postgres — we already have Supabase. Their free DB expires in 30 days.

If you later want the API always awake: Render Starter **$7/month**. Until then, Free is the honest $0 plan.

```text
You  →  Vercel (Next.js site)
              │
              └── NEXT_PUBLIC_API_URL = https://<render-api>/api/v1

API  →  Render (NestJS Docker)
              │
              └── DATABASE_URL = .../igshorts  (already seeded)
```

Do **not** put Redis, Upstash, BillPush JWT, or S3 on either host.

---

## 0. Before you click Deploy

1. Push this repo to GitHub (`FarhanSayed16/IGShorts_ProjectAWS`). Render and Vercel pull from GitHub.
2. Pick names now (example):
   - Render service: `igshorts-api` → `https://igshorts-api.onrender.com`
   - Vercel project: `igshorts` → `https://igshorts.vercel.app`
3. Cloud DB is ready: database **`igshorts`** (not `postgres`, not `schema=billpush`).

If those public URLs end up different, just paste the real ones into the env vars below.

---

## 1. Render — API first

[https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → this GitHub repo.

| Setting | Value |
|---|---|
| Runtime | **Docker** |
| Branch | `main` |
| Root Directory | **leave empty** |
| Dockerfile | repo-root `Dockerfile` (this Render form has no Dockerfile Path field) |
| Instance type | **Free** — not Starter ($7). Look for $0 / 512 MB |

**Advanced (this screen):**

| Field | Value |
|---|---|
| Secret Files | skip |
| Environment groups | skip |
| Health Check Path | `/api/v1/health` (not `/healthz`) |
| Pre-Deploy Command | leave empty |
| Auto-Deploy | On Commit |
| Build Filters | leave empty |

**Do not set `PORT`.** Render injects it. The app already binds `0.0.0.0`.

Copy env vars from **`deploy.env`** at the repo root (gitignored). Paste them as **Environment Variables** on Render, not Secret Files.

`DATABASE_URL` must end with **`/igshorts`**.  
First admin already exists on that database (`admin@localhost`). Bootstrap only runs if the table is empty, so those two bootstrap vars are a safety net.

Health check path: `/api/v1/health`

Deploy, then in the browser:

```text
https://igshorts-api.onrender.com/api/v1/health
https://igshorts-api.onrender.com/api/v1/health/ready
https://igshorts-api.onrender.com/api/v1/charts/global_persons?limit=1
```

You want `status: ok`, `database: connected`, and Ronaldo at rank 1.  
If health is slow the first time, wait ~1 minute (free instance cold start).

Copy the Render URL. You need it for Vercel.

---

## 2. Vercel — website second

[https://vercel.com/new](https://vercel.com/new) → same GitHub repo.

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Include files outside root | **On** (needed for `packages/shared`) |
| Install | `pnpm install` (from repo; Vercel should detect the workspace) |
| Build | `cd ../.. && pnpm --filter @igshorts/shared build && pnpm --filter @igshorts/web build` |
| Output | leave default (Next) |
| Node | **22** |

If Vercel’s Root Directory UI already runs install at the monorepo root, this also works:

```text
Build Command: pnpm --filter @igshorts/shared build && pnpm --filter @igshorts/web build
```

Environment variables (Production + Preview):

```text
NEXT_PUBLIC_API_URL=https://igshorts-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://igshorts.vercel.app
API_INTERNAL_URL=https://igshorts-api.onrender.com/api/v1
```

Deploy. Open:

```text
https://igshorts.vercel.app
https://igshorts.vercel.app/charts/global
https://igshorts.vercel.app/charts/india
```

If charts are empty, the site cannot see the API: check `NEXT_PUBLIC_API_URL` and Render CORS.

---

## 3. Wire CORS if the Vercel URL is not what you guessed

On Render, set `CORS_ORIGIN` to the **exact** Vercel origin (no trailing slash), then **Redeploy** the API.

```text
CORS_ORIGIN=https://igshorts.vercel.app
```

Custom domain later: add both, comma-separated:

```text
CORS_ORIGIN=https://igshorts.vercel.app,https://www.yourdomain.com
```

---

## 4. After it is live — 2-minute check

1. Home shows Global 100 / India 100.
2. `#1` is Ronaldo / Kohli.
3. Watchlist and Methodology load.
4. `https://<render>/api/v1/health/ready` → `database: connected`.
5. Admin login (change that password after first login).

---

## Do not

- Point `DATABASE_URL` at `/postgres` or `schema=billpush`
- Add Redis / Upstash / BillPush `JWT_SECRET` / S3
- Expect Vercel to run the Nest API
- Commit `.env` files

---

## Known tweak

`apps/web/next.config.ts` has `output: 'standalone'` for Docker. If the Vercel build fails on that, say so — it should be gated off for Vercel (`VERCEL` env is set automatically). Local Docker web image can keep standalone.
