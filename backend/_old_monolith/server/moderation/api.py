from __future__ import annotations
from typing import Optional
from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_moderator
from halyoontok.configs.constants import ModerationStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.moderation import create_moderation_decision
from halyoontok.db.moderation import get_moderation_queue
from halyoontok.db.models import ModerationDecision
from halyoontok.db.models import User

router = APIRouter(prefix="/moderation", tags=["moderation"])


class ModerationDecisionCreate(BaseModel):
    video_id: int
    status: ModerationStatus
    reason: Optional[str] = None
    confidence: Optional[float] = None


class VideoQueueItem(BaseModel):
    id: int
    title: str
    status: str
    category: str
    created_at: str

    model_config = {"from_attributes": True}


@router.get("/queue")
def list_moderation_queue(
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
    return {"id": decision.id, "status": decision.status}
