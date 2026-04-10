from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.db.models import Video
from halyoontok.db.models import WatchEvent

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def get_overview(
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    total_videos = session.query(func.count(Video.id)).scalar()
    total_watches = session.query(func.count(WatchEvent.id)).scalar()
    total_watch_time = (
        session.query(func.sum(WatchEvent.watch_duration_seconds)).scalar() or 0
    )
    return {
        "total_videos": total_videos,
        "total_watches": total_watches,
        "total_watch_time_seconds": total_watch_time,
    }
