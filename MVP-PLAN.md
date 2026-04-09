# HalyoonTok MVP Plan — Phased Roadmap

## Context

HalyoonTok has a solid foundation: database schema, JWT auth, public video feed with TikTok-style UI, and a frontend monorepo. However, the backend is a single monolith, admin pages are stubs, media upload is a mock, and there's no deployment config.

**Goal:** Restructure backend into 4 dedicated API services + shared package, build functional admin + web apps, deploy to Railway.

---

## Backend Architecture

```
backend/
├── shared/                    # Shared Python package
│   ├── halyoontok/
│   │   ├── db/                # Models, engine, query functions
│   │   ├── auth/              # JWT, permissions, schemas
│   │   ├── configs/           # App configs, constants
│   │   ├── error_handling/    # HalyoonError, error codes
│   │   ├── storage/           # StorageBackend interface (Local + R2)
│   │   └── utils/             # Logger, helpers
│   └── pyproject.toml
│
├── admin-api/                 # Port 8080 — ALL auth-required (admin/moderator/editor)
│   ├── app/main.py
│   └── app/routers/           # content, moderation, studio, analytics, trends, users
│
├── front-api/                 # Port 8081 — public + auth-gated
│   ├── app/main.py
│   └── app/routers/           # feed, auth, profiles, interactions, parent_controls
│
├── upload-api/                # Port 8082 — ALL auth-required
│   ├── app/main.py
│   └── app/routers/           # upload (video + image), resize
│
├── media-api/                 # Port 8083 — ALL public, no auth, no DB (dev only)
│   ├── app/main.py
│   ├── app/routers/           # serve (videos, thumbnails, images)
│   └── storage/               # Local file storage
│
├── alembic/                   # DB migrations (uses shared)
├── scripts/                   # Seed scripts
└── docker-compose.yml
```

### Service Responsibilities

| Service | Port | Auth | DB | Purpose |
|---------|------|------|-----|---------|
| admin-api | 8080 | Required (admin/mod/editor) | Read/Write | Content management, moderation, studio, analytics |
| front-api | 8081 | Mixed (public + auth) | Read/Write | Feed, auth, profiles, interactions, parent controls |
| upload-api | 8082 | Required | Write | Video/image upload, resize, create VideoAsset |
| media-api | 8083 | None | None | File serving (dev only — prod uses Cloudflare R2 CDN) |

### Storage Backend (Cloudflare R2 + CDN)

```python
# shared/halyoontok/storage/
class StorageBackend:
    def upload(file_bytes, key, content_type) -> url
    def get_url(key) -> url
    def delete(key)

class LocalStorage(StorageBackend):     # Dev — saves to media-api/storage/
class R2Storage(StorageBackend):        # Prod — uploads to Cloudflare R2 via S3 API
```

- Switched via `STORAGE_BACKEND=local` (default) or `STORAGE_BACKEND=r2`
- Prod: upload-api → R2, front-api returns CDN URLs, no media-api needed
- Dev: upload-api → local filesystem, media-api serves files
- R2 benefits: zero egress fees, automatic CDN, S3-compatible, 10GB free tier

### Architecture Diagram

```
┌──────────┐     ┌──────────────┐
│  Admin   │     │   Kids Web   │
│  :3000   │     │   :3001      │
└────┬─────┘     └──────┬───────┘
     │                  │
     ▼                  ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│admin-api │     │front-api │     │upload-api│     │media-api/R2  │
│  :8080   │     │  :8081   │     │  :8082   │     │ :8083 / CDN  │
│ secured  │     │ mixed    │     │ secured  │     │ public       │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └──────────────┘
     │                │                │
     └───────┬────────┘                │
             ▼                         ▼
      ┌──────────┐  ┌─────┐    ┌─────────────┐
      │ Postgres │  │Redis│    │  storage/   │
      │  :5432   │  │:6379│    │  (local/R2) │
      └──────────┘  └─────┘    └─────────────┘
```

---

## Phase 1: Backend Restructure + Media Service (Week 1-2)

### 1.1 Create shared package
- Move existing modules (`db/`, `auth/`, `configs/`, `error_handling/`, `utils/`) to `backend/shared/halyoontok/`
- Add `storage/` module with `StorageBackend`, `LocalStorage`, `R2Storage`
- `pyproject.toml` with editable install support

### 1.2 Create admin-api
- FastAPI app with routers: content, moderation, studio, analytics, trends, users
- Add `PATCH /content/videos/{id}/status` — workflow state transitions
- Add `POST /studio/ideas/{id}/to-video` — convert idea to draft video
- All endpoints require admin/moderator/editor roles

### 1.3 Create front-api
- FastAPI app with routers: feed (public), auth (public), profiles (auth), interactions (auth), parent_controls (auth)
- Feed returns video URLs pointing to media-api (dev) or R2 CDN (prod)

### 1.4 Create upload-api
- `POST /video` — accept MP4, save via StorageBackend, generate thumbnail (FFmpeg), create VideoAsset
- `POST /image` — accept JPG/PNG, save original + 360px thumbnail (Pillow), create VideoAsset
- All endpoints auth-required

### 1.5 Create media-api
- `GET /videos/{filename}` — serve with `Accept-Ranges` (video seeking)
- `GET /thumbnails/{filename}`, `GET /images/{filename}`
- `Cache-Control: public, max-age=86400`
- Dev only — prod uses Cloudflare CDN

### 1.6 Docker Compose + Seed
- 4 API services + Postgres + Redis, shared storage volume
- Update seed script for new architecture
- Alembic at `backend/` root, imports from shared

---

## Phase 2: Admin Dashboard (Week 2-3)

### 2.1 Layout & Auth
- Sidebar navigation component
- Admin login page + auth context (JWT in localStorage)
- Next.js rewrite proxy to admin-api + upload-api

### 2.2 Content Management
- Video list with status badges, category filters
- Upload page: title, description, category, language, dialect, file upload
- Video detail page with workflow status buttons

### 2.3 Moderation Queue
- List videos awaiting moderation with video preview
- Approve / Reject / Request Changes buttons

### 2.4 Studio, Analytics, Parents
- Content ideas list + create form
- Analytics stat cards (total videos, watches, watch time)
- Child profiles list + parental rules editor

---

## Phase 3: Web App Polish (Week 3-4)

### 3.1 Auth Flow
- Login + register pages
- Auth context with token persistence
- Wire VideoActions to real API calls

### 3.2 Like/Favorite
- `VideoLike` + `VideoFavorite` DB models + Alembic migration
- `POST /feed/like`, `POST /feed/favorite` toggle endpoints (auth required)

### 3.3 Categories + Navigation
- Category filter page (`/categories/[category]`)
- Bottom navigation bar (Home / Categories / Profile)

### 3.4 UI Polish
- Loading skeletons, smoother transitions
- RTL text fixes, mobile-responsive layout

---

## Phase 4: Railway Deployment (Week 4-5)

### 4.1 Railway Services (5 — no media-api in prod)

| Service | Source |
|---------|--------|
| admin-api | `backend/admin-api/` |
| front-api | `backend/front-api/` |
| upload-api | `backend/upload-api/` |
| admin (Next.js) | `frontend/apps/admin/` |
| web (Next.js) | `frontend/apps/web/` |

Plus: Railway PostgreSQL + Redis, Cloudflare R2 bucket

### 4.2 Config
- `DATABASE_URL`, `REDIS_URL` from Railway
- `STORAGE_BACKEND=r2` + R2 credentials
- `MEDIA_BASE_URL` → R2 public CDN URL
- Procfile per service, `.env.example`

### 4.3 CI/CD
- `.github/workflows/deploy.yml` — auto-deploy on push to main

---

## Phase 5: Pre-Launch Hardening (Week 5-6)

- Rate limiting on auth, CORS tightening, JWT refresh tokens
- Structured JSON logging, Sentry integration
- DB indexes (Alembic migration), Redis feed caching
- Media Cache-Control headers

---

## GitHub Issues

| # | Title | Depends On | Parallel? |
|---|-------|-----------|-----------|
| 1 | Phase 1: Backend Restructure — 4 API Services + Shared Package | — | — |
| 2 | Phase 2: Admin Dashboard — Content, Moderation, Studio | #1 | Yes (with #3) |
| 3 | Phase 3: Web App — Auth, Interactions, Categories | #1 | Yes (with #2) |
| 4 | Phase 4: Railway Deployment — 5 Services + Cloudflare R2 | #2, #3 | — |
| 5 | Phase 5: Pre-Launch — Security, Logging, Performance | #4 | — |

---

## Deferred (Post-MVP)

- Mobile app (Expo/React Native)
- AI content generation (LLM scripts, idea generation)
- Trend ingestion from external sources
- TTS/STT for Arabic dialects
- HLS adaptive streaming + transcoding pipeline
- Advanced recommendation engine (preference vectors, ML)
- Kubernetes, multi-region

---

## Verification

After each phase:
1. Health checks: all services respond on `/health`
2. `pytest -xv` per service
3. `pnpm lint` in frontend
4. Smoke test: register → login → upload video (admin) → moderate → publish → view in feed
5. Phase 4: same smoke test on Railway URLs
