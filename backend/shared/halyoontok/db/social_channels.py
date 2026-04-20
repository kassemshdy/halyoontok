from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from halyoontok.configs.constants import ChannelStatus, ContentCategory, SocialPlatform
from halyoontok.db.models import SocialChannel


def list_channels(
    session: Session,
    limit: int = 50,
    offset: int = 0,
    platform: Optional[SocialPlatform] = None,
    country: Optional[str] = None,
    category: Optional[ContentCategory] = None,
    status: Optional[ChannelStatus] = None,
) -> list[SocialChannel]:
    q = session.query(SocialChannel)
    if platform:
        q = q.filter(SocialChannel.platform == platform)
    if country:
        q = q.filter(SocialChannel.country == country)
    if category:
        q = q.filter(SocialChannel.category == category)
    if status:
        q = q.filter(SocialChannel.status == status)
    return q.order_by(SocialChannel.created_at.desc()).offset(offset).limit(limit).all()


def get_channel(session: Session, channel_id: int) -> Optional[SocialChannel]:
    return session.get(SocialChannel, channel_id)


def get_channel_by_platform_id(
    session: Session, platform: SocialPlatform, platform_channel_id: str
) -> Optional[SocialChannel]:
    return (
        session.query(SocialChannel)
        .filter(
            SocialChannel.platform == platform,
            SocialChannel.platform_channel_id == platform_channel_id,
        )
        .first()
    )


def create_channel(session: Session, **kwargs) -> SocialChannel:
    channel = SocialChannel(**kwargs)
    session.add(channel)
    session.flush()
    return channel


def update_channel(session: Session, channel_id: int, **kwargs) -> Optional[SocialChannel]:
    channel = session.get(SocialChannel, channel_id)
    if not channel:
        return None
    for key, value in kwargs.items():
        if hasattr(channel, key):
            setattr(channel, key, value)
    session.flush()
    return channel


def mark_scraped(session: Session, channel_id: int) -> None:
    channel = session.get(SocialChannel, channel_id)
    if channel:
        channel.last_scraped_at = datetime.now(timezone.utc)
        session.flush()


def get_active_channels(session: Session) -> list[SocialChannel]:
    return (
        session.query(SocialChannel)
        .filter(SocialChannel.status == ChannelStatus.ACTIVE)
        .all()
    )


def count_channels(session: Session) -> int:
    return session.query(func.count(SocialChannel.id)).scalar() or 0
