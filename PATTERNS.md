# Implementation Patterns

Distilled from [Onyx](https://github.com/onyx-dot-app/onyx) codebase. Follow these patterns for all new HalyoonTok code.

## 1. API Router

One directory per domain under `server/`, each with `api.py`:

```python
# backend/halyoontok/server/{domain}/api.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/{domain}", tags=["{domain}"])

@router.get("/items")
def list_items(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session_dep),
) -> list[ItemRead]:
    return get_items(session, limit, offset)
```

Rules:
- Never use `response_model` — just type the return
- Always inject `session` via `Depends(get_session_dep)`
- Always raise `HalyoonError`, never `HTTPException`
- Register new routers in `main.py` under `APP_API_PREFIX`

## 2. Database Queries

All queries go in `db/{domain}.py`. Never run queries outside `db/`.

```python
# backend/halyoontok/db/{domain}.py
from sqlalchemy.orm import Session
from halyoontok.db.models import SomeModel

def get_item_by_id(session: Session, item_id: int) -> SomeModel | None:
    return session.get(SomeModel, item_id)

def get_items(session: Session, limit: int = 50, offset: int = 0) -> list[SomeModel]:
    return (
        session.query(SomeModel)
        .order_by(SomeModel.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

def create_item(session: Session, item: SomeModel) -> SomeModel:
    session.add(item)
    session.flush()
    return item
```

## 3. Models

All SQLAlchemy models live in **one file**: `db/models.py`. This avoids circular imports.

```python
from sqlalchemy import String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from halyoontok.db.models import Base

class NewModel(Base):
    __tablename__ = "new_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_id: Mapped[int] = mapped_column(ForeignKey("parents.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    parent: Mapped["ParentModel"] = relationship(back_populates="children")
```

## 4. Error Handling

Never use `HTTPException` directly. Always use `HalyoonError`:

```python
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

# Good
raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Video not found")
raise HalyoonError(HalyoonErrorCode.UNAUTHORIZED)

# Bad — never do this
raise HTTPException(status_code=404, detail="Video not found")
```

To add a new error code, add it to `error_handling/error_codes.py`:
```python
NEW_ERROR = ("new_error", 400)
```

## 5. Celery Tasks

Always use `@shared_task` with `expires=`. Put tasks in `background/celery/tasks/`.

```python
# backend/halyoontok/background/celery/tasks/{domain}.py
import logging
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task(expires=3600)
def process_something(item_id: int) -> dict:
    logger.info(f"Processing item {item_id}")
    # Do work here, use get_session() context manager for DB access
    from halyoontok.db.engine.sql_engine import get_session
    with get_session() as session:
        # query and update
        pass
    return {"item_id": item_id, "status": "done"}
```

Rules:
- **Always set `expires=`** — prevents unbounded queue growth
- Use `get_session()` context manager (not `get_session_dep` which is for FastAPI)
- Workers use thread pools, so Celery time limits don't work — implement timeouts in the task itself

## 6. Configuration

All env vars in `configs/app_configs.py`. Never use `os.environ` elsewhere.

```python
# backend/halyoontok/configs/app_configs.py
NEW_SETTING = os.environ.get("NEW_SETTING", "default_value")
```

## 7. Auth & Permissions

```python
from halyoontok.auth.users import current_user
from halyoontok.auth.permissions import require_role, require_moderator
from halyoontok.configs.constants import UserRole

# Any authenticated user
@router.get("/me")
def get_me(user: User = Depends(current_user)) -> UserRead:
    return user

# Specific roles
@router.post("/publish")
def publish(user: User = Depends(require_moderator)) -> dict:
    ...

# Custom role combo
@router.post("/special")
def special(user: User = Depends(require_role(UserRole.ADMIN, UserRole.EDITOR))) -> dict:
    ...
```

## 8. Alembic Migrations

```bash
cd backend
alembic revision -m "add new_table"    # Creates empty migration file
# Then manually write the upgrade/downgrade in the generated file
alembic upgrade head                    # Apply
```

Always write migrations manually — don't use `--autogenerate`.

## 9. Frontend — Shared Packages

All three apps (web, admin, mobile) import from shared packages:

```typescript
import type { Video, FeedVideo } from "@halyoontok/shared-types";
import { HalyoonApiClient } from "@halyoontok/api-client";
import { CATEGORIES, DIALECTS } from "@halyoontok/constants";
```

When adding a new backend model/endpoint:
1. Add Pydantic schema in backend
2. Add matching TypeScript type in `packages/shared-types/src/index.ts`
3. Add API method in `packages/api-client/src/index.ts`
4. All three apps get it automatically

## 10. Frontend — API Calls

Next.js apps (web, admin) proxy API calls through rewrites. Never call backend directly.

```typescript
// Use the shared client (instantiated in each app's src/lib/api.ts)
import { api } from "@/lib/api";

const videos = await api.getVideos();
const feed = await api.getFeed(childProfileId);
```

## 11. Testing

### Backend
```bash
pytest -xv backend/tests/unit                 # Unit tests (mock external deps)
pytest -xv backend/tests/integration          # Integration tests (real DB + Redis)
```

- Prefer integration tests over unit tests with heavy mocking
- Use fixtures from `conftest.py`

### Frontend E2E
```bash
cd frontend/apps/admin && npx playwright test
```

- API-first setup (create test data via API, not UI clicks)
- Use `data-testid` for selectors
- No `page.waitForTimeout()` — use auto-retrying assertions

## 12. Deployment

### Architecture (based on Onyx)

One Docker image, multiple containers. Same backend image runs as API server OR Celery worker depending on the command.

```
                    ┌─────────┐
                    │  Nginx  │ :80/:443
                    └────┬────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌────────┐ ┌────────┐
        │ API      │ │ Admin  │ │ Web    │
        │ (FastAPI)│ │(Next.js│ │(Next.js│
        │ :8080    │ │ :3000) │ │ :3001) │
        └────┬─────┘ └────────┘ └────────┘
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
┌─────────┐ ┌──────┐ ┌────┐
│Postgres │ │Redis │ │ S3 │
│ :5432   │ │:6379 │ │    │
└─────────┘ └──┬───┘ └────┘
               │
        ┌──────┴──────┐
        ▼             ▼
  ┌──────────┐  ┌──────────┐
  │ Celery   │  │ Celery   │
  │ Primary  │  │ Media    │
  └──────────┘  └──────────┘
```

### Docker Compose — Development

Current setup in `docker-compose.yml`. Runs: Postgres, Redis, API, Celery workers.

```bash
docker compose up                    # Start all services
docker compose up -d                 # Detached
docker compose logs -f api           # Tail API logs
```

### Docker Compose — Production

When going to production, add:

1. **Nginx** as reverse proxy with TLS termination
2. **Remove all port exposures** except Nginx (80/443)
3. **supervisord** to manage multiple Celery workers in one container (reduces container count)
4. **Named volumes** for data persistence
5. **Health checks** on all services
6. **Log rotation** with json-file driver (50MB max, 6 files)

### Environment Configuration

All deployment config goes in `.env` files, never hardcoded. Use `env.template` as reference:

```bash
# Core
IMAGE_TAG=latest
APP_HOST=0.0.0.0
APP_PORT=8080

# Auth
JWT_SECRET=<generate-random-secret>

# Database
POSTGRES_HOST=postgres
POSTGRES_USER=halyoontok
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=halyoontok

# Redis
REDIS_HOST=redis

# S3 / Media Storage
S3_BUCKET=halyoontok-media
S3_ENDPOINT=<minio-or-aws-endpoint>
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<secret>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Scaling Path

| Stage | Deploy model | When |
|-------|-------------|------|
| Phase 0-1 | Docker Compose (single host) | Development + early users |
| Phase 2 | Docker Compose + Nginx + supervisord | Hundreds of users |
| Phase 3 | Kubernetes + Helm | Thousands of users, autoscaling needed |
| Scale | AWS Terraform (EKS + RDS + ElastiCache + S3 + WAF) | Production at scale |

### Adding New Celery Workers

When a domain needs its own worker (e.g., AI generation, trend ingestion):

1. Create config in `background/celery/configs/{worker}.py`
2. Create app in `background/celery/apps/{worker}.py`
3. Add tasks in `background/celery/tasks/{domain}.py`
4. Add to `docker-compose.yml` as new service (dev) or to `supervisord.conf` (prod)
5. Add queue name to the new worker's command: `celery -A halyoontok.background.celery.apps.{worker} worker -l info -Q {queue}`
