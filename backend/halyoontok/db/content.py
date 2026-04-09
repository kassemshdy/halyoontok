from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentStatus
from halyoontok.db.models import Video
from halyoontok.db.models import VideoAsset


def get_video_by_id(session: Session, video_id: int) -> Video | None:
    return session.get(Video, video_id)


def get_published_videos(
    session: Session, limit: int = 50, offset: int = 0
) -> list[Video]:
    return (
        session.query(Video)
        .filter(Video.status == ContentStatus.PUBLISHED)
        .order_by(Video.published_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_video(session: Session, video: Video) -> Video:
    session.add(video)
    session.flush()
    return video


def get_assets_for_video(session: Session, video_id: int) -> list[VideoAsset]:
    return (
        session.query(VideoAsset)
        .filter(VideoAsset.video_id == video_id)
        .all()
    )
