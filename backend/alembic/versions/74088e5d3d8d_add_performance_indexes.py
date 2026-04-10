"""add performance indexes

Revision ID: 74088e5d3d8d
Revises: bb54bfc2cd7b
Create Date: 2026-04-10 02:34:07.071431

"""
from typing import Sequence, Union

from alembic import op


revision: str = '74088e5d3d8d'
down_revision: Union[str, None] = 'bb54bfc2cd7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Feed query: published videos ordered by published_at
    op.create_index("ix_videos_status_published_at", "videos", ["status", "published_at"])

    # Watch events by child profile
    op.create_index("ix_watch_events_child_profile_id", "watch_events", ["child_profile_id"])

    # Watch events by video (for analytics)
    op.create_index("ix_watch_events_video_id", "watch_events", ["video_id"])

    # Moderation decisions by video
    op.create_index("ix_moderation_decisions_video_id", "moderation_decisions", ["video_id"])

    # Video assets by video
    op.create_index("ix_video_assets_video_id", "video_assets", ["video_id"])

    # Likes/favorites by user
    op.create_index("ix_video_likes_user_id", "video_likes", ["user_id"])
    op.create_index("ix_video_favorites_user_id", "video_favorites", ["user_id"])

    # Child profiles by parent
    op.create_index("ix_child_profiles_parent_id", "child_profiles", ["parent_id"])


def downgrade() -> None:
    op.drop_index("ix_child_profiles_parent_id")
    op.drop_index("ix_video_favorites_user_id")
    op.drop_index("ix_video_likes_user_id")
    op.drop_index("ix_video_assets_video_id")
    op.drop_index("ix_moderation_decisions_video_id")
    op.drop_index("ix_watch_events_video_id")
    op.drop_index("ix_watch_events_child_profile_id")
    op.drop_index("ix_videos_status_published_at")
