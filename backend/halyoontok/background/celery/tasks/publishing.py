import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def publish_video(video_id: int) -> dict:
    """Publish an approved video to the public feed."""
    logger.info(f"Publishing video {video_id}")
    # TODO: Update video status to PUBLISHED, set published_at
    return {"video_id": video_id, "status": "published"}
