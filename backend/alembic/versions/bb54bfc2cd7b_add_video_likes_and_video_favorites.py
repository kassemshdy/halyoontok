"""add video_likes and video_favorites

Revision ID: bb54bfc2cd7b
Revises: b50b16735581
Create Date: 2026-04-10 02:00:34.856492

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'bb54bfc2cd7b'
down_revision: Union[str, None] = 'b50b16735581'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "video_likes",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("video_id", sa.Integer, sa.ForeignKey("videos.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "video_id"),
    )

    op.create_table(
        "video_favorites",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("video_id", sa.Integer, sa.ForeignKey("videos.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "video_id"),
    )


def downgrade() -> None:
    op.drop_table("video_favorites")
    op.drop_table("video_likes")
