from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.configs.constants import AssetType, ContentCategory
from halyoontok.db.content import get_published_videos_with_assets
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import Video, WatchEvent

router = APIRouter(prefix="/feed", tags=["feed"])


class FeedVideoRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    language: str
    dialect: str
    duration_seconds: Optional[int] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class WatchEventCreate(BaseModel):
    child_profile_id: int
    video_id: int
    watch_duration_seconds: int
    completed: bool = False
    skipped: bool = False


def _resolve_video(video: Video) -> FeedVideoRead:
    video_url = None
    thumbnail_url = None
    for asset in video.assets:
        if asset.asset_type in (AssetType.VIDEO_RAW, AssetType.VIDEO_HLS):
            video_url = asset.storage_path
        elif asset.asset_type == AssetType.THUMBNAIL:
            thumbnail_url = asset.storage_path
    return FeedVideoRead(
        id=video.id,
        title=video.title,
        description=video.description,
        category=video.category.value if hasattr(video.category, "value") else video.category,
        language=video.language.value if hasattr(video.language, "value") else video.language,
        dialect=video.dialect.value if hasattr(video.dialect, "value") else video.dialect,
        duration_seconds=video.duration_seconds,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
    )


@router.get("")
def get_feed(
    limit: int = 20,
    offset: int = 0,
    category: Optional[str] = None,
    session: Session = Depends(get_session_dep),
) -> list[FeedVideoRead]:
    """Public feed — no auth required."""
    videos = get_published_videos_with_assets(session, limit, offset)
    if category:
        videos = [v for v in videos if (v.category.value if hasattr(v.category, "value") else v.category) == category]
    return [_resolve_video(v) for v in videos]


@router.post("/watch-event")
def record_watch_event(
    body: WatchEventCreate,
    session: Session = Depends(get_session_dep),
) -> dict:
    event = WatchEvent(**body.model_dump())
    session.add(event)
    session.flush()
    return {"id": event.id}
