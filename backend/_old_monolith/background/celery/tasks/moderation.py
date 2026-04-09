import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def run_safety_scan(video_id: int) -> dict:
    """Run automated safety classifiers on video content."""
    logger.info(f"Running safety scan for video {video_id}")
    # TODO: Run text/audio/visual safety classifiers
    # → create ModerationDecision record
    # → update video status to AWAITING_MODERATION if flagged
    return {"video_id": video_id, "status": "scanned"}
