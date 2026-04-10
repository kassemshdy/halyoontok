"""Integration tests for content service."""
from __future__ import annotations

import pytest
from halyoontok.configs.constants import ContentCategory, ContentStatus, SourceType
from halyoontok.services.content_service import (
    create_video, get_video, list_videos, update_video_status, get_published_feed,
)
from halyoontok.error_handling.exceptions import HalyoonError


def test_create_video(session):
    video = create_video(
        session,
        title="Test Video",
        category=ContentCategory.HUMOR,
        source_type=SourceType.STUDIO_PRODUCED,
    )
    session.commit()
    assert video.id is not None
    assert video.title == "Test Video"
    assert video.status == ContentStatus.DRAFT


def test_get_video(session):
    video = create_video(session, title="Find Me", category=ContentCategory.SCIENCE, source_type=SourceType.AI_GENERATED)
    session.commit()
    found = get_video(session, video.id)
    assert found.title == "Find Me"


def test_get_video_not_found(session):
    with pytest.raises(HalyoonError):
        get_video(session, 999999)


def test_list_videos(session):
    create_video(session, title="V1", category=ContentCategory.SPORTS, source_type=SourceType.STUDIO_PRODUCED)
    create_video(session, title="V2", category=ContentCategory.CULTURE, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    videos = list_videos(session, limit=10)
    assert len(videos) >= 2


def test_list_videos_filter_by_status(session):
    v = create_video(session, title="Draft Only", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    drafts = list_videos(session, status=ContentStatus.DRAFT)
    assert any(vid.id == v.id for vid in drafts)


def test_workflow_draft_to_moderation(session):
    video = create_video(session, title="Workflow", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    updated = update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    assert updated.status == ContentStatus.AWAITING_MODERATION


def test_workflow_invalid_transition(session):
    video = create_video(session, title="Invalid", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    with pytest.raises(HalyoonError) as exc:
        update_video_status(session, video.id, ContentStatus.PUBLISHED)
    assert "Cannot transition" in str(exc.value)


def test_workflow_full_path(session):
    video = create_video(session, title="Full Path", category=ContentCategory.SCIENCE, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    update_video_status(session, video.id, ContentStatus.APPROVED)
    updated = update_video_status(session, video.id, ContentStatus.PUBLISHED)
    assert updated.status == ContentStatus.PUBLISHED
    assert updated.published_at is not None


def test_get_published_feed(session):
    video = create_video(session, title="Published Feed", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    update_video_status(session, video.id, ContentStatus.APPROVED)
    update_video_status(session, video.id, ContentStatus.PUBLISHED)
    session.commit()

    feed = get_published_feed(session, limit=50)
    assert any(v["title"] == "Published Feed" for v in feed)


def test_get_published_feed_category_filter(session):
    v1 = create_video(session, title="Humor Feed", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    v2 = create_video(session, title="Science Feed", category=ContentCategory.SCIENCE, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    for v in [v1, v2]:
        update_video_status(session, v.id, ContentStatus.AWAITING_MODERATION)
        update_video_status(session, v.id, ContentStatus.APPROVED)
        update_video_status(session, v.id, ContentStatus.PUBLISHED)
    session.commit()

    humor_feed = get_published_feed(session, category="humor")
    assert all(v["category"] == "humor" for v in humor_feed)
