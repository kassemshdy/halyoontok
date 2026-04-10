"""Integration tests for studio service."""
from __future__ import annotations

import pytest
from halyoontok.configs.constants import ContentCategory, ContentStatus
from halyoontok.services.studio_service import (
    create_idea, list_ideas, update_idea_status, convert_idea_to_video,
    create_trend_signal, list_trend_signals,
)
from halyoontok.error_handling.exceptions import HalyoonError


def test_create_idea(session):
    idea = create_idea(session, title="Test Idea", category=ContentCategory.HUMOR)
    session.commit()
    assert idea.id is not None
    assert idea.title == "Test Idea"
    assert idea.status == ContentStatus.DRAFT


def test_list_ideas(session):
    create_idea(session, title="Idea 1")
    create_idea(session, title="Idea 2")
    session.commit()
    ideas = list_ideas(session)
    assert len(ideas) >= 2


def test_update_idea_status(session):
    idea = create_idea(session, title="Status Idea")
    session.commit()
    updated = update_idea_status(session, idea.id, ContentStatus.APPROVED)
    assert updated.status == ContentStatus.APPROVED


def test_update_nonexistent_idea(session):
    with pytest.raises(HalyoonError):
        update_idea_status(session, 999999, ContentStatus.APPROVED)


def test_convert_idea_to_video(session):
    idea = create_idea(session, title="Convert Me", category=ContentCategory.SCIENCE, description="Test desc")
    session.commit()
    video, updated_idea = convert_idea_to_video(session, idea.id)
    session.commit()

    assert video.title == "Convert Me"
    assert video.status == ContentStatus.DRAFT
    assert updated_idea.status == ContentStatus.APPROVED


def test_convert_nonexistent_idea(session):
    with pytest.raises(HalyoonError):
        convert_idea_to_video(session, 999999)


def test_create_trend_signal(session):
    signal = create_trend_signal(session, source="TikTok", topic="Dance challenge", country="LB", relevance_score=0.8)
    session.commit()
    assert signal.id is not None
    assert signal.source == "TikTok"


def test_list_trend_signals(session):
    create_trend_signal(session, source="YouTube", topic="Science facts")
    session.commit()
    signals = list_trend_signals(session)
    assert len(signals) >= 1
