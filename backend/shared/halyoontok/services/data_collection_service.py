from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from halyoontok.configs.constants import (
    ChannelStatus,
    CollectionJobStatus,
    CollectionJobType,
    SocialPlatform,
)
from halyoontok.db import social_channels, social_videos
from halyoontok.db.models import CollectionJob, SocialChannel, SocialVideo
from halyoontok.integrations.base import SocialPlatformClient

logger = logging.getLogger(__name__)


def get_platform_client(platform: SocialPlatform) -> SocialPlatformClient:
    if platform == SocialPlatform.YOUTUBE:
        from halyoontok.integrations.youtube import YouTubeClient
        return YouTubeClient()
    elif platform == SocialPlatform.TIKTOK:
        from halyoontok.integrations.tiktok import TikTokClient
        return TikTokClient()
    elif platform == SocialPlatform.INSTAGRAM:
        from halyoontok.integrations.instagram import InstagramClient
        return InstagramClient()
    raise ValueError(f"Unsupported platform: {platform}")


def add_channel(
    session: Session,
    platform: SocialPlatform,
    platform_channel_id: str,
    category=None,
    country: Optional[str] = None,
) -> SocialChannel:
    """Add a new channel to track. Fetches metadata from platform API."""
    existing = social_channels.get_channel_by_platform_id(session, platform, platform_channel_id)
    if existing:
        return existing

    client = get_platform_client(platform)
    channel_data = client.get_channel(platform_channel_id)

    return social_channels.create_channel(
        session,
        platform=platform,
        platform_channel_id=platform_channel_id,
        name=channel_data.name,
        handle=channel_data.handle,
        description=channel_data.description,
        country=country or channel_data.country,
        category=category,
        subscriber_count=channel_data.subscriber_count,
        avg_views=channel_data.avg_views,
        is_verified=channel_data.is_verified,
        status=ChannelStatus.ACTIVE,
        metadata_json=channel_data.metadata,
    )


def fetch_channel_videos(session: Session, channel_id: int, limit: int = 50) -> int:
    """Fetch latest videos for a tracked channel. Returns count of new videos."""
    channel = social_channels.get_channel(session, channel_id)
    if not channel:
        return 0

    client = get_platform_client(channel.platform)
    video_data_list = client.get_channel_videos(channel.platform_channel_id, limit)
    new_count = 0

    for vd in video_data_list:
        existing = social_videos.get_video_by_platform_id(session, channel.platform, vd.platform_video_id)
        if existing:
            social_videos.update_video_metrics(
                session, existing.id, vd.view_count, vd.like_count, vd.comment_count, vd.share_count
            )
            continue

        social_videos.create_video(
            session,
            channel_id=channel.id,
            platform=channel.platform,
            platform_video_id=vd.platform_video_id,
            title=vd.title,
            description=vd.description,
            url=vd.url,
            thumbnail_url=vd.thumbnail_url,
            view_count=vd.view_count,
            like_count=vd.like_count,
            comment_count=vd.comment_count,
            share_count=vd.share_count,
            duration_seconds=vd.duration_seconds,
            published_at=vd.published_at,
            is_short=vd.is_short,
            country=channel.country,
            language=channel.language,
            dialect=channel.dialect,
            category=channel.category,
            metadata_json=vd.metadata,
        )
        new_count += 1

    social_channels.mark_scraped(session, channel_id)
    return new_count


def refresh_video_metrics(session: Session, channel_id: int) -> int:
    """Refresh metrics for all videos of a channel. Returns count updated."""
    channel = social_channels.get_channel(session, channel_id)
    if not channel:
        return 0

    videos = social_videos.list_videos(session, limit=500, channel_id=channel_id)
    if not videos:
        return 0

    platform_ids = [v.platform_video_id for v in videos]
    client = get_platform_client(channel.platform)
    metrics_list = client.get_video_metrics(platform_ids)

    metrics_map = {m.platform_video_id: m for m in metrics_list}
    updated = 0
    for video in videos:
        m = metrics_map.get(video.platform_video_id)
        if m:
            social_videos.update_video_metrics(
                session, video.id, m.view_count, m.like_count, m.comment_count, m.share_count
            )
            updated += 1

    return updated


def create_collection_job(
    session: Session,
    job_type: CollectionJobType,
    platform: Optional[SocialPlatform] = None,
    parameters: Optional[dict] = None,
) -> CollectionJob:
    job = CollectionJob(
        job_type=job_type,
        platform=platform,
        status=CollectionJobStatus.PENDING,
        parameters=parameters,
    )
    session.add(job)
    session.flush()
    return job


def complete_collection_job(
    session: Session, job_id: int, result_summary: dict
) -> None:
    job = session.get(CollectionJob, job_id)
    if job:
        job.status = CollectionJobStatus.COMPLETED
        job.completed_at = datetime.now(timezone.utc)
        job.result_summary = result_summary
        session.flush()


def fail_collection_job(session: Session, job_id: int, error: str) -> None:
    job = session.get(CollectionJob, job_id)
    if job:
        job.status = CollectionJobStatus.FAILED
        job.completed_at = datetime.now(timezone.utc)
        job.error_message = error
        session.flush()
