"""initial schema

Revision ID: b50b16735581
Revises:
Create Date: 2026-04-09 23:56:43.067579

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b50b16735581'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("parent", "admin", "moderator", "editor", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Child Profiles
    op.create_table(
        "child_profiles",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("parent_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("age", sa.Integer, nullable=False),
        sa.Column("age_band", sa.Enum("under_8", "8_12", "13_15", name="ageband"), nullable=False),
        sa.Column("language", sa.Enum("ar", "en", name="language"), default="ar"),
        sa.Column("dialect", sa.Enum("msa", "lebanese", "iraqi", "none", name="dialect"), default="msa"),
        sa.Column("country", sa.String(50), default="LB"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Parental Rules
    op.create_table(
        "parental_rules",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("child_profile_id", sa.Integer, sa.ForeignKey("child_profiles.id"), unique=True, nullable=False),
        sa.Column("daily_limit_minutes", sa.Integer, default=60),
        sa.Column("bedtime_start", sa.String(5)),
        sa.Column("bedtime_end", sa.String(5)),
        sa.Column("education_priority", sa.Integer, default=5),
        sa.Column("allowed_categories", sa.JSON),
        sa.Column("language_preferences", sa.JSON),
    )

    # Videos
    op.create_table(
        "videos",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.Enum(
            "draft", "ai_generated", "awaiting_editor", "awaiting_moderation",
            "changes_requested", "approved", "scheduled", "published", "archived",
            name="contentstatus"
        ), default="draft"),
        sa.Column("category", sa.Enum(
            "humor", "sports", "science", "english_learning", "arabic_literacy",
            "culture", "safe_trends", "character_stories",
            name="contentcategory"
        ), nullable=False),
        sa.Column("language", sa.Enum("ar", "en", name="language"), default="ar"),
        sa.Column("dialect", sa.Enum("msa", "lebanese", "iraqi", "none", name="dialect"), default="msa"),
        sa.Column("age_suitability", sa.Enum("under_8", "8_12", "13_15", name="ageband"), default="8_12"),
        sa.Column("source_type", sa.Enum("ai_generated", "studio_produced", "operator_created", name="sourcetype"), nullable=False),
        sa.Column("educational_score", sa.Float, default=0.0),
        sa.Column("entertainment_score", sa.Float, default=0.0),
        sa.Column("duration_seconds", sa.Integer),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("published_at", sa.DateTime(timezone=True)),
    )

    # Video Assets
    op.create_table(
        "video_assets",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("video_id", sa.Integer, sa.ForeignKey("videos.id"), nullable=False),
        sa.Column("asset_type", sa.Enum("video_raw", "video_hls", "thumbnail", "subtitle", "audio", name="assettype"), nullable=False),
        sa.Column("storage_path", sa.String(500), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Moderation Decisions
    op.create_table(
        "moderation_decisions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("video_id", sa.Integer, sa.ForeignKey("videos.id"), nullable=False),
        sa.Column("status", sa.Enum("pending", "approved", "rejected", "changes_requested", name="moderationstatus"), nullable=False),
        sa.Column("reason", sa.Text),
        sa.Column("confidence", sa.Float),
        sa.Column("reviewer_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("model_version", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Trend Signals
    op.create_table(
        "trend_signals",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("topic", sa.String(255), nullable=False),
        sa.Column("format_type", sa.String(100)),
        sa.Column("relevance_score", sa.Float, default=0.0),
        sa.Column("country", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Content Ideas
    op.create_table(
        "content_ideas",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("trend_signal_id", sa.Integer, sa.ForeignKey("trend_signals.id")),
        sa.Column("status", sa.Enum(
            "draft", "ai_generated", "awaiting_editor", "awaiting_moderation",
            "changes_requested", "approved", "scheduled", "published", "archived",
            name="contentstatus"
        ), default="draft"),
        sa.Column("category", sa.Enum(
            "humor", "sports", "science", "english_learning", "arabic_literacy",
            "culture", "safe_trends", "character_stories",
            name="contentcategory"
        )),
        sa.Column("script", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Watch Events
    op.create_table(
        "watch_events",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("child_profile_id", sa.Integer, sa.ForeignKey("child_profiles.id"), nullable=False),
        sa.Column("video_id", sa.Integer, sa.ForeignKey("videos.id"), nullable=False),
        sa.Column("watch_duration_seconds", sa.Integer, default=0),
        sa.Column("completed", sa.Boolean, default=False),
        sa.Column("skipped", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("watch_events")
    op.drop_table("content_ideas")
    op.drop_table("trend_signals")
    op.drop_table("moderation_decisions")
    op.drop_table("video_assets")
    op.drop_table("videos")
    op.drop_table("parental_rules")
    op.drop_table("child_profiles")
    op.drop_table("users")

    for enum_name in [
        "userrole", "ageband", "language", "dialect", "contentstatus",
        "contentcategory", "sourcetype", "assettype", "moderationstatus",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
