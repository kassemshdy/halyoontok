from __future__ import annotations

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from halyoontok.utils.sentry import init_sentry

init_sentry("admin-api")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from halyoontok import __version__
from halyoontok.db.engine.sql_engine import SqlEngine
from halyoontok.error_handling.exceptions import register_exception_handlers

from app.routers.content import router as content_router
from app.routers.moderation import router as moderation_router
from app.routers.studio import router as studio_router
from app.routers.analytics import router as analytics_router
from app.routers.trends import router as trends_router
from app.routers.users import router as users_router
from app.routers.channels import router as channels_router
from app.routers.social_videos import router as social_videos_router
from app.routers.search import router as search_router
from app.routers.generation import router as generation_router

logger = logging.getLogger(__name__)

CORS_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    SqlEngine.init_engine()
    logger.info("admin-api: database engine initialized")
    yield
    SqlEngine.reset_engine()


def get_application() -> FastAPI:
    app = FastAPI(title="HalyoonTok Admin API", version=__version__, lifespan=lifespan)
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = "/api"
    app.include_router(content_router, prefix=prefix)
    app.include_router(moderation_router, prefix=prefix)
    app.include_router(studio_router, prefix=prefix)
    app.include_router(analytics_router, prefix=prefix)
    app.include_router(trends_router, prefix=prefix)
    app.include_router(users_router, prefix=prefix)
    app.include_router(channels_router, prefix=prefix)
    app.include_router(social_videos_router, prefix=prefix)
    app.include_router(search_router, prefix=prefix)
    app.include_router(generation_router, prefix=prefix)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "admin-api"}

    return app


app = get_application()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
