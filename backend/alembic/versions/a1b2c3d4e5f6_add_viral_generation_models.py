"""add viral video generation models

Revision ID: a1b2c3d4e5f6
Revises: 74088e5d3d8d
Create Date: 2026-04-10 03:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '74088e5d3d8d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -- Enums --
    social_platform = sa.Enum('youtube', 'tiktok', 'instagram', name='socialplatform')
    channel_status = sa.Enum('active', 'paused', 'archived', name='channelstatus')
    influencer_tier = sa.Enum('nano', 'micro', 'mid', 'macro', 'mega', name='influencertier')
    collection_job_type = sa.Enum('channel_discovery', 'video_fetch', 'metrics_update', name='collectionjobtype')
    collection_job_status = sa.Enum('pending', 'running', 'completed', 'failed', name='collectionjobstatus')
    generation_status = sa.Enum('queued', 'generating', 'post_processing', 'completed', 'failed', name='generationstatus')

    social_platform.create(op.get_bind(), checkfirst=True)
    channel_status.create(op.get_bind(), checkfirst=True)
    influencer_tier.create(op.get_bind(), checkfirst=True)
    collection_job_type.create(op.get_bind(), checkfirst=True)
    collection_job_status.create(op.get_bind(), checkfirst=True)
    generation_status.create(op.get_bind(), checkfirst=True)

    # -- Enhance TrendSignal with auto-detection fields --
    op.add_column('trend_signals', sa.Column('auto_detected', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('trend_signals', sa.Column('confidence', sa.Float(), nullable=True))
    op.add_column('trend_signals', sa.Column('video_count', sa.Integer(), nullable=True))
    op.add_column('trend_signals', sa.Column('avg_engagement', sa.Float(), nullable=True))
    op.add_column('trend_signals', sa.Column('growth_rate', sa.Float(), nullable=True))
    op.add_column('trend_signals', sa.Column('peak_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('trend_signals', sa.Column('related_video_ids', sa.JSON(), nullable=True))

    # -- Social Channels --
    op.create_table(
        'social_channels',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('platform', social_platform, nullable=False),
        sa.Column('platform_channel_id', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('handle', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('country', sa.String(50), nullable=True),
        sa.Column('language', sa.Enum('ar', 'en', name='language', create_type=False), nullable=True),
        sa.Column('dialect', sa.Enum('msa', 'lebanese', 'iraqi', 'none', name='dialect', create_type=False), nullable=True),
        sa.Column('category', sa.Enum('humor', 'sports', 'science', 'english_learning', 'arabic_literacy', 'culture', 'safe_trends', 'character_stories', name='contentcategory', create_type=False), nullable=True),
        sa.Column('subscriber_count', sa.Integer(), nullable=True),
        sa.Column('avg_views', sa.Integer(), nullable=True),
        sa.Column('avg_engagement_rate', sa.Float(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('status', channel_status, server_default='active', nullable=False),
        sa.Column('last_scraped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('platform', 'platform_channel_id'),
    )

    # -- Social Videos --
    op.create_table(
        'social_videos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('channel_id', sa.Integer(), sa.ForeignKey('social_channels.id'), nullable=False),
        sa.Column('platform', social_platform, nullable=False),
        sa.Column('platform_video_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('view_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('like_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('comment_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('share_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('category', sa.Enum('humor', 'sports', 'science', 'english_learning', 'arabic_literacy', 'culture', 'safe_trends', 'character_stories', name='contentcategory', create_type=False), nullable=True),
        sa.Column('style_tags', sa.JSON(), nullable=True),
        sa.Column('engagement_rate', sa.Float(), server_default='0', nullable=False),
        sa.Column('virality_score', sa.Float(), server_default='0', nullable=False),
        sa.Column('language', sa.Enum('ar', 'en', name='language', create_type=False), nullable=True),
        sa.Column('dialect', sa.Enum('msa', 'lebanese', 'iraqi', 'none', name='dialect', create_type=False), nullable=True),
        sa.Column('country', sa.String(50), nullable=True),
        sa.Column('is_short', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('platform', 'platform_video_id'),
    )

    # -- Influencer Profiles --
    op.create_table(
        'influencer_profiles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('country', sa.String(50), nullable=True),
        sa.Column('language', sa.Enum('ar', 'en', name='language', create_type=False), nullable=True),
        sa.Column('niche', sa.String(100), nullable=True),
        sa.Column('total_followers', sa.Integer(), server_default='0', nullable=False),
        sa.Column('avg_engagement_rate', sa.Float(), server_default='0', nullable=False),
        sa.Column('tier', influencer_tier, server_default='nano', nullable=False),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # -- Influencer-Channel M2M --
    op.create_table(
        'influencer_channels',
        sa.Column('influencer_id', sa.Integer(), sa.ForeignKey('influencer_profiles.id'), primary_key=True),
        sa.Column('channel_id', sa.Integer(), sa.ForeignKey('social_channels.id'), primary_key=True),
    )

    # -- Collection Jobs --
    op.create_table(
        'collection_jobs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('job_type', collection_job_type, nullable=False),
        sa.Column('platform', social_platform, nullable=True),
        sa.Column('status', collection_job_status, server_default='pending', nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=True),
        sa.Column('result_summary', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # -- Generation Jobs --
    op.create_table(
        'generation_jobs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('reference_video_id', sa.Integer(), sa.ForeignKey('social_videos.id'), nullable=True),
        sa.Column('trend_signal_id', sa.Integer(), sa.ForeignKey('trend_signals.id'), nullable=True),
        sa.Column('content_idea_id', sa.Integer(), sa.ForeignKey('content_ideas.id'), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('style_config', sa.JSON(), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('status', generation_status, server_default='queued', nullable=False),
        sa.Column('output_video_id', sa.Integer(), sa.ForeignKey('videos.id'), nullable=True),
        sa.Column('generation_params', sa.JSON(), nullable=True),
        sa.Column('result_metadata', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    # -- Generation Templates --
    op.create_table(
        'generation_templates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.Enum('humor', 'sports', 'science', 'english_learning', 'arabic_literacy', 'culture', 'safe_trends', 'character_stories', name='contentcategory', create_type=False), nullable=True),
        sa.Column('style_tags', sa.JSON(), nullable=True),
        sa.Column('base_prompt', sa.Text(), nullable=False),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('default_params', sa.JSON(), nullable=True),
        sa.Column('success_rate', sa.Float(), server_default='0', nullable=False),
        sa.Column('avg_engagement_score', sa.Float(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # -- Indexes for performance --
    op.create_index('ix_social_channels_platform', 'social_channels', ['platform'])
    op.create_index('ix_social_channels_country', 'social_channels', ['country'])
    op.create_index('ix_social_channels_status', 'social_channels', ['status'])
    op.create_index('ix_social_videos_channel_id', 'social_videos', ['channel_id'])
    op.create_index('ix_social_videos_platform', 'social_videos', ['platform'])
    op.create_index('ix_social_videos_virality', 'social_videos', ['virality_score'])
    op.create_index('ix_social_videos_country', 'social_videos', ['country'])
    op.create_index('ix_generation_jobs_status', 'generation_jobs', ['status'])
    op.create_index('ix_trend_signals_auto', 'trend_signals', ['auto_detected'])


def downgrade() -> None:
    op.drop_index('ix_trend_signals_auto')
    op.drop_index('ix_generation_jobs_status')
    op.drop_index('ix_social_videos_country')
    op.drop_index('ix_social_videos_virality')
    op.drop_index('ix_social_videos_platform')
    op.drop_index('ix_social_videos_channel_id')
    op.drop_index('ix_social_channels_status')
    op.drop_index('ix_social_channels_country')
    op.drop_index('ix_social_channels_platform')

    op.drop_table('generation_templates')
    op.drop_table('generation_jobs')
    op.drop_table('collection_jobs')
    op.drop_table('influencer_channels')
    op.drop_table('influencer_profiles')
    op.drop_table('social_videos')
    op.drop_table('social_channels')

    op.drop_column('trend_signals', 'related_video_ids')
    op.drop_column('trend_signals', 'peak_date')
    op.drop_column('trend_signals', 'growth_rate')
    op.drop_column('trend_signals', 'avg_engagement')
    op.drop_column('trend_signals', 'video_count')
    op.drop_column('trend_signals', 'confidence')
    op.drop_column('trend_signals', 'auto_detected')

    op.execute("DROP TYPE IF EXISTS generationstatus")
    op.execute("DROP TYPE IF EXISTS collectionjobstatus")
    op.execute("DROP TYPE IF EXISTS collectionjobtype")
    op.execute("DROP TYPE IF EXISTS influencertier")
    op.execute("DROP TYPE IF EXISTS channelstatus")
    op.execute("DROP TYPE IF EXISTS socialplatform")
