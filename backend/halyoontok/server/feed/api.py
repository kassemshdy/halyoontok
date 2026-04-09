from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.db.content import get_published_videos
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import WatchEvent

router = APIRouter(prefix="/feed", tags=["feed"])


class FeedVideoRead(BaseModel):
    id: int
    title: str
    category: str
    language: str
    dialect: str
    duration_seconds: int | None

    model_config = {"from_attributes": True}


class WatchEventCreate(BaseModel):
    child_profile_id: int
    video_id: int
    watch_duration_seconds: int
    completed: bool = False
    skipped: bool = False


@router.get("", response_model=list[FeedVideoRead])
def get_feed(
    child_profile_id: int,
    limit: int = 20,
    session: Session = Depends(get_session_dep),
) -> list:
    # TODO: replace with recommendation engine logic
    return get_published_videos(session, limit)


@router.post("/watch-event")
def record_watch_event(
    body: WatchEventCreate,
    session: Session = Depends(get_session_dep),
) -> dict:
    event = WatchEvent(**body.model_dump())
    session.add(event)
    session.flush()
    return {"id": event.id}
