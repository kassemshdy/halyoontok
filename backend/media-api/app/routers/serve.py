from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, Response

router = APIRouter(tags=["media"])

STORAGE_DIR = os.environ.get(
    "MEDIA_STORAGE_DIR",
    os.path.join(os.path.dirname(__file__), "..", "..", "storage"),
)

CONTENT_TYPES = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

CACHE_HEADER = "public, max-age=86400"


@router.get("/videos/{filename}")
async def serve_video(filename: str, request: Request) -> Response:
    return _serve_file("videos", filename, request)


@router.get("/thumbnails/{filename}")
async def serve_thumbnail(filename: str, request: Request) -> Response:
    return _serve_file("thumbnails", filename, request)


@router.get("/images/{filename}")
async def serve_image(filename: str, request: Request) -> Response:
    return _serve_file("images", filename, request)


def _serve_file(subdir: str, filename: str, request: Request) -> Response:
    # Prevent path traversal
    safe_name = Path(filename).name
    file_path = os.path.join(os.path.abspath(STORAGE_DIR), subdir, safe_name)

    if not os.path.isfile(file_path):
        return Response(status_code=404, content="Not found")

    ext = os.path.splitext(safe_name)[1].lower()
    content_type = CONTENT_TYPES.get(ext, "application/octet-stream")

    return FileResponse(
        file_path,
        media_type=content_type,
        headers={
            "Cache-Control": CACHE_HEADER,
            "Accept-Ranges": "bytes",
        },
    )
