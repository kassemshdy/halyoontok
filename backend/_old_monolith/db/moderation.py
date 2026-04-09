from sqlalchemy.orm import Session

from halyoontok.configs.constants import ModerationStatus
from halyoontok.db.models import ModerationDecision
from halyoontok.db.models import Video


def get_moderation_queue(session: Session, limit: int = 50) -> list[Video]:
    from halyoontok.configs.constants import ContentStatus

    return (
        session.query(Video)
        .filter(Video.status == ContentStatus.AWAITING_MODERATION)
        .order_by(Video.created_at.asc())
        .limit(limit)
        .all()
    )


def create_moderation_decision(
    session: Session, decision: ModerationDecision
) -> ModerationDecision:
    session.add(decision)
    session.flush()
    return decision


def get_decisions_for_video(
    session: Session, video_id: int
) -> list[ModerationDecision]:
    return (
        session.query(ModerationDecision)
        .filter(ModerationDecision.video_id == video_id)
        .order_by(ModerationDecision.created_at.desc())
        .all()
    )
