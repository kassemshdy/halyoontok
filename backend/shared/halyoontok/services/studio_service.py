from __future__ import annotations
from typing import Optional

from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentCategory, ContentStatus, SourceType
from halyoontok.db.models import ContentIdea, TrendSignal, Video
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError


def list_ideas(session: Session, limit: int = 50, offset: int = 0) -> list[ContentIdea]:
    return (
        session.query(ContentIdea)
        .order_by(ContentIdea.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_idea(session: Session, **kwargs) -> ContentIdea:
    idea = ContentIdea(**kwargs)
    session.add(idea)
    session.flush()
    return idea


def update_idea_status(session: Session, idea_id: int, status: ContentStatus) -> ContentIdea:
    idea = session.get(ContentIdea, idea_id)
    if not idea:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Idea not found")
    idea.status = status
    session.flush()
    return idea


def convert_idea_to_video(session: Session, idea_id: int) -> tuple[Video, ContentIdea]:
    idea = session.get(ContentIdea, idea_id)
    if not idea:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Idea not found")

    video = Video(
        title=idea.title,
        description=idea.description,
        status=ContentStatus.DRAFT,
        category=idea.category or ContentCategory.HUMOR,
        source_type=SourceType.STUDIO_PRODUCED,
    )
    session.add(video)
    session.flush()

    idea.status = ContentStatus.APPROVED
    session.flush()
    return video, idea


def list_trend_signals(session: Session, limit: int = 50, offset: int = 0) -> list[TrendSignal]:
    return (
        session.query(TrendSignal)
        .order_by(TrendSignal.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_trend_signal(session: Session, **kwargs) -> TrendSignal:
    signal = TrendSignal(**kwargs)
    session.add(signal)
    session.flush()
    return signal
