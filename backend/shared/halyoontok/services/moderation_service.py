from __future__ import annotations

from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentStatus, ModerationStatus
from halyoontok.db.models import ModerationDecision, Video


def get_moderation_queue(session: Session, limit: int = 50) -> list[Video]:
    return (
        session.query(Video)
        .filter(Video.status == ContentStatus.AWAITING_MODERATION)
        .order_by(Video.created_at.asc())
        .limit(limit)
        .all()
    )


def submit_moderation_decision(
    session: Session,
    video_id: int,
    status: ModerationStatus,
    reviewer_id: int,
    reason: str | None = None,
    confidence: float | None = None,
) -> ModerationDecision:
    decision = ModerationDecision(
        video_id=video_id,
        status=status,
        reason=reason,
        confidence=confidence,
        reviewer_id=reviewer_id,
    )
    session.add(decision)

    video = session.get(Video, video_id)
    if video:
        if status == ModerationStatus.APPROVED:
            video.status = ContentStatus.APPROVED
        elif status == ModerationStatus.REJECTED:
            video.status = ContentStatus.ARCHIVED
        elif status == ModerationStatus.CHANGES_REQUESTED:
            video.status = ContentStatus.CHANGES_REQUESTED

    session.flush()
    return decision
