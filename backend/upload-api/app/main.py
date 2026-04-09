from __future__ import annotations

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from halyoontok.utils.sentry import init_sentry

init_sentry("upload-api")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from halyoontok import __version__
from halyoontok.db.engine.sql_engine import SqlEngine
from halyoontok.error_handling.exceptions import register_exception_handlers

from app.routers.upload import router as upload_router

logger = logging.getLogger(__name__)

CORS_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    SqlEngine.init_engine()
    logger.info("upload-api: database engine initialized")
    yield
    SqlEngine.reset_engine()


def get_application() -> FastAPI:
    app = FastAPI(title="HalyoonTok Upload API", version=__version__, lifespan=lifespan)
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(upload_router, prefix="/api")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "upload-api"}

    return app


app = get_application()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8082"))
    uvicorn.run(app, host="0.0.0.0", port=port)
