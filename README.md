# HalyoonTok

A safe, Arabic-first short-video platform for children — where fun and learning live in the same feed.

## What is HalyoonTok?

HalyoonTok is a controlled content platform for kids under 15. Unlike open social platforms, all content is either AI-generated, studio-produced, or created by trusted operators. There are no public uploads.

The platform adapts trending formats into original, child-safe content and intelligently injects educational clips between entertaining ones.

**Target markets:** Lebanon, Iraq, broader MENA region
**Primary age group:** 8–12
**Languages:** Arabic (MSA, Lebanese, Iraqi dialects) + English

## Architecture

```
frontend/                    Turborepo + pnpm monorepo
├── apps/
│   ├── web/                 Kids web app (Next.js)
│   ├── admin/               Studio + Parent dashboard (Next.js)
│   └── mobile/              Kids mobile app (Expo / React Native)
├── packages/
│   ├── shared-types/        TypeScript types shared across apps
│   ├── api-client/          API client shared across apps
│   └── constants/           Categories, languages, dialects

backend/                     Python FastAPI
├── halyoontok/
│   ├── server/              API routers (auth, content, feed, studio, moderation, etc.)
│   ├── db/                  SQLAlchemy models + queries
│   ├── background/celery/   Celery workers (media processing, moderation, publishing)
│   ├── auth/                JWT auth + role-based permissions
│   └── configs/             Centralized configuration
├── alembic/                 Database migrations
└── requirements/            Python dependencies
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS, Expo/React Native |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic, Pydantic |
| Workers | Celery + Redis |
| Database | PostgreSQL |
| Storage | S3-compatible (MinIO / AWS S3) |
| Media | FFmpeg, HLS/DASH streaming |
| Monorepo | Turborepo + pnpm workspaces |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Backend

```bash
cd backend
pip install -r requirements/dev.txt
```

Start Postgres and Redis:
```bash
docker compose up postgres redis -d
```

Run migrations and start the API:
```bash
cd backend
alembic upgrade head
uvicorn halyoontok.main:app --reload
```

API available at `http://localhost:8080`. Docs at `http://localhost:8080/docs`.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

| App | URL |
|-----|-----|
| Admin (Studio + Parents) | http://localhost:3000 |
| Web (Kids feed) | http://localhost:3001 |
| Mobile | Expo dev server |

### Full Stack (Docker)

```bash
docker compose up
```

Starts: Postgres, Redis, API server, Celery primary worker, Celery media worker.

## Project Structure

### Backend Services

| Domain | Routes | Purpose |
|--------|--------|---------|
| Auth | `/api/auth/*` | Register, login, JWT tokens |
| Profiles | `/api/profiles/*` | Child profile CRUD |
| Content | `/api/content/*` | Video management |
| Feed | `/api/feed/*` | Personalized feed + watch events |
| Studio | `/api/studio/*` | Content ideas, workflow |
| Moderation | `/api/moderation/*` | Review queue, decisions |
| Media | `/api/media/*` | File upload |
| Trends | `/api/trends/*` | Trend signals |
| Parent Controls | `/api/parent-controls/*` | Watch limits, rules |
| Analytics | `/api/analytics/*` | Metrics |

### Content Workflow

```
DRAFT → AI_GENERATED → AWAITING_EDITOR → AWAITING_MODERATION
    → CHANGES_REQUESTED → APPROVED → SCHEDULED → PUBLISHED → ARCHIVED
```

### Safety (6 Layers)

1. Source governance — only approved channels
2. Prompt constraints — policy-safe AI generation
3. Automated moderation — text, audio, visual classifiers
4. Human moderation — every item reviewed before publish
5. Post-publish monitoring — anomaly detection
6. Feed-level enforcement — age/language/parent-rule filters

## Development

### Linting

```bash
cd backend && ruff check .           # Python
cd frontend && pnpm lint             # TypeScript
```

### Testing

```bash
cd backend && pytest -xv             # Backend tests
cd frontend/apps/admin && npx playwright test   # E2E tests
```

### Database Migrations

```bash
cd backend
alembic revision -m "description"    # Create migration
alembic upgrade head                 # Apply migrations
```

## Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI coding tool instructions (Claude Code) |
| `AGENTS.md` | AI coding tool instructions (Cursor) — symlink to CLAUDE.md |
| `PATTERNS.md` | Implementation patterns with code examples |
| `AI-ASSISTED.md` | Guide to AI tooling setup in this repo |
| `halyoontok_project_plan.md` | Full product and technical plan |

## License

Private — All rights reserved.
