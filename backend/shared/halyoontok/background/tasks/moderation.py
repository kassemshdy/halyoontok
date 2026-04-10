import logging

from celery import shared_task

from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def run_safety_scan(video_id: int) -> dict:
    """Run automated safety classifiers on video content."""
    logger.info("Running safety scan for video %d", video_id)
    with get_session() as session:
        from halyoontok.db.models import Video
        video = session.get(Video, video_id)
        if not video:
            return {"video_id": video_id, "status": "not_found"}
    # TODO: Run text/audio/visual safety classifiers
    # -> create ModerationDecision record
    # -> update video status to AWAITING_MODERATION if flagged
    return {"video_id": video_id, "status": "scanned"}
