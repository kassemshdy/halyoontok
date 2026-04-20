from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory, ContentStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import studio_service

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
    limit: int = 50, offset: int = 0,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> list[IdeaRead]:
    return [IdeaRead.model_validate(i) for i in studio_service.list_ideas(session, limit, offset)]


@router.post("/ideas")
def create_idea(
    body: IdeaCreate, user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> IdeaRead:
    return IdeaRead.model_validate(studio_service.create_idea(session, **body.model_dump()))


@router.patch("/ideas/{idea_id}/status")
def update_idea_status(
    idea_id: int, body: StatusUpdate,
    user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> dict:
    idea = studio_service.update_idea_status(session, idea_id, body.status)
    return {"id": idea.id, "status": idea.status.value}


@router.post("/ideas/{idea_id}/to-video")
def convert_to_video(
    idea_id: int, user: User = Depends(require_editor), session: Session = Depends(get_session_dep),
) -> dict:
    video, idea = studio_service.convert_idea_to_video(session, idea_id)
    return {"video_id": video.id, "idea_id": idea.id}


class GenerateFromIdeaRequest(BaseModel):
    model_name: str = "nano_banana"
    params: Optional[dict] = None


@router.post("/ideas/{idea_id}/generate")
def generate_from_idea(
    idea_id: int,
    body: GenerateFromIdeaRequest,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.services.generation_service import generate_video_from_idea
    job = generate_video_from_idea(session, idea_id, body.model_name, body.params)
    from halyoontok.background.tasks.generation import run_generation_job
    run_generation_job.delay(job.id)
    return {"job_id": job.id, "idea_id": idea_id, "status": "queued"}
