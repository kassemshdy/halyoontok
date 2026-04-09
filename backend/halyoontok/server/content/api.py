from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory
from halyoontok.configs.constants import ContentStatus
from halyoontok.configs.constants import Dialect
from halyoontok.configs.constants import Language
from halyoontok.configs.constants import SourceType
from halyoontok.db.content import get_published_videos
from halyoontok.db.content import get_video_by_id
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.db.models import Video
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/content", tags=["content"])


class VideoCreate(BaseModel):
    title: str
    description: str | None = None
    category: ContentCategory
    language: Language = Language.ARABIC
    dialect: Dialect = Dialect.MSA
    source_type: SourceType


class VideoRead(BaseModel):
    id: int
    title: str
    description: str | None
    status: ContentStatus
    category: ContentCategory
    language: Language
    dialect: Dialect
    duration_seconds: int | None

    model_config = {"from_attributes": True}


@router.get("/videos", response_model=list[VideoRead])
def list_videos(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session_dep),
) -> list[Video]:
    return get_published_videos(session, limit, offset)


@router.post("/videos", response_model=VideoRead)
def create_video(
    body: VideoCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> Video:
    video = Video(**body.model_dump())
    session.add(video)
    session.flush()
    return video


@router.get("/videos/{video_id}", response_model=VideoRead)
def get_video(
    video_id: int,
    session: Session = Depends(get_session_dep),
) -> Video:
    video = get_video_by_id(session, video_id)
    if not video:
        raise HalyoonError(HalyoonErrorCode.VIDEO_NOT_FOUND)
    return video
