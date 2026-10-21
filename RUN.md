# IGshorts — run & test (Windows PowerShell)

Open these from the repo root: `D:\IGShorts_ProjectAWS`

## Daily start (already installed, data already imported)

```powershell
# 1. Docker Desktop must be running, then:
docker compose up -d postgres

# 2. One command starts API (:4000) + web (:3000)
pnpm dev
```

Or two terminals:

```powershell
pnpm dev:api
```

```powershell
pnpm dev:web
```

Wait until you see `Server running` (API) and `Ready` (web).

| What | URL |
|---|---|
| Site | http://localhost:3000 |
| Global 100 | http://localhost:3000/charts/global |
| India 100 | http://localhost:3000/charts/india |
| Watchlist | http://localhost:3000/profiles |
| API health | http://localhost:4000/api/v1/health |
| Admin | http://localhost:3000/admin/login |

Admin bootstrap (local only): `admin@localhost` / `change-me-now`

---

## First time only (or after a wipe)

```powershell
pnpm install

# Env files (skip if they already exist)
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local

docker compose up -d postgres

pnpm build:shared
pnpm db:generate
pnpm db:migrate
```

Seed + rank (only if charts are empty):

```powershell
pnpm --filter @igshorts/api build
pnpm seed:import
pnpm job:pipeline
```

Optional Wikipedia portraits (rate-limited — do not spam):

```powershell
pnpm --filter @igshorts/api enrich:portraits
```

Then `pnpm dev`.

---

## Quick checks

```powershell
docker compose ps
curl http://localhost:4000/api/v1/health
curl http://localhost:3000
```

```powershell
# Postgres only
docker compose up -d postgres

# Stop API + web containers if you used full compose
docker compose stop api web
```

---

## If it will not start

```powershell
# Port 4000 or 3000 already in use
netstat -ano | findstr ":4000"
netstat -ano | findstr ":3000"
# then: taskkill /PID <pid> /F

# Prisma generate locked by Nest watch
# stop the API terminal first, then:
pnpm db:generate

# Docker daemon not running
# start Docker Desktop, wait until it is Ready, then:
docker compose up -d postgres
```

---

## Stop

- API / web: `Ctrl+C` in those terminals
- Postgres: `docker compose stop postgres`
