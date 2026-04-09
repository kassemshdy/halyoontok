from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import WatchEvent
from halyoontok.services import content_service

router = APIRouter(prefix="/feed", tags=["feed"])


class FeedVideoRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    language: str
    dialect: str
    duration_seconds: Optional[int] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class WatchEventCreate(BaseModel):
    child_profile_id: int
    video_id: int
    watch_duration_seconds: int
    completed: bool = False
    skipped: bool = False


@router.get("")
def get_feed(
    limit: int = 20, offset: int = 0, category: Optional[str] = None,
    session: Session = Depends(get_session_dep),
) -> list[FeedVideoRead]:
    feed = content_service.get_published_feed(session, limit, offset, category)
    return [FeedVideoRead(**v) for v in feed]


@router.post("/watch-event")
def record_watch_event(
    body: WatchEventCreate, session: Session = Depends(get_session_dep),
) -> dict:
    event = WatchEvent(**body.model_dump())
    session.add(event)
    session.flush()
    return {"id": event.id}
