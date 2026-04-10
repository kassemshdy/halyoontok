"""Integration tests for interaction service."""
from __future__ import annotations

from halyoontok.configs.constants import ContentCategory, SourceType
from halyoontok.services.content_service import create_video
from halyoontok.services.interaction_service import toggle_like, toggle_favorite, get_interactions


def test_toggle_like(session, parent_user):
    video = create_video(session, title="Like Test", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()

    # First like
    liked = toggle_like(session, parent_user.id, video.id)
    session.commit()
    assert liked is True

    # Unlike
    liked = toggle_like(session, parent_user.id, video.id)
    session.commit()
    assert liked is False


def test_toggle_favorite(session, parent_user):
    video = create_video(session, title="Fav Test", category=ContentCategory.SCIENCE, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()

    favorited = toggle_favorite(session, parent_user.id, video.id)
    session.commit()
    assert favorited is True

    favorited = toggle_favorite(session, parent_user.id, video.id)
    session.commit()
    assert favorited is False


def test_get_interactions(session, parent_user):
    video = create_video(session, title="Interactions", category=ContentCategory.SPORTS, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()

    toggle_like(session, parent_user.id, video.id)
    session.commit()

    result = get_interactions(session, parent_user.id, video.id)
    assert result["liked"] is True
    assert result["favorited"] is False

    toggle_favorite(session, parent_user.id, video.id)
    session.commit()

    result = get_interactions(session, parent_user.id, video.id)
    assert result["liked"] is True
    assert result["favorited"] is True
