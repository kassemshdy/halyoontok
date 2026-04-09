# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HalyoonTok is a child-safe, Arabic-first short-video platform for children under 15 (primary focus: ages 8-12). It is a full **content operating system** with four layers:

1. **Kids Web App** — short-video feed on web (`frontend/apps/web/` — Next.js)
2. **Kids Mobile App** — short-video feed on mobile (`frontend/apps/mobile/` — Expo / React Native)
3. **Admin Dashboard** — studio + parent controls (`frontend/apps/admin/` — Next.js)
4. **API Backend** — all business logic (`backend/` — FastAPI + SQLAlchemy + Celery)

All content is controlled: AI-generated, Halyoon Studio produced, or created by trusted operators. **No open public upload system.**

## Implementation Patterns

Architecture is based on [Onyx](https://github.com/onyx-dot-app/onyx) (formerly Danswer). See `PATTERNS.md` for detailed code patterns with examples. Follow those patterns for all new code.

## Commands

### Frontend (all apps)
```bash
cd frontend
pnpm install                                # Install all frontend dependencies
pnpm dev                                    # Run all apps in parallel (Turborepo)
pnpm build                                  # Build all apps
pnpm lint                                   # Lint all apps
```

### Individual apps
```bash
cd frontend/apps/admin && pnpm dev          # Admin dashboard (port 3000)
cd frontend/apps/web && pnpm dev            # Kids web app (port 3001)
cd frontend/apps/mobile && pnpm start       # Kids mobile app (Expo)
```

### Backend
```bash
cd backend
pip install -r requirements/dev.txt          # Install dependencies
uvicorn halyoontok.main:app --reload         # Run API server (port 8080)
alembic upgrade head                         # Run DB migrations
alembic revision -m "description"            # Create new migration
celery -A halyoontok.background.celery.apps.primary worker -l info -Q primary   # Primary worker
celery -A halyoontok.background.celery.apps.media worker -l info -Q media       # Media worker
pytest                                       # Run tests
ruff check .                                 # Lint
```

### Docker (full stack)
```bash
docker compose up                           # Postgres + Redis + API + Celery workers
```

## Architecture

### Repository Structure
```
frontend/                       # Turborepo + pnpm monorepo
├── apps/
│   ├── web/                    # Next.js — Kids web app (like tiktok.com)
│   ├── admin/                  # Next.js — Studio + Parent dashboard
│   └── mobile/                 # Expo/React Native — Kids mobile app
├── packages/
│   ├── shared-types/           # TypeScript types (Video, Feed, Profile, etc.)
│   ├── api-client/             # HalyoonApiClient shared by all 3 apps
│   └── constants/              # Categories, languages, dialects, age bands
├── pnpm-workspace.yaml
├── turbo.json
└── package.json

backend/                        # Python FastAPI backend
├── halyoontok/
│   ├── main.py                 # FastAPI app factory + router registration
│   ├── configs/                # Centralized env-var config (app_configs.py, constants.py)
│   ├── auth/                   # JWT auth, password hashing, role-based permissions
│   ├── db/
│   │   ├── models.py           # All SQLAlchemy models (single file, like Onyx)
│   │   ├── engine/             # SqlEngine singleton, session management
│   │   └── *.py                # Query functions split by domain
│   ├── server/                 # FastAPI routers organized by domain
│   │   ├── auth/               # Register, login
│   │   ├── profiles/           # Child profile CRUD
│   │   ├── content/            # Video CRUD
│   │   ├── feed/               # Feed + watch events
│   │   ├── studio/             # Content ideas, workflow
│   │   ├── moderation/         # Review queue, decisions
│   │   ├── media/              # File upload
│   │   ├── trends/             # Trend signals
│   │   ├── parent_controls/    # Watch limits, rules
│   │   └── analytics/          # Metrics
│   ├── background/celery/      # Celery workers + tasks
│   │   ├── apps/               # Worker apps (primary, media)
│   │   ├── configs/            # Per-worker Celery config
│   │   └── tasks/              # Task definitions (media_processing, moderation, publishing)
│   ├── error_handling/         # HalyoonError + error codes (never use raw HTTPException)
│   └── file_store/             # S3-compatible storage abstraction
├── alembic/                    # DB migrations
└── requirements/               # base.txt, dev.txt
```

### Tech Stack
- **Frontend:** Turborepo + pnpm workspaces, Next.js 15, React 18, TypeScript, Tailwind CSS, Expo/React Native
- **Backend:** Python 3.12, FastAPI, SQLAlchemy + Alembic, Celery + Redis, Pydantic
- **Data:** PostgreSQL, Redis, S3-compatible storage
- **Media:** FFmpeg, HLS/DASH streaming
- **AI:** LLMs (scripts, metadata, moderation), TTS (Arabic MSA/Lebanese/Iraqi + English), STT, embeddings
- **Reference:** Architecture patterns inspired by [Onyx](https://github.com/onyx-dot-app/onyx) (formerly Danswer)

### Shared Packages
All three frontend apps import from shared packages:
- `@halyoontok/shared-types` — TypeScript interfaces mirroring backend Pydantic models
- `@halyoontok/api-client` — `HalyoonApiClient` class with typed methods for every API endpoint
- `@halyoontok/constants` — Categories, languages, dialects, age bands with Arabic labels

### Key Patterns (from Onyx)
- **All DB queries in `db/`** — never run queries outside `db/*.py` files
- **Error handling:** Always raise `HalyoonError(HalyoonErrorCode.X)`, never raw `HTTPException`
- **Celery tasks:** Always use `@shared_task` with `expires=` parameter
- **Config:** All env vars centralized in `configs/app_configs.py`
- **Models:** Single `db/models.py` file for all SQLAlchemy models (avoids circular imports)
- **API routers:** One subdirectory per domain under `server/`, each with `api.py`
- **Frontend API calls:** Proxied through Next.js rewrites to backend — never call backend directly

### Core Domain Models
- **User** → parent accounts with roles (PARENT, ADMIN, MODERATOR, EDITOR)
- **ChildProfile** → linked to parent, with age/language/dialect/country
- **Video** → content with status workflow, category, language, educational/entertainment scores
- **VideoAsset** → S3-stored media files (raw, HLS, thumbnails, subtitles, audio)
- **ModerationDecision** → safety classification per video
- **TrendSignal** → ingested trend data from approved sources
- **ContentIdea** → production-ready concepts linked to trends
- **WatchEvent** → engagement tracking per child per video
- **ParentalRule** → per-child controls (time limits, categories, education priority)

### Safety Architecture (6 Layers)
1. **Source governance** — only approved channels/sources
2. **Prompt constraints** — policy-safe AI generation templates
3. **Automated moderation** — text, audio, visual classifiers
4. **Human moderation** — every publishable item reviewed in MVP
5. **Post-publish monitoring** — anomaly detection, parent reports
6. **Feed-level enforcement** — age/language/parent-rule filters on serving

## Localization

Arabic is **not** a single content bucket. Every content item needs:
- Primary language + dialect (MSA, Lebanese, Iraqi)
- Subtitle language
- Country fit (Lebanon first, then Iraq, then broader MENA)
- Age fit and cultural relevance metadata

## Key Domain Concepts

- **Trend adaptation** — adapt trends (format, pacing, hooks) into original child-safe variations; never duplicate
- **Educational injection** — learning content uses same visual grammar as entertainment, inserted between entertaining clips
- **Content workflow:** DRAFT → AI_GENERATED → AWAITING_EDITOR → AWAITING_MODERATION → CHANGES_REQUESTED → APPROVED → SCHEDULED → PUBLISHED → ARCHIVED

## Privacy & Security

Children's platform — minimal data collection, strong RBAC, audit logging, parental consent flows, secure media delivery. Do not collect unnecessary personal data.
