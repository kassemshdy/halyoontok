from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session, selectinload

from halyoontok.configs.constants import AssetType, ContentStatus
from halyoontok.db.models import Video, VideoAsset
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

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


def list_videos(
    session: Session,
    limit: int = 50,
    offset: int = 0,
    status: Optional[ContentStatus] = None,
) -> list[Video]:
    query = session.query(Video)
    if status:
        query = query.filter(Video.status == status)
    return query.order_by(Video.created_at.desc()).offset(offset).limit(limit).all()


def get_video(session: Session, video_id: int) -> Video:
    video = session.get(Video, video_id)
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)
    return video


def create_video(session: Session, **kwargs) -> Video:
    video = Video(**kwargs)
    session.add(video)
    session.flush()
    return video


def update_video_status(session: Session, video_id: int, new_status: ContentStatus) -> Video:
    video = get_video(session, video_id)
    allowed = VALID_TRANSITIONS.get(video.status, [])
    if new_status not in allowed:
        raise HalyoonError(
            HalyoonErrorCode.INVALID_WORKFLOW_TRANSITION,
            f"Cannot transition from {video.status.value} to {new_status.value}. "
            f"Allowed: {[s.value for s in allowed]}",
        )
    video.status = new_status
    if new_status == ContentStatus.PUBLISHED:
        video.published_at = datetime.now(timezone.utc)
    session.flush()
    return video


def get_published_feed(
    session: Session,
    limit: int = 20,
    offset: int = 0,
    category: Optional[str] = None,
) -> list[dict]:
    query = (
        session.query(Video)
        .filter(Video.status == ContentStatus.PUBLISHED)
        .options(selectinload(Video.assets))
        .order_by(Video.published_at.desc())
        .offset(offset)
        .limit(limit)
    )
    videos = query.all()

    if category:
        videos = [
            v for v in videos
            if (v.category.value if hasattr(v.category, "value") else v.category) == category
        ]

    result = []
    for video in videos:
        video_url = None
        thumbnail_url = None
        for asset in video.assets:
            if asset.asset_type in (AssetType.VIDEO_RAW, AssetType.VIDEO_HLS):
                video_url = asset.storage_path
            elif asset.asset_type == AssetType.THUMBNAIL:
                thumbnail_url = asset.storage_path
        result.append({
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "category": video.category.value if hasattr(video.category, "value") else video.category,
            "language": video.language.value if hasattr(video.language, "value") else video.language,
            "dialect": video.dialect.value if hasattr(video.dialect, "value") else video.dialect,
            "duration_seconds": video.duration_seconds,
            "video_url": video_url,
            "thumbnail_url": thumbnail_url,
        })
    return result
