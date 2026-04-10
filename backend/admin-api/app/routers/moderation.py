from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_moderator
from halyoontok.configs.constants import ModerationStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import moderation_service

router = APIRouter(prefix="/moderation", tags=["moderation"])


class ModerationDecisionCreate(BaseModel):
    video_id: int
    status: ModerationStatus
    reason: Optional[str] = None
    confidence: Optional[float] = None


@router.get("/queue")
def list_queue(
    limit: int = 50, user: User = Depends(require_moderator), session: Session = Depends(get_session_dep),
) -> list:
    return moderation_service.get_moderation_queue(session, limit)


@router.post("/decisions")
def submit_decision(
    body: ModerationDecisionCreate, user: User = Depends(require_moderator), session: Session = Depends(get_session_dep),
) -> dict:
    decision = moderation_service.submit_moderation_decision(
        session, body.video_id, body.status, user.id, body.reason, body.confidence,
    )
    return {"id": decision.id, "status": decision.status.value}
