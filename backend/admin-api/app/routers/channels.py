from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ChannelStatus, ContentCategory, Dialect, Language, SocialPlatform
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelCreate(BaseModel):
    platform: SocialPlatform
    platform_channel_id: str
    category: Optional[ContentCategory] = None
    country: Optional[str] = None


class ChannelRead(BaseModel):
    id: int
    platform: SocialPlatform
    platform_channel_id: str
    name: str
    handle: Optional[str]
    description: Optional[str]
    country: Optional[str]
    language: Optional[Language]
    dialect: Optional[Dialect]
    category: Optional[ContentCategory]
    subscriber_count: Optional[int]
    avg_views: Optional[int]
    avg_engagement_rate: Optional[float]
    is_verified: bool
    status: ChannelStatus
    last_scraped_at: Optional[str]
    model_config = {"from_attributes": True}


class ChannelDiscoverRequest(BaseModel):
    platform: SocialPlatform
    query: str
    country: Optional[str] = None


@router.get("")
def list_channels(
    limit: int = 50,
    offset: int = 0,
    platform: Optional[SocialPlatform] = None,
    country: Optional[str] = None,
    category: Optional[ContentCategory] = None,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[ChannelRead]:
    from halyoontok.db import social_channels
    channels = social_channels.list_channels(
        session, limit=limit, offset=offset, platform=platform, country=country, category=category
    )
    return [ChannelRead.model_validate(c) for c in channels]


@router.post("")
def add_channel(
    body: ChannelCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> ChannelRead:
    from halyoontok.services.data_collection_service import add_channel as _add
    channel = _add(session, body.platform, body.platform_channel_id, body.category, body.country)
    return ChannelRead.model_validate(channel)


@router.get("/{channel_id}")
def get_channel(
    channel_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> ChannelRead:
    from halyoontok.db import social_channels
    channel = social_channels.get_channel(session, channel_id)
    if not channel:
        raise HalyoonError(HalyoonErrorCode.CHANNEL_NOT_FOUND)
    return ChannelRead.model_validate(channel)


@router.post("/{channel_id}/refresh")
def refresh_channel(
    channel_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.db import social_channels
    channel = social_channels.get_channel(session, channel_id)
    if not channel:
        raise HalyoonError(HalyoonErrorCode.CHANNEL_NOT_FOUND)
    from halyoontok.background.tasks.data_collection import fetch_channel_videos
    fetch_channel_videos.delay(channel_id)
    return {"status": "queued", "channel_id": channel_id}


@router.delete("/{channel_id}")
def archive_channel(
    channel_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.db import social_channels
    channel = social_channels.update_channel(session, channel_id, status=ChannelStatus.ARCHIVED)
    if not channel:
        raise HalyoonError(HalyoonErrorCode.CHANNEL_NOT_FOUND)
    return {"status": "archived", "channel_id": channel_id}


@router.post("/discover")
def discover_channels(
    body: ChannelDiscoverRequest,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.background.tasks.data_collection import discover_channels as _discover
    _discover.delay(body.platform.value, body.country, body.query)
    return {"status": "discovery_queued", "platform": body.platform.value, "query": body.query}
