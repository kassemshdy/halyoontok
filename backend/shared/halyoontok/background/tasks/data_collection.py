import logging

from celery import shared_task

from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=3600)
def fetch_channel_videos(channel_id: int) -> dict:
    """Fetch latest videos for a tracked channel."""
    logger.info("Fetching videos for channel %d", channel_id)
    with get_session() as session:
        from halyoontok.services.data_collection_service import fetch_channel_videos as _fetch
        new_count = _fetch(session, channel_id)
    return {"channel_id": channel_id, "new_videos": new_count}


@shared_task(expires=3600)
def update_video_metrics(channel_id: int) -> dict:
    """Refresh view/like/engagement counts for a channel's videos."""
    logger.info("Updating metrics for channel %d", channel_id)
    with get_session() as session:
        from halyoontok.services.data_collection_service import refresh_video_metrics
        updated = refresh_video_metrics(session, channel_id)
    return {"channel_id": channel_id, "updated": updated}


@shared_task(expires=7200)
def sync_all_channels() -> dict:
    """Periodic: refresh videos and metrics for all active channels."""
    logger.info("Starting sync for all active channels")
    with get_session() as session:
        from halyoontok.db.social_channels import get_active_channels
        channels = get_active_channels(session)
        channel_ids = [c.id for c in channels]

    total_new = 0
    for cid in channel_ids:
        try:
            result = fetch_channel_videos.delay(cid)
        except Exception:
            logger.exception("Failed to queue fetch for channel %d", cid)

    return {"channels_queued": len(channel_ids)}


@shared_task(expires=7200)
def compute_virality_scores() -> dict:
    """Periodic: recompute virality scores for recent social videos."""
    logger.info("Computing virality scores")
    with get_session() as session:
        from halyoontok.services.virality_service import batch_compute_virality_scores
        count = batch_compute_virality_scores(session)
    return {"updated": count}


@shared_task(expires=3600)
def discover_channels(platform: str, country: str | None = None, query: str = "") -> dict:
    """Search for new channels on a platform."""
    logger.info("Discovering channels on %s, query=%s, country=%s", platform, query, country)
    from halyoontok.configs.constants import SocialPlatform
    platform_enum = SocialPlatform(platform)

    from halyoontok.services.data_collection_service import get_platform_client
    client = get_platform_client(platform_enum)
    channels = client.search_channels(query, country=country)

    return {"platform": platform, "found": len(channels), "channels": [c.name for c in channels[:10]]}
