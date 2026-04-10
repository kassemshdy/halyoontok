from __future__ import annotations

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from halyoontok.utils.sentry import init_sentry

init_sentry("front-api")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from halyoontok import __version__
from halyoontok.db.engine.sql_engine import SqlEngine
from halyoontok.error_handling.exceptions import register_exception_handlers
from halyoontok.utils.rate_limit import RateLimitMiddleware

from app.routers.feed import router as feed_router
from app.routers.auth import router as auth_router
from app.routers.profiles import router as profiles_router
from app.routers.interactions import router as interactions_router
from app.routers.parent_controls import router as parent_controls_router

logger = logging.getLogger(__name__)

CORS_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:3001"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    SqlEngine.init_engine()
    logger.info("front-api: database engine initialized")
    yield
    SqlEngine.reset_engine()


def get_application() -> FastAPI:
    app = FastAPI(title="HalyoonTok Public API", version=__version__, lifespan=lifespan)
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(RateLimitMiddleware, paths=["/api/auth/login", "/api/auth/register"], max_requests=10, window_seconds=60)

    prefix = "/api"
    app.include_router(feed_router, prefix=prefix)
    app.include_router(auth_router, prefix=prefix)
    app.include_router(profiles_router, prefix=prefix)
    app.include_router(interactions_router, prefix=prefix)
    app.include_router(parent_controls_router, prefix=prefix)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "front-api"}

    return app


app = get_application()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8081"))
    uvicorn.run(app, host="0.0.0.0", port=port)
