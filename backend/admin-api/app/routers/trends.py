from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import studio_service

router = APIRouter(prefix="/trends", tags=["trends"])


class TrendSignalCreate(BaseModel):
    source: str
    topic: str
    format_type: Optional[str] = None
    relevance_score: float = 0.0
    country: Optional[str] = None


class TrendSignalRead(BaseModel):
    id: int
    source: str
    topic: str
    format_type: Optional[str]
    relevance_score: float
    country: Optional[str]
    model_config = {"from_attributes": True}


@router.get("/signals")
def list_signals(
    limit: int = 50, offset: int = 0,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> list[TrendSignalRead]:
    return [TrendSignalRead.model_validate(s) for s in studio_service.list_trend_signals(session, limit, offset)]


@router.post("/signals")
def create_signal(
    body: TrendSignalCreate, user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> TrendSignalRead:
    return TrendSignalRead.model_validate(studio_service.create_trend_signal(session, **body.model_dump()))
