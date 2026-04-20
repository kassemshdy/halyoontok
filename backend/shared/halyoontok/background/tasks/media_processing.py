import logging

from celery import shared_task

from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def transcode_video(video_id: int, source_path: str) -> dict:
    """Transcode raw video to HLS/DASH formats."""
    logger.info("Transcoding video %d from %s", video_id, source_path)
    with get_session() as session:
        from halyoontok.db.models import Video
        video = session.get(Video, video_id)
        if not video:
            return {"video_id": video_id, "status": "not_found"}
    # TODO: FFmpeg transcode -> upload to storage -> create VideoAsset records
    return {"video_id": video_id, "status": "transcoded"}


@shared_task(expires=3600)
def generate_thumbnail(video_id: int, source_path: str) -> dict:
    """Extract thumbnail frames from video."""
    logger.info("Generating thumbnail for video %d", video_id)
    # TODO: FFmpeg extract frame -> upload to storage -> create VideoAsset
    return {"video_id": video_id, "status": "thumbnail_generated"}


@shared_task(expires=3600)
def extract_audio(video_id: int, source_path: str) -> dict:
    """Extract audio track for STT processing."""
    logger.info("Extracting audio for video %d", video_id)
    # TODO: FFmpeg extract audio -> upload to storage -> trigger STT task
    return {"video_id": video_id, "status": "audio_extracted"}
