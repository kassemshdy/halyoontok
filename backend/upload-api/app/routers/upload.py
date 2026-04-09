from __future__ import annotations

import subprocess
import tempfile
import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.configs.constants import AssetType
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User, VideoAsset
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError
from halyoontok.storage import get_storage_backend

from app.resize import generate_image_thumbnail

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/video")
async def upload_video(
    file: UploadFile,
    video_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> dict:
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HalyoonError(
            HalyoonErrorCode.VALIDATION_ERROR,
            f"Invalid video type: {file.content_type}. Allowed: {ALLOWED_VIDEO_TYPES}",
        )

    storage = get_storage_backend()
    file_bytes = await file.read()
    file_id = uuid.uuid4().hex

    # Save video
    video_key = f"videos/{file_id}.mp4"
    video_url = storage.upload(file_bytes, video_key, file.content_type)

    session.add(VideoAsset(
        video_id=video_id,
        asset_type=AssetType.VIDEO_RAW,
        storage_path=video_url,
        mime_type=file.content_type,
    ))

    # Generate thumbnail from video via FFmpeg
    thumbnail_url = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=True) as tmp_video:
            tmp_video.write(file_bytes)
            tmp_video.flush()

            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tmp_thumb:
                subprocess.run(
                    [
                        "ffmpeg", "-y",
                        "-i", tmp_video.name,
                        "-ss", "00:00:01",
                        "-vframes", "1",
                        "-vf", f"scale={360}:-1",
                        tmp_thumb.name,
                    ],
                    capture_output=True,
                    timeout=30,
                )
                thumb_bytes = open(tmp_thumb.name, "rb").read()
                if thumb_bytes:
                    thumb_key = f"thumbnails/{file_id}.jpg"
                    thumbnail_url = storage.upload(thumb_bytes, thumb_key, "image/jpeg")
                    session.add(VideoAsset(
                        video_id=video_id,
                        asset_type=AssetType.THUMBNAIL,
                        storage_path=thumbnail_url,
                        mime_type="image/jpeg",
                    ))
    except Exception:
        pass  # Thumbnail generation is best-effort

    session.flush()

    return {
        "video_url": video_url,
        "thumbnail_url": thumbnail_url,
        "video_id": video_id,
    }


@router.post("/image")
async def upload_image(
    file: UploadFile,
    video_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> dict:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HalyoonError(
            HalyoonErrorCode.VALIDATION_ERROR,
            f"Invalid image type: {file.content_type}. Allowed: {ALLOWED_IMAGE_TYPES}",
        )

    storage = get_storage_backend()
    file_bytes = await file.read()
    file_id = uuid.uuid4().hex

    # Save original
    ext = file.filename.rsplit(".", 1)[-1] if file.filename else "jpg"
    original_key = f"images/{file_id}.{ext}"
    original_url = storage.upload(file_bytes, original_key, file.content_type)

    # Generate thumbnail
    thumb_bytes = generate_image_thumbnail(file_bytes)
    thumb_key = f"thumbnails/{file_id}.jpg"
    thumbnail_url = storage.upload(thumb_bytes, thumb_key, "image/jpeg")

    session.add(VideoAsset(
        video_id=video_id,
        asset_type=AssetType.THUMBNAIL,
        storage_path=thumbnail_url,
        mime_type="image/jpeg",
    ))
    session.flush()

    return {
        "original_url": original_url,
        "thumbnail_url": thumbnail_url,
        "video_id": video_id,
    }
