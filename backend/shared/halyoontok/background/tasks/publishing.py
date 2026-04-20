import logging
from datetime import datetime, timezone

from celery import shared_task

from halyoontok.configs.constants import ContentStatus
from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def publish_video(video_id: int) -> dict:
    """Publish an approved video to the public feed."""
    logger.info("Publishing video %d", video_id)
    with get_session() as session:
        from halyoontok.db.models import Video
        video = session.get(Video, video_id)
        if not video:
            return {"video_id": video_id, "status": "not_found"}
        video.status = ContentStatus.PUBLISHED
        video.published_at = datetime.now(timezone.utc)
    return {"video_id": video_id, "status": "published"}
