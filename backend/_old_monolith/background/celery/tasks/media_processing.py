import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def transcode_video(video_id: int, source_path: str) -> dict:
    """Transcode raw video to HLS/DASH formats."""
    logger.info(f"Transcoding video {video_id} from {source_path}")
    # TODO: FFmpeg transcode → upload to S3 → create VideoAsset records
    return {"video_id": video_id, "status": "transcoded"}


@shared_task(expires=3600)
def generate_thumbnail(video_id: int, source_path: str) -> dict:
    """Extract thumbnail frames from video."""
    logger.info(f"Generating thumbnail for video {video_id}")
    # TODO: FFmpeg extract frame → upload to S3 → create VideoAsset
    return {"video_id": video_id, "status": "thumbnail_generated"}


@shared_task(expires=3600)
def extract_audio(video_id: int, source_path: str) -> dict:
    """Extract audio track for STT processing."""
    logger.info(f"Extracting audio for video {video_id}")
    # TODO: FFmpeg extract audio → upload to S3 → trigger STT task
    return {"video_id": video_id, "status": "audio_extracted"}
