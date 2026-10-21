# IGshorts — terminal commands (Windows PowerShell)

Repo root: `D:\IGShorts_ProjectAWS`

Use this file every time you want to run or test locally.  
Cloud database `igshorts` is ready; Vercel still needs an API host — see `DEPLOY.md`.

---

## Daily start (data already in local Docker Postgres)

```powershell
# Docker Desktop must be running
docker compose up -d postgres

# API :4000 + web :3000
pnpm dev
```

Wait for `Server running` (API) and `Ready` (web).

| What | URL |
|---|---|
| Site | http://localhost:3000 |
| Global 100 | http://localhost:3000/charts/global |
| India 100 | http://localhost:3000/charts/india |
| Watchlist | http://localhost:3000/profiles |
| Movers | http://localhost:3000/movers |
| Methodology | http://localhost:3000/methodology |
| API health | http://localhost:4000/api/v1/health |
| API ready (DB) | http://localhost:4000/api/v1/health/ready |
| Admin | http://localhost:3000/admin/login |

Local admin: `admin@localhost` / `change-me-now`

Two terminals instead of `pnpm dev`:

```powershell
pnpm dev:api
```

```powershell
pnpm dev:web
```

---

## First time only (or after a database wipe)

```powershell
pnpm install

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
curl.exe http://localhost:4000/api/v1/health
curl.exe http://localhost:4000/api/v1/health/ready
curl.exe "http://localhost:4000/api/v1/charts/global_persons?limit=1"
curl.exe -o NUL -w "web:%{http_code}`n" http://localhost:3000/
```

---

## If it will not start

```powershell
netstat -ano | findstr ":4000"
netstat -ano | findstr ":3000"
# taskkill /PID <pid> /F

# Prisma generate locked by Nest watch — stop API first
pnpm db:generate

# Docker not running — start Docker Desktop, wait until Ready
docker compose up -d postgres
```

---

## Stop

- API / web: `Ctrl+C` in those terminals
- Postgres: `docker compose stop postgres`
