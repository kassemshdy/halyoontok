from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor, require_moderator
from halyoontok.configs.constants import ContentCategory, ContentStatus, Dialect, Language, SourceType
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import content_service

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
) -> VideoRead:
    return VideoRead.model_validate(content_service.get_video(session, video_id))


@router.patch("/videos/{video_id}/status")
def update_status(
    video_id: int, body: StatusUpdate,
    user: User = Depends(require_moderator), session: Session = Depends(get_session_dep),
) -> dict:
    video = content_service.update_video_status(session, video_id, body.status)
    return {"id": video.id, "status": video.status.value}
