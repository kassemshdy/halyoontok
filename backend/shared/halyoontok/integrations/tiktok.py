from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

import httpx

from halyoontok.configs.app_configs import TIKTOK_API_KEY
from halyoontok.integrations.base import (
    ChannelData,
    SocialPlatformClient,
    VideoData,
    VideoMetrics,
)

logger = logging.getLogger(__name__)

TIKTOK_RESEARCH_API_BASE = "https://open.tiktokapis.com/v2"


class TikTokClient(SocialPlatformClient):
    """TikTok Research API client for channel and video data collection.

    Uses the TikTok Research API (requires approved access).
    Falls back gracefully when API key is not configured.
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or TIKTOK_API_KEY
        self._client: httpx.Client | None = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                base_url=TIKTOK_RESEARCH_API_BASE,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    def _check_api_key(self) -> None:
        if not self.api_key:
            raise ValueError("TikTok API key not configured. Set TIKTOK_API_KEY env var.")

    def get_channel(self, channel_id: str) -> ChannelData:
        self._check_api_key()
        client = self._get_client()
        response = client.post(
            "/research/user/info/",
            json={"username": channel_id},
        )
        response.raise_for_status()
        data = response.json().get("data", {}).get("user_info", {})

        return ChannelData(
            platform_channel_id=channel_id,
            name=data.get("display_name", channel_id),
            handle=f"@{channel_id}",
            description=data.get("bio"),
            country=None,
            subscriber_count=data.get("follower_count", 0),
            avg_views=None,
            is_verified=data.get("is_verified", False),
            metadata={
                "following_count": data.get("following_count", 0),
                "likes_count": data.get("likes_count", 0),
                "video_count": data.get("video_count", 0),
                "avatar_url": data.get("avatar_url"),
            },
        )

    def get_channel_videos(self, channel_id: str, limit: int = 50) -> list[VideoData]:
        self._check_api_key()
        client = self._get_client()
        videos: list[VideoData] = []
        cursor = 0
        has_more = True

        while has_more and len(videos) < limit:
            max_count = min(20, limit - len(videos))
            response = client.post(
                "/research/video/query/",
                json={
                    "query": {"and": [{"field_name": "username", "operation": "EQ", "field_values": [channel_id]}]},
                    "max_count": max_count,
                    "cursor": cursor,
                },
            )
            response.raise_for_status()
            result = response.json().get("data", {})

            for item in result.get("videos", []):
                published = None
                if item.get("create_time"):
                    published = datetime.fromtimestamp(item["create_time"], tz=timezone.utc)

                videos.append(
                    VideoData(
                        platform_video_id=str(item.get("id", "")),
                        title=item.get("video_description", "")[:500],
                        description=item.get("video_description"),
                        url=item.get("share_url"),
                        thumbnail_url=item.get("cover_image_url"),
                        view_count=item.get("view_count", 0),
                        like_count=item.get("like_count", 0),
                        comment_count=item.get("comment_count", 0),
                        share_count=item.get("share_count", 0),
                        duration_seconds=item.get("duration", 0),
                        published_at=published,
                        is_short=True,
                        metadata={
                            "hashtags": [h.get("name") for h in item.get("hashtag_names", [])],
                            "music": item.get("music_id"),
                        },
                    )
                )

            has_more = result.get("has_more", False)
            cursor = result.get("cursor", 0)

        return videos

    def search_channels(
        self,
        query: str,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[ChannelData]:
        self._check_api_key()
        client = self._get_client()
        response = client.post(
            "/research/user/info/",
            json={"username": query},
        )
        if response.status_code != 200:
            return []

        data = response.json().get("data", {}).get("user_info", {})
        if not data:
            return []

        return [
            ChannelData(
                platform_channel_id=query,
                name=data.get("display_name", query),
                handle=f"@{query}",
                description=data.get("bio"),
                country=country,
                subscriber_count=data.get("follower_count", 0),
                is_verified=data.get("is_verified", False),
                metadata={},
            )
        ]

    def get_video_metrics(self, video_ids: list[str]) -> list[VideoMetrics]:
        self._check_api_key()
        client = self._get_client()
        metrics: list[VideoMetrics] = []

        for vid_id in video_ids:
            try:
                response = client.post(
                    "/research/video/query/",
                    json={
                        "query": {"and": [{"field_name": "id", "operation": "EQ", "field_values": [vid_id]}]},
                        "max_count": 1,
                    },
                )
                response.raise_for_status()
                items = response.json().get("data", {}).get("videos", [])
                if items:
                    item = items[0]
                    metrics.append(
                        VideoMetrics(
                            platform_video_id=vid_id,
                            view_count=item.get("view_count", 0),
                            like_count=item.get("like_count", 0),
                            comment_count=item.get("comment_count", 0),
                            share_count=item.get("share_count", 0),
                        )
                    )
            except httpx.HTTPError:
                logger.warning("Failed to fetch TikTok metrics for video %s", vid_id)

        return metrics

    def get_trending(
        self,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[VideoData]:
        self._check_api_key()
        # TikTok Research API doesn't have a direct trending endpoint.
        # Use video query with high view_count threshold as a proxy.
        client = self._get_client()
        conditions = [
            {"field_name": "view_count", "operation": "GT", "field_values": ["100000"]},
        ]
        if country:
            conditions.append(
                {"field_name": "region_code", "operation": "EQ", "field_values": [country]}
            )

        response = client.post(
            "/research/video/query/",
            json={
                "query": {"and": conditions},
                "max_count": 50,
            },
        )
        response.raise_for_status()
        result = response.json().get("data", {})
        videos: list[VideoData] = []

        for item in result.get("videos", []):
            published = None
            if item.get("create_time"):
                published = datetime.fromtimestamp(item["create_time"], tz=timezone.utc)

            videos.append(
                VideoData(
                    platform_video_id=str(item.get("id", "")),
                    title=item.get("video_description", "")[:500],
                    description=item.get("video_description"),
                    url=item.get("share_url"),
                    thumbnail_url=item.get("cover_image_url"),
                    view_count=item.get("view_count", 0),
                    like_count=item.get("like_count", 0),
                    comment_count=item.get("comment_count", 0),
                    share_count=item.get("share_count", 0),
                    duration_seconds=item.get("duration", 0),
                    published_at=published,
                    is_short=True,
                    metadata={},
                )
            )

        return videos
