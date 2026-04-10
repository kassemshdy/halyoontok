from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def overview(
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> dict:
    return analytics_service.get_overview(session)
