from __future__ import annotations
from typing import Optional
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import JSON
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from halyoontok.configs.constants import AgeBand
from halyoontok.configs.constants import AssetType
from halyoontok.configs.constants import ChannelStatus
from halyoontok.configs.constants import CollectionJobStatus
from halyoontok.configs.constants import CollectionJobType
from halyoontok.configs.constants import ContentCategory
from halyoontok.configs.constants import ContentStatus
from halyoontok.configs.constants import Dialect
from halyoontok.configs.constants import GenerationStatus
from halyoontok.configs.constants import InfluencerTier
from halyoontok.configs.constants import Language
from halyoontok.configs.constants import ModerationStatus
from halyoontok.configs.constants import SocialPlatform
from halyoontok.configs.constants import SourceType
from halyoontok.configs.constants import UserRole


class Base(DeclarativeBase):
    pass


# ── User Domain ──


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, values_callable=lambda e: [x.value for x in e]), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    children: Mapped[list["ChildProfile"]] = relationship(back_populates="parent")


class ChildProfile(Base):
    __tablename__ = "child_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    age_band: Mapped[AgeBand] = mapped_column(SAEnum(AgeBand, values_callable=lambda e: [x.value for x in e]), nullable=False)
    language: Mapped[Language] = mapped_column(
        SAEnum(Language, values_callable=lambda e: [x.value for x in e]), default=Language.ARABIC
    )
    dialect: Mapped[Dialect] = mapped_column(SAEnum(Dialect, values_callable=lambda e: [x.value for x in e]), default=Dialect.MSA)
    country: Mapped[str] = mapped_column(String(50), default="LB")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    parent: Mapped["User"] = relationship(back_populates="children")
    parental_rules: Mapped[Optional["ParentalRule"]] = relationship(
        back_populates="child_profile"
    )
    watch_events: Mapped[list["WatchEvent"]] = relationship(
        back_populates="child_profile"
    )


class ParentalRule(Base):
    __tablename__ = "parental_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_profile_id: Mapped[int] = mapped_column(
        ForeignKey("child_profiles.id"), unique=True, nullable=False
    )
    daily_limit_minutes: Mapped[int] = mapped_column(Integer, default=60)
    bedtime_start: Mapped[Optional[str]] = mapped_column(String(5))  # "21:00"
    bedtime_end: Mapped[Optional[str]] = mapped_column(String(5))  # "07:00"
    education_priority: Mapped[int] = mapped_column(
        Integer, default=5
    )  # 1-10 slider
    allowed_categories: Mapped[Optional[dict]] = mapped_column(JSON)
    language_preferences: Mapped[Optional[dict]] = mapped_column(JSON)

    child_profile: Mapped["ChildProfile"] = relationship(
        back_populates="parental_rules"
    )


# ── Content Domain ──


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ContentStatus] = mapped_column(
        SAEnum(ContentStatus, values_callable=lambda e: [x.value for x in e]), default=ContentStatus.DRAFT
    )
    category: Mapped[ContentCategory] = mapped_column(
        SAEnum(ContentCategory, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    language: Mapped[Language] = mapped_column(
        SAEnum(Language, values_callable=lambda e: [x.value for x in e]), default=Language.ARABIC
    )
    dialect: Mapped[Dialect] = mapped_column(SAEnum(Dialect, values_callable=lambda e: [x.value for x in e]), default=Dialect.MSA)
    age_suitability: Mapped[AgeBand] = mapped_column(
        SAEnum(AgeBand, values_callable=lambda e: [x.value for x in e]), default=AgeBand.AGE_8_12
    )
    source_type: Mapped[SourceType] = mapped_column(
        SAEnum(SourceType, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    educational_score: Mapped[float] = mapped_column(Float, default=0.0)
    entertainment_score: Mapped[float] = mapped_column(Float, default=0.0)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    assets: Mapped[list["VideoAsset"]] = relationship(back_populates="video")
    moderation_decisions: Mapped[list["ModerationDecision"]] = relationship(
        back_populates="video"
    )
    watch_events: Mapped[list["WatchEvent"]] = relationship(back_populates="video")


class VideoAsset(Base):
    __tablename__ = "video_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    asset_type: Mapped[AssetType] = mapped_column(SAEnum(AssetType, values_callable=lambda e: [x.value for x in e]), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    video: Mapped["Video"] = relationship(back_populates="assets")


# ── Safety Domain ──


class ModerationDecision(Base):
    __tablename__ = "moderation_decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    status: Mapped[ModerationStatus] = mapped_column(
        SAEnum(ModerationStatus, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    reason: Mapped[Optional[str]] = mapped_column(Text)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    reviewer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    model_version: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    video: Mapped["Video"] = relationship(back_populates="moderation_decisions")


# ── Studio Domain ──


class TrendSignal(Base):
    __tablename__ = "trend_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    format_type: Mapped[Optional[str]] = mapped_column(String(100))
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)
    country: Mapped[Optional[str]] = mapped_column(String(50))
    auto_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    video_count: Mapped[Optional[int]] = mapped_column(Integer)
    avg_engagement: Mapped[Optional[float]] = mapped_column(Float)
    growth_rate: Mapped[Optional[float]] = mapped_column(Float)
    peak_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    related_video_ids: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    content_ideas: Mapped[list["ContentIdea"]] = relationship(
        back_populates="trend_signal"
    )


class ContentIdea(Base):
    __tablename__ = "content_ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    trend_signal_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("trend_signals.id")
    )
    status: Mapped[ContentStatus] = mapped_column(
        SAEnum(ContentStatus, values_callable=lambda e: [x.value for x in e]), default=ContentStatus.DRAFT
    )
    category: Mapped[Optional[ContentCategory]] = mapped_column(SAEnum(ContentCategory, values_callable=lambda e: [x.value for x in e]))
    script: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    trend_signal: Mapped["TrendSignal | None"] = relationship(
        back_populates="content_ideas"
    )


# ── Recommendation Domain ──


class WatchEvent(Base):
    __tablename__ = "watch_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_profile_id: Mapped[int] = mapped_column(
        ForeignKey("child_profiles.id"), nullable=False
    )
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    watch_duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    skipped: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    child_profile: Mapped["ChildProfile"] = relationship(
        back_populates="watch_events"
    )
    video: Mapped["Video"] = relationship(back_populates="watch_events")


# ── Interaction Domain ──


class VideoLike(Base):
    __tablename__ = "video_likes"
    __table_args__ = (sa.UniqueConstraint("user_id", "video_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class VideoFavorite(Base):
    __tablename__ = "video_favorites"
    __table_args__ = (sa.UniqueConstraint("user_id", "video_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


# ── Social Media Intelligence Domain ──


influencer_channels = sa.Table(
    "influencer_channels",
    Base.metadata,
    sa.Column("influencer_id", Integer, ForeignKey("influencer_profiles.id"), primary_key=True),
    sa.Column("channel_id", Integer, ForeignKey("social_channels.id"), primary_key=True),
)


class SocialChannel(Base):
    __tablename__ = "social_channels"
    __table_args__ = (
        sa.UniqueConstraint("platform", "platform_channel_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    platform: Mapped[SocialPlatform] = mapped_column(
        SAEnum(SocialPlatform, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    platform_channel_id: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    handle: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    country: Mapped[Optional[str]] = mapped_column(String(50))
    language: Mapped[Optional[Language]] = mapped_column(
        SAEnum(Language, values_callable=lambda e: [x.value for x in e])
    )
    dialect: Mapped[Optional[Dialect]] = mapped_column(
        SAEnum(Dialect, values_callable=lambda e: [x.value for x in e])
    )
    category: Mapped[Optional[ContentCategory]] = mapped_column(
        SAEnum(ContentCategory, values_callable=lambda e: [x.value for x in e])
    )
    subscriber_count: Mapped[Optional[int]] = mapped_column(Integer)
    avg_views: Mapped[Optional[int]] = mapped_column(Integer)
    avg_engagement_rate: Mapped[Optional[float]] = mapped_column(Float)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[ChannelStatus] = mapped_column(
        SAEnum(ChannelStatus, values_callable=lambda e: [x.value for x in e]),
        default=ChannelStatus.ACTIVE,
    )
    last_scraped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    videos: Mapped[list["SocialVideo"]] = relationship(back_populates="channel")
    influencers: Mapped[list["InfluencerProfile"]] = relationship(
        secondary=influencer_channels, back_populates="channels"
    )


class SocialVideo(Base):
    __tablename__ = "social_videos"
    __table_args__ = (
        sa.UniqueConstraint("platform", "platform_video_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    channel_id: Mapped[int] = mapped_column(ForeignKey("social_channels.id"), nullable=False)
    platform: Mapped[SocialPlatform] = mapped_column(
        SAEnum(SocialPlatform, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    platform_video_id: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    url: Mapped[Optional[str]] = mapped_column(String(500))
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)
    share_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    category: Mapped[Optional[ContentCategory]] = mapped_column(
        SAEnum(ContentCategory, values_callable=lambda e: [x.value for x in e])
    )
    style_tags: Mapped[Optional[dict]] = mapped_column(JSON)
    engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    virality_score: Mapped[float] = mapped_column(Float, default=0.0)
    language: Mapped[Optional[Language]] = mapped_column(
        SAEnum(Language, values_callable=lambda e: [x.value for x in e])
    )
    dialect: Mapped[Optional[Dialect]] = mapped_column(
        SAEnum(Dialect, values_callable=lambda e: [x.value for x in e])
    )
    country: Mapped[Optional[str]] = mapped_column(String(50))
    is_short: Mapped[bool] = mapped_column(Boolean, default=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    channel: Mapped["SocialChannel"] = relationship(back_populates="videos")


class InfluencerProfile(Base):
    __tablename__ = "influencer_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(50))
    language: Mapped[Optional[Language]] = mapped_column(
        SAEnum(Language, values_callable=lambda e: [x.value for x in e])
    )
    niche: Mapped[Optional[str]] = mapped_column(String(100))
    total_followers: Mapped[int] = mapped_column(Integer, default=0)
    avg_engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    tier: Mapped[InfluencerTier] = mapped_column(
        SAEnum(InfluencerTier, values_callable=lambda e: [x.value for x in e]),
        default=InfluencerTier.NANO,
    )
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    channels: Mapped[list["SocialChannel"]] = relationship(
        secondary=influencer_channels, back_populates="influencers"
    )


class CollectionJob(Base):
    __tablename__ = "collection_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_type: Mapped[CollectionJobType] = mapped_column(
        SAEnum(CollectionJobType, values_callable=lambda e: [x.value for x in e]), nullable=False
    )
    platform: Mapped[Optional[SocialPlatform]] = mapped_column(
        SAEnum(SocialPlatform, values_callable=lambda e: [x.value for x in e])
    )
    status: Mapped[CollectionJobStatus] = mapped_column(
        SAEnum(CollectionJobStatus, values_callable=lambda e: [x.value for x in e]),
        default=CollectionJobStatus.PENDING,
    )
    parameters: Mapped[Optional[dict]] = mapped_column(JSON)
    result_summary: Mapped[Optional[dict]] = mapped_column(JSON)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


# ── AI Generation Domain ──


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    reference_video_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("social_videos.id")
    )
    trend_signal_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("trend_signals.id")
    )
    content_idea_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("content_ideas.id")
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    style_config: Mapped[Optional[dict]] = mapped_column(JSON)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[GenerationStatus] = mapped_column(
        SAEnum(GenerationStatus, values_callable=lambda e: [x.value for x in e]),
        default=GenerationStatus.QUEUED,
    )
    output_video_id: Mapped[Optional[int]] = mapped_column(ForeignKey("videos.id"))
    generation_params: Mapped[Optional[dict]] = mapped_column(JSON)
    result_metadata: Mapped[Optional[dict]] = mapped_column(JSON)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    reference_video: Mapped["SocialVideo | None"] = relationship(foreign_keys=[reference_video_id])
    trend_signal: Mapped["TrendSignal | None"] = relationship(foreign_keys=[trend_signal_id])
    content_idea: Mapped["ContentIdea | None"] = relationship(foreign_keys=[content_idea_id])
    output_video: Mapped["Video | None"] = relationship(foreign_keys=[output_video_id])


class GenerationTemplate(Base):
    __tablename__ = "generation_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[ContentCategory]] = mapped_column(
        SAEnum(ContentCategory, values_callable=lambda e: [x.value for x in e])
    )
    style_tags: Mapped[Optional[dict]] = mapped_column(JSON)
    base_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    default_params: Mapped[Optional[dict]] = mapped_column(JSON)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_engagement_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
