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


class AutoDetectedTrendRead(BaseModel):
    id: int
    source: str
    topic: str
    format_type: Optional[str]
    relevance_score: float
    country: Optional[str]
    auto_detected: bool
    confidence: Optional[float]
    video_count: Optional[int]
    avg_engagement: Optional[float]
    growth_rate: Optional[float]
    related_video_ids: Optional[list]
    model_config = {"from_attributes": True}


@router.get("/auto-detected")
def list_auto_detected(
    limit: int = 50, offset: int = 0,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> list[AutoDetectedTrendRead]:
    from halyoontok.db.models import TrendSignal
    trends = (
        session.query(TrendSignal)
        .filter(TrendSignal.auto_detected == True)
        .order_by(TrendSignal.relevance_score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [AutoDetectedTrendRead.model_validate(t) for t in trends]


@router.post("/signals/{signal_id}/create-idea")
def create_idea_from_trend(
    signal_id: int,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.services.generation_service import create_idea_from_trend
    idea = create_idea_from_trend(session, signal_id)
    return {"idea_id": idea.id, "title": idea.title}
