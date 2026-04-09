from sqlalchemy.orm import Session

from halyoontok.db.models import ContentIdea
from halyoontok.db.models import TrendSignal


def get_trend_signals(
    session: Session, limit: int = 50, offset: int = 0
) -> list[TrendSignal]:
    return (
        session.query(TrendSignal)
        .order_by(TrendSignal.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_trend_signal(
    session: Session, signal: TrendSignal
) -> TrendSignal:
    session.add(signal)
    session.flush()
    return signal


def get_content_ideas(
    session: Session, limit: int = 50, offset: int = 0
) -> list[ContentIdea]:
    return (
        session.query(ContentIdea)
        .order_by(ContentIdea.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_content_idea(session: Session, idea: ContentIdea) -> ContentIdea:
    session.add(idea)
    session.flush()
    return idea
