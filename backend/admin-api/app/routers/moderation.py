from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_moderator
from halyoontok.configs.constants import ContentStatus, ModerationStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.moderation import create_moderation_decision, get_moderation_queue
from halyoontok.db.models import ModerationDecision, User, Video

router = APIRouter(prefix="/moderation", tags=["moderation"])


class ModerationDecisionCreate(BaseModel):
    video_id: int
    status: ModerationStatus
    reason: Optional[str] = None
    confidence: Optional[float] = None


@router.get("/queue")
def list_queue(
    limit: int = 50,
    user: User = Depends(require_moderator),
    session: Session = Depends(get_session_dep),
) -> list:
    return get_moderation_queue(session, limit)


@router.post("/decisions")
def submit_decision(
    body: ModerationDecisionCreate,
    user: User = Depends(require_moderator),
    session: Session = Depends(get_session_dep),
) -> dict:
    decision = ModerationDecision(
        video_id=body.video_id,
        status=body.status,
        reason=body.reason,
        confidence=body.confidence,
        reviewer_id=user.id,
    )
    create_moderation_decision(session, decision)

    # Update video status based on moderation decision
    video = session.get(Video, body.video_id)
    if video:
        if body.status == ModerationStatus.APPROVED:
            video.status = ContentStatus.APPROVED
        elif body.status == ModerationStatus.REJECTED:
            video.status = ContentStatus.ARCHIVED
        elif body.status == ModerationStatus.CHANGES_REQUESTED:
            video.status = ContentStatus.CHANGES_REQUESTED
        session.flush()

    return {"id": decision.id, "status": decision.status.value}
