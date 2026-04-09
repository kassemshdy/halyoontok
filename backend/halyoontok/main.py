import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from halyoontok import __version__
from halyoontok.configs.app_configs import APP_API_PREFIX
from halyoontok.configs.app_configs import APP_HOST
from halyoontok.configs.app_configs import APP_PORT
from halyoontok.configs.app_configs import CORS_ALLOWED_ORIGINS
from halyoontok.db.engine.sql_engine import SqlEngine
from halyoontok.error_handling.exceptions import register_exception_handlers
from halyoontok.server.analytics.api import router as analytics_router
from halyoontok.server.auth.api import router as auth_router
from halyoontok.server.content.api import router as content_router
from halyoontok.server.feed.api import router as feed_router
from halyoontok.server.health.api import router as health_router
from halyoontok.server.media.api import router as media_router
from halyoontok.server.moderation.api import router as moderation_router
from halyoontok.server.parent_controls.api import router as parent_controls_router
from halyoontok.server.profiles.api import router as profiles_router
from halyoontok.server.studio.api import router as studio_router
from halyoontok.server.trends.api import router as trends_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    SqlEngine.init_engine()
    logger.info("Database engine initialized")
    yield
    SqlEngine.reset_engine()
    logger.info("Database engine disposed")


def get_application() -> FastAPI:
    app = FastAPI(
        title="HalyoonTok API",
        version=__version__,
        lifespan=lifespan,
    )

    register_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health (no prefix)
    app.include_router(health_router)

    # All domain routers under /api
    for router in [
        auth_router,
        profiles_router,
        content_router,
        feed_router,
        studio_router,
        moderation_router,
        media_router,
        trends_router,
        parent_controls_router,
        analytics_router,
    ]:
        app.include_router(router, prefix=APP_API_PREFIX)

    return app


app = get_application()

if __name__ == "__main__":
    uvicorn.run(app, host=APP_HOST, port=APP_PORT)
