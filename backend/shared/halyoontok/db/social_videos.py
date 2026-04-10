from __future__ import annotations

from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentCategory, SocialPlatform
from halyoontok.db.models import SocialVideo


def list_videos(
    session: Session,
    limit: int = 50,
    offset: int = 0,
    platform: Optional[SocialPlatform] = None,
    channel_id: Optional[int] = None,
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    min_virality: Optional[float] = None,
    sort_by: str = "created_at",
) -> list[SocialVideo]:
    q = session.query(SocialVideo)
    if platform:
        q = q.filter(SocialVideo.platform == platform)
    if channel_id:
        q = q.filter(SocialVideo.channel_id == channel_id)
    if category:
        q = q.filter(SocialVideo.category == category)
    if country:
        q = q.filter(SocialVideo.country == country)
    if min_virality is not None:
        q = q.filter(SocialVideo.virality_score >= min_virality)

    sort_column = {
        "created_at": SocialVideo.created_at.desc(),
        "virality_score": SocialVideo.virality_score.desc(),
        "view_count": SocialVideo.view_count.desc(),
        "engagement_rate": SocialVideo.engagement_rate.desc(),
    }.get(sort_by, SocialVideo.created_at.desc())

    return q.order_by(sort_column).offset(offset).limit(limit).all()


def get_video(session: Session, video_id: int) -> Optional[SocialVideo]:
    return session.get(SocialVideo, video_id)


def get_video_by_platform_id(
    session: Session, platform: SocialPlatform, platform_video_id: str
) -> Optional[SocialVideo]:
    return (
        session.query(SocialVideo)
        .filter(
            SocialVideo.platform == platform,
            SocialVideo.platform_video_id == platform_video_id,
        )
        .first()
    )


def create_video(session: Session, **kwargs) -> SocialVideo:
    video = SocialVideo(**kwargs)
    session.add(video)
    session.flush()
    return video


def update_video_metrics(
    session: Session,
    video_id: int,
    view_count: int,
    like_count: int,
    comment_count: int,
    share_count: int,
) -> Optional[SocialVideo]:
    video = session.get(SocialVideo, video_id)
    if not video:
        return None
    video.view_count = view_count
    video.like_count = like_count
    video.comment_count = comment_count
    video.share_count = share_count
    total_interactions = like_count + comment_count + share_count
    video.engagement_rate = (total_interactions / view_count * 100) if view_count > 0 else 0.0
    session.flush()
    return video


def get_top_videos(
    session: Session,
    limit: int = 20,
    platform: Optional[SocialPlatform] = None,
    country: Optional[str] = None,
) -> list[SocialVideo]:
    q = session.query(SocialVideo)
    if platform:
        q = q.filter(SocialVideo.platform == platform)
    if country:
        q = q.filter(SocialVideo.country == country)
    return q.order_by(SocialVideo.virality_score.desc()).limit(limit).all()


def search_videos(
    session: Session,
    query: str,
    limit: int = 50,
    offset: int = 0,
) -> list[SocialVideo]:
    """Full-text search across social video titles and descriptions."""
    pattern = f"%{query}%"
    return (
        session.query(SocialVideo)
        .filter(
            (SocialVideo.title.ilike(pattern)) | (SocialVideo.description.ilike(pattern))
        )
        .order_by(SocialVideo.virality_score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def count_videos(session: Session) -> int:
    return session.query(func.count(SocialVideo.id)).scalar() or 0
