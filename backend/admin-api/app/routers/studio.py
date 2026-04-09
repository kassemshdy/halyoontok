from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory, ContentStatus, SourceType
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ContentIdea, User, Video
from halyoontok.db.studio import get_content_ideas
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/studio", tags=["studio"])


class IdeaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    trend_signal_id: Optional[int] = None
    category: Optional[ContentCategory] = None


class IdeaRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: ContentStatus
    category: Optional[ContentCategory]
    script: Optional[str]
    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: ContentStatus


@router.get("/ideas")
def list_ideas(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[IdeaRead]:
    ideas = get_content_ideas(session, limit, offset)
    return [IdeaRead.model_validate(i) for i in ideas]


@router.post("/ideas")
def create_idea(
    body: IdeaCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> IdeaRead:
    idea = ContentIdea(**body.model_dump())
    session.add(idea)
    session.flush()
    return IdeaRead.model_validate(idea)


@router.patch("/ideas/{idea_id}/status")
def update_idea_status(
    idea_id: int,
    body: StatusUpdate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    idea = session.get(ContentIdea, idea_id)
    if not idea:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Idea not found")
    idea.status = body.status
    session.flush()
    return {"id": idea.id, "status": idea.status.value}


@router.post("/ideas/{idea_id}/to-video")
def convert_idea_to_video(
    idea_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    idea = session.get(ContentIdea, idea_id)
    if not idea:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Idea not found")

    video = Video(
        title=idea.title,
        description=idea.description,
        status=ContentStatus.DRAFT,
        category=idea.category or ContentCategory.HUMOR,
        source_type=SourceType.STUDIO_PRODUCED,
    )
    session.add(video)
    session.flush()

    idea.status = ContentStatus.APPROVED
    session.flush()

    return {"video_id": video.id, "idea_id": idea.id}
