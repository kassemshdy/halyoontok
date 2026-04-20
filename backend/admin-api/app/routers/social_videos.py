from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory, Dialect, Language, SocialPlatform
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/social-videos", tags=["social-videos"])


class SocialVideoRead(BaseModel):
    id: int
    channel_id: int
    platform: SocialPlatform
    platform_video_id: str
    title: str
    description: Optional[str]
    url: Optional[str]
    thumbnail_url: Optional[str]
    view_count: int
    like_count: int
    comment_count: int
    share_count: int
    duration_seconds: Optional[int]
    category: Optional[ContentCategory]
    engagement_rate: float
    virality_score: float
    language: Optional[Language]
    dialect: Optional[Dialect]
    country: Optional[str]
    is_short: bool
    model_config = {"from_attributes": True}


@router.get("")
def list_social_videos(
    limit: int = 50,
    offset: int = 0,
    platform: Optional[SocialPlatform] = None,
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    min_virality: Optional[float] = None,
    sort_by: str = "virality_score",
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[SocialVideoRead]:
    from halyoontok.db import social_videos
    videos = social_videos.list_videos(
        session,
        limit=limit,
        offset=offset,
        platform=platform,
        category=category,
        country=country,
        min_virality=min_virality,
        sort_by=sort_by,
    )
    return [SocialVideoRead.model_validate(v) for v in videos]


@router.get("/top")
def top_videos(
    limit: int = 20,
    platform: Optional[SocialPlatform] = None,
    country: Optional[str] = None,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[SocialVideoRead]:
    from halyoontok.db import social_videos
    videos = social_videos.get_top_videos(session, limit=limit, platform=platform, country=country)
    return [SocialVideoRead.model_validate(v) for v in videos]


@router.get("/{video_id}")
def get_social_video(
    video_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> SocialVideoRead:
    from halyoontok.db import social_videos
    video = social_videos.get_video(session, video_id)
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)
    return SocialVideoRead.model_validate(video)
