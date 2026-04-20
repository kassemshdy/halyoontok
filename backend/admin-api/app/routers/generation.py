from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory, GenerationStatus
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User

router = APIRouter(prefix="/generation", tags=["generation"])


class GenerationJobCreate(BaseModel):
    prompt: str
    model_name: str = "nano_banana"
    reference_video_id: Optional[int] = None
    trend_signal_id: Optional[int] = None
    content_idea_id: Optional[int] = None
    style_config: Optional[dict] = None
    generation_params: Optional[dict] = None


class GenerationJobRead(BaseModel):
    id: int
    reference_video_id: Optional[int]
    trend_signal_id: Optional[int]
    content_idea_id: Optional[int]
    prompt: str
    model_name: str
    status: GenerationStatus
    output_video_id: Optional[int]
    error_message: Optional[str]
    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[ContentCategory] = None
    style_tags: Optional[dict] = None
    base_prompt: str
    model_name: str = "nano_banana"
    default_params: Optional[dict] = None


class TemplateRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[ContentCategory]
    base_prompt: str
    model_name: str
    success_rate: float
    avg_engagement_score: float
    model_config = {"from_attributes": True}


class BatchGenerateRequest(BaseModel):
    trend_id: int
    count: int = 3
    model_name: str = "nano_banana"


@router.post("/jobs")
def create_job(
    body: GenerationJobCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> GenerationJobRead:
    from halyoontok.services.generation_service import create_generation_job
    job = create_generation_job(
        session,
        prompt=body.prompt,
        model_name=body.model_name,
        reference_video_id=body.reference_video_id,
        trend_signal_id=body.trend_signal_id,
        content_idea_id=body.content_idea_id,
        style_config=body.style_config,
        generation_params=body.generation_params,
    )
    # Queue async execution
    from halyoontok.background.tasks.generation import run_generation_job
    run_generation_job.delay(job.id)
    return GenerationJobRead.model_validate(job)


@router.get("/jobs")
def list_jobs(
    limit: int = 50,
    offset: int = 0,
    status: Optional[GenerationStatus] = None,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[GenerationJobRead]:
    from halyoontok.services.generation_service import list_generation_jobs
    jobs = list_generation_jobs(session, limit=limit, offset=offset, status=status)
    return [GenerationJobRead.model_validate(j) for j in jobs]


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> GenerationJobRead:
    from halyoontok.services.generation_service import get_generation_job
    job = get_generation_job(session, job_id)
    if not job:
        from halyoontok.error_handling.error_codes import HalyoonErrorCode
        from halyoontok.error_handling.exceptions import HalyoonError
        raise HalyoonError(HalyoonErrorCode.GENERATION_JOB_NOT_FOUND)
    return GenerationJobRead.model_validate(job)


@router.post("/jobs/{job_id}/retry")
def retry_job(
    job_id: int,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> GenerationJobRead:
    from halyoontok.services.generation_service import retry_generation_job
    job = retry_generation_job(session, job_id)
    from halyoontok.background.tasks.generation import run_generation_job
    run_generation_job.delay(job.id)
    return GenerationJobRead.model_validate(job)


@router.get("/templates")
def list_templates(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[TemplateRead]:
    from halyoontok.services.generation_service import list_templates as _list
    templates = _list(session, limit=limit, offset=offset)
    return [TemplateRead.model_validate(t) for t in templates]


@router.post("/templates")
def create_template(
    body: TemplateCreate,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> TemplateRead:
    from halyoontok.services.generation_service import create_template as _create
    template = _create(session, **body.model_dump())
    return TemplateRead.model_validate(template)


@router.post("/batch")
def batch_generate(
    body: BatchGenerateRequest,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> dict:
    from halyoontok.background.tasks.generation import batch_generate as _batch
    _batch.delay(body.trend_id, body.count, body.model_name)
    return {"status": "batch_queued", "trend_id": body.trend_id, "count": body.count}
