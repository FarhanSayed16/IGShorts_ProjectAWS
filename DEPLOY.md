# IGshorts — deploy readiness

**Local MVP works.** Cloud **database is now ready** on a **separate** Postgres database named `igshorts`.  
**Vercel-only deploy is still not enough** — the Nest API needs its own host.

---

## What I did with the keys you pasted

The URL you sent belongs to the same Supabase project as BillPush (`wixhshvrgojmgdsfzemi`). I did **not** write IGshorts into `schema=billpush` or into the `postgres` database.

| Existing (untouched) | New (IGshorts only) |
|---|---|
| Database `postgres` → schemas `billpush`, `kbc_game`, `swachhcity`, `public` | Database **`igshorts`** (empty except our tables) |

Created `CREATE DATABASE igshorts`, then migrated and seeded **only there**. BillPush tables are still present (`stores`, `invoices`, `users`, …).

### Cloud data check (just now)

| Check | Result |
|---|---|
| Database name | `igshorts` |
| Tables | `creator_profiles`, `metric_snapshots`, `ranking_runs`, `ranking_entries`, … |
| Profiles | 331 |
| Portraits / bios copied from local | 182 |
| Global 100 | `#1 Cristiano Ronaldo` 680M · 125 ranked |
| India 100 | `#1 Virat Kohli` 271.2M · 69 ranked |
| BillPush schema | unchanged |

Production connection string must use **`/igshorts`**, not `/postgres` and not `schema=billpush`:

```text
DATABASE_URL=postgresql://postgres.wixhshvrgojmgdsfzemi:[DB-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/igshorts?sslmode=require
```

Local `pnpm dev` still uses Docker Postgres (`RUN.md`). That is intentional.

---

## Redis / Upstash / S3 / BillPush JWT

**Not used by IGshorts. Do not plug those in.**

| You pasted | IGshorts |
|---|---|
| `REDIS_URL` (Upstash) | Not in this repo. Ranking jobs run inside Nest. |
| `JWT_SECRET` / refresh JWT | Different app. We use `ADMIN_JWT_SECRET`. |
| `S3_BUCKET_NAME` | Seed Excel lives in the repo. Not required for MVP. |
| `PORT=3000` | API listens on **4000**. Web is 3000. |

You do **not** need to give me Upstash keys.

**Rotate the secrets you pasted in chat** on the BillPush project when you can: database password, `JWT_SECRET`, Upstash Redis URL, and the earlier service_role key. They are full-access credentials.

---

## Vercel is only the website

This repo is two apps:

| App | Stack | Where it can live |
|---|---|---|
| `apps/web` | Next.js 15 | **Vercel** — good fit |
| `apps/api` | NestJS on port 4000 | **Not Vercel.** Needs an always-on Node host |

```text
Browser  →  Vercel (Next.js)
              │
              └── NEXT_PUBLIC_API_URL=https://<api-host>/api/v1

API      →  Render / Railway / Fly.io  (Nest)
              │
              └── DATABASE_URL=...pooler...:5432/igshorts?sslmode=require
```

**Next thing you need:** a Render (or Railway/Fly) account for the API. Suggested: [Render Web Service](https://render.com/) from `apps/api/Dockerfile`.

When we deploy:

**Vercel (`apps/web`)**

```text
NEXT_PUBLIC_API_URL=https://igshorts-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://igshorts.vercel.app
API_INTERNAL_URL=https://igshorts-api.onrender.com/api/v1
```

**Render (`apps/api`)**

```text
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres.wixhshvrgojmgdsfzemi:[DB-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/igshorts?sslmode=require
CORS_ORIGIN=https://igshorts.vercel.app
PROVIDER=seed
ADMIN_JWT_SECRET=<new long random — not the BillPush JWT>
ADMIN_BOOTSTRAP_EMAIL=<your email>
ADMIN_BOOTSTRAP_PASSWORD=<strong password>
CRON_ENABLED=false
```

Do not reuse `JWT_SECRET=billpush-...` or `admin@localhost` / `change-me-now` in production.

Small code tweak at deploy time: Next `output: 'standalone'` is for Docker; Vercel may need that gated off.

---

## Verdict

| Ready? | Item |
|---|---|
| Yes | Local run & demo (`RUN.md`) |
| Yes | Isolated cloud database `igshorts` (tables + seed + ranks) |
| Yes | No Redis / Upstash / BillPush S3 |
| Yes | BillPush / other schemas left alone |
| No | Vercel-only deploy |
| Blocked on you | **API host** (Render / Railway / Fly), then Vercel for the site |

Database work is done. Say when you have a Render (or Railway/Fly) account and we can deploy the API, then the Vercel frontend.
