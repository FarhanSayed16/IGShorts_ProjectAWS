# IGshorts Monorepo

> Public dashboard of famous Instagram people ranked by public follower count (India + Global watchlist).  
> Designed as Billboard × CoinMarketCap × Medium.

## Architecture & Documentation

- [Master Plan](docs/IGShorts_Master_Plan.md) — 12-Phase roadmap and locked decisions
- [Execution Checklist](docs/IGShorts_Execution_Checklist.md) — Phase-by-phase completion verification
- [Backend Plan](docs/IGShorts_Backend_Plan.md) — NestJS modules, REST APIs, Prisma schema, ingestion adapters
- [Frontend Plan](docs/IGShorts_Frontend_Plan.md) — Next.js pages, design tokens, responsive tables, motion catalog
- [Tech Stack Plan](docs/IGShorts_Tech_Stack_Plan.md) — Locked stack details & AWS ap-south-1 mapping
- [Architecture Diagrams](architecture/) — PlantUML system diagrams
- [Ops runbook](docs/IGShorts_Ops_Runbook.md) — job fail, restore drill, rollback

## Monorepo Layout

```text
IGShorts_ProjectAWS/
├── apps/
│   ├── web/             # Next.js 15 App Router web application
│   └── api/             # NestJS REST API (/api/v1) and background worker
├── packages/
│   ├── shared/          # Shared DTOs, interfaces, constants, and ranking types
│   └── db/              # Prisma schema, migrations, and database client
├── infra/               # AWS CDK (TypeScript) infrastructure definition
├── docs/                # Architectural, execution, and research documents
└── architecture/        # System diagrams (.puml)
```

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js >= 22 (tested with Node v24)
- pnpm >= 9 (tested with pnpm v11)
- Docker & Docker Compose (for local PostgreSQL 16)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Database

```bash
docker compose up -d postgres
```

PostgreSQL will run on `localhost:5432` (database: `igshorts_db`, user: `igshorts`, password: `igshorts_dev_password`).

`docker compose up` without a service name also builds the API and web images. Use the `postgres` service only when developing with `pnpm dev`.

### 4. Setup Environment Files

```bash
# In apps/api:
cp apps/api/.env.example apps/api/.env

# In apps/web:
cp apps/web/.env.example apps/web/.env
```

### 5. Build Shared Packages & Run Database Migrations

```bash
pnpm build:shared
pnpm db:generate
pnpm db:migrate
```

### 6. Start Development Servers

Run both API and Web concurrently:

```bash
pnpm dev
```

Or run individually:

- API: `pnpm dev:api` (accessible at http://localhost:4000, health at http://localhost:4000/api/v1/health)
- Web: `pnpm dev:web` (accessible at http://localhost:3000)

## Engineering Conventions

- **Language**: TypeScript with `strict: true` across all packages
- **API Prefix**: All public & internal routes are namespaced under `/api/v1`
- **Data Integrity**: Append-only metric snapshots; null follower counts are never converted to zero; ranks are computed.
