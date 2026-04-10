from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

import httpx

from halyoontok.configs.app_configs import INSTAGRAM_ACCESS_TOKEN
from halyoontok.integrations.base import (
    ChannelData,
    SocialPlatformClient,
    VideoData,
    VideoMetrics,
)

logger = logging.getLogger(__name__)

INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com/v18.0"


class InstagramClient(SocialPlatformClient):
    """Instagram Graph API client for Reels and channel data collection.

    Requires a valid Instagram Graph API access token with appropriate permissions.
    """

    def __init__(self, access_token: str | None = None):
        self.access_token = access_token or INSTAGRAM_ACCESS_TOKEN
        self._client: httpx.Client | None = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                base_url=INSTAGRAM_GRAPH_API_BASE,
                params={"access_token": self.access_token},
                timeout=30.0,
            )
        return self._client

    def _check_token(self) -> None:
        if not self.access_token:
            raise ValueError("Instagram access token not configured. Set INSTAGRAM_ACCESS_TOKEN env var.")

    def get_channel(self, channel_id: str) -> ChannelData:
        self._check_token()
        client = self._get_client()
        response = client.get(
            f"/{channel_id}",
            params={
                "fields": "id,username,name,biography,followers_count,media_count,profile_picture_url",
            },
        )
        response.raise_for_status()
        data = response.json()

        return ChannelData(
            platform_channel_id=data.get("id", channel_id),
            name=data.get("name", ""),
            handle=f"@{data.get('username', '')}",
            description=data.get("biography"),
            country=None,
            subscriber_count=data.get("followers_count", 0),
            avg_views=None,
            is_verified=False,
            metadata={
                "media_count": data.get("media_count", 0),
                "profile_picture_url": data.get("profile_picture_url"),
            },
        )

    def get_channel_videos(self, channel_id: str, limit: int = 50) -> list[VideoData]:
        self._check_token()
        client = self._get_client()
        videos: list[VideoData] = []
        url = f"/{channel_id}/media"
        params = {
            "fields": "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
            "limit": min(limit, 100),
        }

        while url and len(videos) < limit:
            response = client.get(url, params=params)
            response.raise_for_status()
            result = response.json()

            for item in result.get("data", []):
                if item.get("media_type") not in ("VIDEO", "REELS"):
                    continue

                published = None
                if item.get("timestamp"):
                    published = datetime.fromisoformat(
                        item["timestamp"].replace("Z", "+00:00")
                    )

                videos.append(
                    VideoData(
                        platform_video_id=item["id"],
                        title=(item.get("caption") or "")[:500],
                        description=item.get("caption"),
                        url=item.get("permalink"),
                        thumbnail_url=item.get("thumbnail_url"),
                        view_count=0,
                        like_count=item.get("like_count", 0),
                        comment_count=item.get("comments_count", 0),
                        share_count=0,
                        duration_seconds=None,
                        published_at=published,
                        is_short=True,
                        metadata={"media_type": item.get("media_type")},
                    )
                )

            paging = result.get("paging", {})
            url = paging.get("next")
            params = {}

        return videos

    def search_channels(
        self,
        query: str,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[ChannelData]:
        self._check_token()
        client = self._get_client()
        response = client.get(
            "/ig_hashtag_search",
            params={"q": query},
        )
        if response.status_code != 200:
            return []

        # Instagram Graph API doesn't support direct user search.
        # Return empty — channels are added manually by ID/username.
        logger.info("Instagram channel search not supported via Graph API. Add channels by ID.")
        return []

    def get_video_metrics(self, video_ids: list[str]) -> list[VideoMetrics]:
        self._check_token()
        client = self._get_client()
        metrics: list[VideoMetrics] = []

        for vid_id in video_ids:
            try:
                response = client.get(
                    f"/{vid_id}",
                    params={"fields": "like_count,comments_count"},
                )
                response.raise_for_status()
                data = response.json()
                metrics.append(
                    VideoMetrics(
                        platform_video_id=vid_id,
                        view_count=0,
                        like_count=data.get("like_count", 0),
                        comment_count=data.get("comments_count", 0),
                        share_count=0,
                    )
                )
            except httpx.HTTPError:
                logger.warning("Failed to fetch Instagram metrics for %s", vid_id)

        return metrics

    def get_trending(
        self,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[VideoData]:
        # Instagram Graph API doesn't expose a trending endpoint.
        logger.info("Instagram trending not available via Graph API.")
        return []
