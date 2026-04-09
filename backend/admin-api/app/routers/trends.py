from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import TrendSignal, User
from halyoontok.db.studio import get_trend_signals, create_trend_signal

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
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[TrendSignalRead]:
    signals = get_trend_signals(session, limit, offset)
    return [TrendSignalRead.model_validate(s) for s in signals]


@router.post("/signals")
def create_signal(
    body: TrendSignalCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> TrendSignalRead:
    signal = TrendSignal(**body.model_dump())
    result = create_trend_signal(session, signal)
    return TrendSignalRead.model_validate(result)
