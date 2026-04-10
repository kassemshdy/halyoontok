from __future__ import annotations

import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.serve import router as serve_router

STORAGE_DIR = os.environ.get("MEDIA_STORAGE_DIR", os.path.join(os.path.dirname(__file__), "..", "storage"))


def get_application() -> FastAPI:
    app = FastAPI(title="HalyoonTok Media Server", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "HEAD"],
        allow_headers=["*"],
    )

    app.include_router(serve_router)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "media-api"}

    return app


app = get_application()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8083"))
    uvicorn.run(app, host="0.0.0.0", port=port)
