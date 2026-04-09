from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import TrendSignal
from halyoontok.db.models import User
from halyoontok.db.studio import get_trend_signals

router = APIRouter(prefix="/trends", tags=["trends"])


class TrendSignalRead(BaseModel):
    id: int
    source: str
    topic: str
    format_type: str | None
    relevance_score: float
    country: str | None

    model_config = {"from_attributes": True}


@router.get("/signals", response_model=list[TrendSignalRead])
def list_signals(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[TrendSignal]:
    return get_trend_signals(session, limit, offset)
