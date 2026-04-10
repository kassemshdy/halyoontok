# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HalyoonTok is a child-safe, Arabic-first short-video platform for children under 15 (primary focus: ages 8-12). It is a full **content operating system** with four layers:

1. **Kids Web App** — short-video feed on web (`frontend/apps/web/` — Next.js)
2. **Kids Mobile App** — short-video feed on mobile (`frontend/apps/mobile/` — Expo / React Native)
3. **Admin Dashboard** — studio + parent controls (`frontend/apps/admin/` — Next.js)
4. **Backend** — 4 FastAPI services + shared Python package (`backend/`)

All content is controlled: AI-generated, Halyoon Studio produced, or created by trusted operators. **No open public upload system.**

## Implementation Patterns

See `PATTERNS.md` for detailed code patterns with examples. Follow those patterns for all new code.

## Commands

### Frontend (all apps)
```bash
cd frontend
pnpm install                                # Install all frontend dependencies
pnpm dev                                    # Run all apps in parallel (Turborepo)
pnpm build                                  # Build all apps
pnpm lint                                   # Lint all apps
```

### Individual frontend apps
```bash
cd frontend/apps/admin && pnpm dev          # Admin dashboard (port 3000)
cd frontend/apps/web && pnpm dev            # Kids web app (port 3001)
cd frontend/apps/mobile && pnpm start       # Kids mobile app (Expo)
```

### Backend services (run from backend/ directory)
```bash
cd backend
pip install -e shared/                       # Install shared package
cd admin-api && uvicorn app.main:app --port 8080 --reload    # Admin API
cd front-api && uvicorn app.main:app --port 8081 --reload    # Public API
cd upload-api && uvicorn app.main:app --port 8082 --reload   # Upload API
cd media-api && uvicorn app.main:app --port 8083 --reload    # Media server (dev)
```

### Database
```bash
cd backend
alembic upgrade head                         # Run migrations
alembic revision -m "description"            # Create migration
python scripts/seed_demo_videos.py           # Seed demo data
```

### Docker (full stack)
```bash
docker compose up                           # Postgres + Redis + 4 API services
```

## Architecture

### Backend — 4 Services + Shared Package

| Service | Port | Auth | Purpose |
|---------|------|------|---------|
| **admin-api** | 8080 | Required (admin/mod/editor) | Content CRUD, moderation, studio, analytics, users |
| **front-api** | 8081 | Mixed (public + auth) | Feed (public), auth, profiles, interactions, parent controls |
| **upload-api** | 8082 | Required | Video/image upload, resize, thumbnail generation |
| **media-api** | 8083 | None | File serving (dev only — prod uses Cloudflare R2 CDN) |

```
backend/
├── shared/halyoontok/          # Shared Python package (all services import from here)
│   ├── db/                     # Models, engine, query functions
│   ├── auth/                   # JWT, permissions, schemas
│   ├── configs/                # App configs, constants, enums
│   ├── error_handling/         # HalyoonError + error codes
│   ├── storage/                # StorageBackend interface (LocalStorage + R2Storage)
│   └── utils/                  # Logger, helpers
├── admin-api/app/              # Routers: content, moderation, studio, analytics, trends, users
├── front-api/app/              # Routers: feed, auth, profiles, interactions, parent_controls
├── upload-api/app/             # Routers: upload (video + image), resize module
├── media-api/app/              # Routers: serve (videos, thumbnails, images)
├── alembic/                    # DB migrations
└── scripts/                    # Seed scripts
```

### Storage Backend
- `STORAGE_BACKEND=local` (default) — files saved to `media-api/storage/`, served by media-api
- `STORAGE_BACKEND=r2` (prod) — files uploaded to Cloudflare R2, served via CDN

### Frontend — Turborepo + pnpm Monorepo

```
frontend/
├── apps/
│   ├── web/                    # Kids web app — proxies to front-api (:8081)
│   ├── admin/                  # Admin dashboard — proxies to admin-api (:8080) + upload-api (:8082)
│   └── mobile/                 # Kids mobile app (Expo)
├── packages/
│   ├── shared-types/           # TypeScript types mirroring backend models
│   ├── api-client/             # HalyoonApiClient shared by all apps
│   └── constants/              # Categories, languages, dialects with Arabic labels
```

### Key Rules
- **All DB queries in `shared/halyoontok/db/`** — never run queries outside db/*.py
- **Error handling:** Always raise `HalyoonError(HalyoonErrorCode.X)`, never raw `HTTPException`
- **Models:** Single `db/models.py` in shared — all services use the same models
- **Frontend API calls:** Proxied through Next.js rewrites — never call backend directly
- **New endpoint?** Decide which service it belongs to based on auth requirements

### Core Domain Models
- **User** → roles: PARENT, ADMIN, MODERATOR, EDITOR
- **ChildProfile** → linked to parent, with age/language/dialect/country
- **Video** → content with status workflow, category, educational/entertainment scores
- **VideoAsset** → stored media files (video, HLS, thumbnails, subtitles, audio)
- **ModerationDecision** → safety classification per video
- **TrendSignal** → ingested trend data from approved sources
- **ContentIdea** → production-ready concepts linked to trends
- **WatchEvent** → engagement tracking per child per video
- **ParentalRule** → per-child controls (time limits, categories, education priority)

### Content Workflow
```
DRAFT → AWAITING_MODERATION → APPROVED → PUBLISHED → ARCHIVED
                ↓
        CHANGES_REQUESTED → AWAITING_MODERATION (resubmit)
```

## Localization

Arabic is **not** a single content bucket. Every content item needs:
- Primary language + dialect (MSA, Lebanese, Iraqi)
- Subtitle language
- Country fit (Lebanon first, then Iraq, then broader MENA)

## Privacy & Security

Children's platform — minimal data collection, strong RBAC, audit logging, parental consent flows.
