from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor, require_moderator
from halyoontok.configs.constants import (
    ContentCategory, ContentStatus, Dialect, Language, SourceType,
)
from halyoontok.db.content import get_published_videos, get_video_by_id
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User, Video
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/content", tags=["content"])

# Valid workflow transitions
VALID_TRANSITIONS = {
    ContentStatus.DRAFT: [ContentStatus.AWAITING_MODERATION],
    ContentStatus.AI_GENERATED: [ContentStatus.AWAITING_EDITOR, ContentStatus.AWAITING_MODERATION],
    ContentStatus.AWAITING_EDITOR: [ContentStatus.AWAITING_MODERATION, ContentStatus.DRAFT],
    ContentStatus.AWAITING_MODERATION: [ContentStatus.APPROVED, ContentStatus.CHANGES_REQUESTED],
    ContentStatus.CHANGES_REQUESTED: [ContentStatus.AWAITING_MODERATION, ContentStatus.DRAFT],
    ContentStatus.APPROVED: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED],
    ContentStatus.SCHEDULED: [ContentStatus.PUBLISHED],
    ContentStatus.PUBLISHED: [ContentStatus.ARCHIVED],
}


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


class StatusUpdate(BaseModel):
    status: ContentStatus


@router.get("/videos")
def list_videos(
    limit: int = 50,
    offset: int = 0,
    status: Optional[ContentStatus] = None,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[VideoRead]:
    query = session.query(Video)
    if status:
        query = query.filter(Video.status == status)
    videos = query.order_by(Video.created_at.desc()).offset(offset).limit(limit).all()
    return [VideoRead.model_validate(v) for v in videos]


@router.post("/videos")
def create_video(
    body: VideoCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> VideoRead:
    video = Video(**body.model_dump())
    session.add(video)
    session.flush()
    return VideoRead.model_validate(video)


@router.get("/videos/{video_id}")
def get_video(
    video_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> VideoRead:
    video = get_video_by_id(session, video_id)
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)
    return VideoRead.model_validate(video)


@router.patch("/videos/{video_id}/status")
def update_video_status(
    video_id: int,
    body: StatusUpdate,
    user: User = Depends(require_moderator),
    session: Session = Depends(get_session_dep),
) -> dict:
    video = get_video_by_id(session, video_id)
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)

    allowed = VALID_TRANSITIONS.get(video.status, [])
    if body.status not in allowed:
        raise HalyoonError(
            HalyoonErrorCode.INVALID_WORKFLOW_TRANSITION,
            f"Cannot transition from {video.status.value} to {body.status.value}. "
            f"Allowed: {[s.value for s in allowed]}",
        )

    video.status = body.status
    if body.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        video.published_at = datetime.now(timezone.utc)
    session.flush()
    return {"id": video.id, "status": video.status.value}
