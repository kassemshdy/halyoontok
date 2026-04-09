from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentStatus
from halyoontok.db.models import Video, WatchEvent


def get_overview(session: Session) -> dict:
    total_videos = session.query(func.count(Video.id)).scalar()
    published_videos = (
        session.query(func.count(Video.id))
        .filter(Video.status == ContentStatus.PUBLISHED)
        .scalar()
    )
    total_watches = session.query(func.count(WatchEvent.id)).scalar()
    total_watch_time = (
        session.query(func.sum(WatchEvent.watch_duration_seconds)).scalar() or 0
    )
    avg_completion = (
        session.query(func.avg(WatchEvent.watch_duration_seconds)).scalar() or 0
    )
    return {
        "total_videos": total_videos,
        "published_videos": published_videos,
        "total_watches": total_watches,
        "total_watch_time_seconds": total_watch_time,
        "avg_watch_duration_seconds": round(float(avg_completion), 1),
    }
