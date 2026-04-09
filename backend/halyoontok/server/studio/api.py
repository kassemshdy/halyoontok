from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory
from halyoontok.configs.constants import ContentStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ContentIdea
from halyoontok.db.models import User
from halyoontok.db.studio import get_content_ideas
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/studio", tags=["studio"])


class IdeaCreate(BaseModel):
    title: str
    description: str | None = None
    trend_signal_id: int | None = None
    category: ContentCategory | None = None


class IdeaRead(BaseModel):
    id: int
    title: str
    description: str | None
    status: ContentStatus
    category: ContentCategory | None
    script: str | None

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: ContentStatus


@router.get("/ideas", response_model=list[IdeaRead])
def list_ideas(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[ContentIdea]:
    return get_content_ideas(session, limit, offset)


@router.post("/ideas", response_model=IdeaRead)
def create_idea(
    body: IdeaCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> ContentIdea:
    idea = ContentIdea(**body.model_dump())
    session.add(idea)
    session.flush()
    return idea


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
    return {"id": idea.id, "status": idea.status}
