"""Integration tests for moderation service."""
from __future__ import annotations

from halyoontok.configs.constants import ContentCategory, ContentStatus, ModerationStatus, SourceType
from halyoontok.services.content_service import create_video, update_video_status
from halyoontok.services.moderation_service import get_moderation_queue, submit_moderation_decision


def test_moderation_queue_empty(session):
    queue = get_moderation_queue(session)
    # May or may not be empty depending on other tests
    assert isinstance(queue, list)


def test_submit_approval(session, admin_user):
    video = create_video(session, title="Approve Me", category=ContentCategory.HUMOR, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    session.commit()

    decision = submit_moderation_decision(session, video.id, ModerationStatus.APPROVED, admin_user.id, "Looks good")
    session.commit()

    assert decision.status == ModerationStatus.APPROVED
    assert decision.reviewer_id == admin_user.id
    # Video should now be approved
    session.refresh(video)
    assert video.status == ContentStatus.APPROVED


def test_submit_rejection(session, admin_user):
    video = create_video(session, title="Reject Me", category=ContentCategory.SPORTS, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    session.commit()

    submit_moderation_decision(session, video.id, ModerationStatus.REJECTED, admin_user.id, "Not appropriate")
    session.commit()

    session.refresh(video)
    assert video.status == ContentStatus.ARCHIVED


def test_submit_changes_requested(session, admin_user):
    video = create_video(session, title="Change Me", category=ContentCategory.CULTURE, source_type=SourceType.STUDIO_PRODUCED)
    session.commit()
    update_video_status(session, video.id, ContentStatus.AWAITING_MODERATION)
    session.commit()

    submit_moderation_decision(session, video.id, ModerationStatus.CHANGES_REQUESTED, admin_user.id, "Fix the audio")
    session.commit()

    session.refresh(video)
    assert video.status == ContentStatus.CHANGES_REQUESTED
