from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session, selectinload

from halyoontok.auth.permissions import require_editor, require_moderator
from halyoontok.configs.constants import AssetType, ContentCategory, ContentStatus, Dialect, Language, SourceType
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User, Video
from halyoontok.services import content_service
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/content", tags=["content"])


class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: ContentCategory
    language: Language = Language.ARABIC
    dialect: Dialect = Dialect.MSA
    source_type: SourceType


class VideoRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: ContentStatus
    category: ContentCategory
    language: Language
    dialect: Dialect
    duration_seconds: Optional[int]
    model_config = {"from_attributes": True}


class VideoDetailRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: ContentStatus
    category: ContentCategory
    language: Language
    dialect: Dialect
    duration_seconds: Optional[int]
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class StatusUpdate(BaseModel):
    status: ContentStatus


@router.get("/videos")
def list_videos(
    limit: int = 50, offset: int = 0, status: Optional[ContentStatus] = None,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> list[VideoRead]:
    return [VideoRead.model_validate(v) for v in content_service.list_videos(session, limit, offset, status)]


@router.post("/videos")
def create_video(
    body: VideoCreate, user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> VideoRead:
    return VideoRead.model_validate(content_service.create_video(session, **body.model_dump()))


@router.get("/videos/{video_id}")
def get_video(
    video_id: int, user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> VideoDetailRead:
    video = (
        session.query(Video)
        .options(selectinload(Video.assets))
        .filter(Video.id == video_id)
        .first()
    )
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)

    video_url = None
    thumbnail_url = None
    for asset in video.assets:
        if asset.asset_type in (AssetType.VIDEO_RAW, AssetType.VIDEO_HLS):
            video_url = asset.storage_path
        elif asset.asset_type == AssetType.THUMBNAIL:
            thumbnail_url = asset.storage_path

    return VideoDetailRead(
        id=video.id,
        title=video.title,
        description=video.description,
        status=video.status,
        category=video.category,
        language=video.language,
        dialect=video.dialect,
        duration_seconds=video.duration_seconds,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
    )


@router.patch("/videos/{video_id}/status")
def update_status(
    video_id: int, body: StatusUpdate,
    user: User = Depends(require_moderator), session: Session = Depends(get_session_dep),
) -> dict:
    video = content_service.update_video_status(session, video_id, body.status)
    return {"id": video.id, "status": video.status.value}
