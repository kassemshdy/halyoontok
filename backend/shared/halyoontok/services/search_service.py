from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentCategory, SocialPlatform
from halyoontok.db.models import SocialVideo, TrendSignal


def search_videos(
    session: Session,
    query: str,
    platform: Optional[SocialPlatform] = None,
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[SocialVideo]:
    """Full-text search across social video titles and descriptions."""
    pattern = f"%{query}%"
    q = session.query(SocialVideo).filter(
        (SocialVideo.title.ilike(pattern)) | (SocialVideo.description.ilike(pattern))
    )
    if platform:
        q = q.filter(SocialVideo.platform == platform)
    if category:
        q = q.filter(SocialVideo.category == category)
    if country:
        q = q.filter(SocialVideo.country == country)
    return q.order_by(SocialVideo.virality_score.desc()).offset(offset).limit(limit).all()


def find_similar_videos(
    session: Session,
    video_id: int,
    limit: int = 10,
) -> list[SocialVideo]:
    """Find videos similar to a given video by category, style, and engagement."""
    video = session.get(SocialVideo, video_id)
    if not video:
        return []

    q = session.query(SocialVideo).filter(SocialVideo.id != video_id)

    if video.category:
        q = q.filter(SocialVideo.category == video.category)
    if video.country:
        q = q.filter(SocialVideo.country == video.country)

    return q.order_by(SocialVideo.virality_score.desc()).limit(limit).all()


def get_trending_patterns(
    session: Session,
    country: Optional[str] = None,
    category: Optional[ContentCategory] = None,
    days: int = 7,
    limit: int = 20,
) -> list[dict]:
    """Aggregate trending patterns from collected social videos."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    q = session.query(
        SocialVideo.category,
        func.count(SocialVideo.id).label("video_count"),
        func.avg(SocialVideo.engagement_rate).label("avg_engagement"),
        func.avg(SocialVideo.virality_score).label("avg_virality"),
        func.sum(SocialVideo.view_count).label("total_views"),
    ).filter(SocialVideo.created_at >= cutoff)

    if country:
        q = q.filter(SocialVideo.country == country)
    if category:
        q = q.filter(SocialVideo.category == category)

    results = (
        q.group_by(SocialVideo.category)
        .order_by(func.avg(SocialVideo.virality_score).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "category": r.category.value if r.category else "uncategorized",
            "video_count": r.video_count,
            "avg_engagement": round(float(r.avg_engagement or 0), 2),
            "avg_virality": round(float(r.avg_virality or 0), 2),
            "total_views": r.total_views or 0,
        }
        for r in results
    ]


def recommend_reference_videos(
    session: Session,
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    limit: int = 10,
) -> list[SocialVideo]:
    """Recommend the best reference videos for AI generation input."""
    q = session.query(SocialVideo).filter(SocialVideo.virality_score > 0)
    if category:
        q = q.filter(SocialVideo.category == category)
    if country:
        q = q.filter(SocialVideo.country == country)
    return q.order_by(SocialVideo.virality_score.desc()).limit(limit).all()
