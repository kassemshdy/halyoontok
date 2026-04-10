from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ChannelData:
    platform_channel_id: str
    name: str
    handle: Optional[str] = None
    description: Optional[str] = None
    country: Optional[str] = None
    subscriber_count: Optional[int] = None
    avg_views: Optional[int] = None
    is_verified: bool = False
    metadata: dict = field(default_factory=dict)


@dataclass
class VideoData:
    platform_video_id: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    share_count: int = 0
    duration_seconds: Optional[int] = None
    published_at: Optional[datetime] = None
    is_short: bool = True
    metadata: dict = field(default_factory=dict)


@dataclass
class VideoMetrics:
    platform_video_id: str
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    share_count: int = 0


class SocialPlatformClient(ABC):
    """Abstract base class for social media platform integrations."""

    @abstractmethod
    def get_channel(self, channel_id: str) -> ChannelData:
        ...

    @abstractmethod
    def get_channel_videos(self, channel_id: str, limit: int = 50) -> list[VideoData]:
        ...

    @abstractmethod
    def search_channels(self, query: str, country: Optional[str] = None, category: Optional[str] = None) -> list[ChannelData]:
        ...

    @abstractmethod
    def get_video_metrics(self, video_ids: list[str]) -> list[VideoMetrics]:
        ...

    @abstractmethod
    def get_trending(self, country: Optional[str] = None, category: Optional[str] = None) -> list[VideoData]:
        ...
