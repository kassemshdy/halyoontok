from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Optional

from halyoontok.configs.app_configs import YOUTUBE_API_KEY
from halyoontok.integrations.base import (
    ChannelData,
    SocialPlatformClient,
    VideoData,
    VideoMetrics,
)

logger = logging.getLogger(__name__)


def _parse_iso8601_duration(duration: str) -> int:
    """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration or "")
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


class YouTubeClient(SocialPlatformClient):
    """YouTube Data API v3 client for channel and video data collection."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or YOUTUBE_API_KEY
        self._service = None

    def _get_service(self):
        if self._service is None:
            from googleapiclient.discovery import build
            self._service = build("youtube", "v3", developerKey=self.api_key)
        return self._service

    def get_channel(self, channel_id: str) -> ChannelData:
        service = self._get_service()
        response = (
            service.channels()
            .list(part="snippet,statistics,brandingSettings", id=channel_id)
            .execute()
        )
        items = response.get("items", [])
        if not items:
            raise ValueError(f"YouTube channel not found: {channel_id}")

        item = items[0]
        snippet = item["snippet"]
        stats = item.get("statistics", {})

        return ChannelData(
            platform_channel_id=channel_id,
            name=snippet.get("title", ""),
            handle=snippet.get("customUrl"),
            description=snippet.get("description"),
            country=snippet.get("country"),
            subscriber_count=int(stats.get("subscriberCount", 0)),
            avg_views=None,
            is_verified=False,
            metadata={
                "view_count": int(stats.get("viewCount", 0)),
                "video_count": int(stats.get("videoCount", 0)),
                "thumbnails": snippet.get("thumbnails", {}),
            },
        )

    def get_channel_videos(self, channel_id: str, limit: int = 50) -> list[VideoData]:
        service = self._get_service()
        videos: list[VideoData] = []
        next_page_token = None

        while len(videos) < limit:
            max_results = min(50, limit - len(videos))
            search_response = (
                service.search()
                .list(
                    part="id",
                    channelId=channel_id,
                    type="video",
                    order="date",
                    maxResults=max_results,
                    pageToken=next_page_token,
                )
                .execute()
            )

            video_ids = [
                item["id"]["videoId"]
                for item in search_response.get("items", [])
                if item["id"].get("videoId")
            ]
            if not video_ids:
                break

            details_response = (
                service.videos()
                .list(
                    part="snippet,statistics,contentDetails",
                    id=",".join(video_ids),
                )
                .execute()
            )

            for item in details_response.get("items", []):
                snippet = item["snippet"]
                stats = item.get("statistics", {})
                content = item.get("contentDetails", {})
                duration = _parse_iso8601_duration(content.get("duration", ""))

                published = None
                if snippet.get("publishedAt"):
                    published = datetime.fromisoformat(
                        snippet["publishedAt"].replace("Z", "+00:00")
                    )

                videos.append(
                    VideoData(
                        platform_video_id=item["id"],
                        title=snippet.get("title", ""),
                        description=snippet.get("description"),
                        url=f"https://www.youtube.com/watch?v={item['id']}",
                        thumbnail_url=snippet.get("thumbnails", {})
                        .get("high", {})
                        .get("url"),
                        view_count=int(stats.get("viewCount", 0)),
                        like_count=int(stats.get("likeCount", 0)),
                        comment_count=int(stats.get("commentCount", 0)),
                        share_count=0,
                        duration_seconds=duration,
                        published_at=published,
                        is_short=duration <= 60,
                        metadata={
                            "tags": snippet.get("tags", []),
                            "category_id": snippet.get("categoryId"),
                        },
                    )
                )

            next_page_token = search_response.get("nextPageToken")
            if not next_page_token:
                break

        return videos

    def search_channels(
        self,
        query: str,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[ChannelData]:
        service = self._get_service()
        params = {
            "part": "snippet",
            "q": query,
            "type": "channel",
            "maxResults": 25,
        }
        if country:
            params["regionCode"] = country

        response = service.search().list(**params).execute()
        channels: list[ChannelData] = []

        for item in response.get("items", []):
            snippet = item["snippet"]
            channels.append(
                ChannelData(
                    platform_channel_id=item["id"]["channelId"],
                    name=snippet.get("title", ""),
                    handle=None,
                    description=snippet.get("description"),
                    country=country,
                    metadata={"thumbnails": snippet.get("thumbnails", {})},
                )
            )

        return channels

    def get_video_metrics(self, video_ids: list[str]) -> list[VideoMetrics]:
        service = self._get_service()
        metrics: list[VideoMetrics] = []

        for i in range(0, len(video_ids), 50):
            batch = video_ids[i : i + 50]
            response = (
                service.videos()
                .list(part="statistics", id=",".join(batch))
                .execute()
            )
            for item in response.get("items", []):
                stats = item.get("statistics", {})
                metrics.append(
                    VideoMetrics(
                        platform_video_id=item["id"],
                        view_count=int(stats.get("viewCount", 0)),
                        like_count=int(stats.get("likeCount", 0)),
                        comment_count=int(stats.get("commentCount", 0)),
                        share_count=0,
                    )
                )

        return metrics

    def get_trending(
        self,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[VideoData]:
        service = self._get_service()
        params = {
            "part": "snippet,statistics,contentDetails",
            "chart": "mostPopular",
            "maxResults": 50,
        }
        if country:
            params["regionCode"] = country

        response = service.videos().list(**params).execute()
        videos: list[VideoData] = []

        for item in response.get("items", []):
            snippet = item["snippet"]
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})
            duration = _parse_iso8601_duration(content.get("duration", ""))

            published = None
            if snippet.get("publishedAt"):
                published = datetime.fromisoformat(
                    snippet["publishedAt"].replace("Z", "+00:00")
                )

            videos.append(
                VideoData(
                    platform_video_id=item["id"],
                    title=snippet.get("title", ""),
                    description=snippet.get("description"),
                    url=f"https://www.youtube.com/watch?v={item['id']}",
                    thumbnail_url=snippet.get("thumbnails", {})
                    .get("high", {})
                    .get("url"),
                    view_count=int(stats.get("viewCount", 0)),
                    like_count=int(stats.get("likeCount", 0)),
                    comment_count=int(stats.get("commentCount", 0)),
                    share_count=0,
                    duration_seconds=duration,
                    published_at=published,
                    is_short=duration <= 60,
                    metadata={
                        "tags": snippet.get("tags", []),
                        "category_id": snippet.get("categoryId"),
                    },
                )
            )

        return videos
