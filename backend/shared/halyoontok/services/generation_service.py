from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from halyoontok.configs.constants import ContentCategory, ContentStatus, GenerationStatus, SourceType
from halyoontok.db.models import ContentIdea, GenerationJob, GenerationTemplate, SocialVideo, TrendSignal, Video
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError
from halyoontok.integrations.ai_generation import GenerationRequest, get_generation_client

logger = logging.getLogger(__name__)


def create_generation_job(
    session: Session,
    prompt: str,
    model_name: str,
    reference_video_id: Optional[int] = None,
    trend_signal_id: Optional[int] = None,
    content_idea_id: Optional[int] = None,
    style_config: Optional[dict] = None,
    generation_params: Optional[dict] = None,
) -> GenerationJob:
    job = GenerationJob(
        reference_video_id=reference_video_id,
        trend_signal_id=trend_signal_id,
        content_idea_id=content_idea_id,
        prompt=prompt,
        style_config=style_config or {},
        model_name=model_name,
        status=GenerationStatus.QUEUED,
        generation_params=generation_params or {},
    )
    session.add(job)
    session.flush()
    return job


def build_prompt(
    session: Session,
    reference_video_id: Optional[int] = None,
    trend_signal_id: Optional[int] = None,
    category: Optional[str] = None,
    style: Optional[str] = None,
    user_prompt: str = "",
) -> str:
    """Construct an optimized prompt from data signals."""
    parts = []

    if reference_video_id:
        ref = session.get(SocialVideo, reference_video_id)
        if ref:
            parts.append(f"Reference video: '{ref.title}'")
            if ref.description:
                parts.append(f"Description: {ref.description[:200]}")
            if ref.style_tags:
                parts.append(f"Style: {', '.join(ref.style_tags) if isinstance(ref.style_tags, list) else str(ref.style_tags)}")

    if trend_signal_id:
        trend = session.get(TrendSignal, trend_signal_id)
        if trend:
            parts.append(f"Trend: {trend.topic} (format: {trend.format_type or 'general'})")

    if category:
        parts.append(f"Category: {category}")
    if style:
        parts.append(f"Style: {style}")
    if user_prompt:
        parts.append(f"Instructions: {user_prompt}")

    return "\n".join(parts)


def run_generation(session: Session, job_id: int) -> GenerationJob:
    """Execute the generation job using the configured AI client."""
    job = session.get(GenerationJob, job_id)
    if not job:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Generation job not found")

    job.status = GenerationStatus.GENERATING
    session.flush()

    client = get_generation_client()

    reference_url = None
    if job.reference_video_id:
        ref = session.get(SocialVideo, job.reference_video_id)
        if ref:
            reference_url = ref.url

    request = GenerationRequest(
        prompt=job.prompt,
        reference_url=reference_url,
        style_config=job.style_config or {},
        model_name=job.model_name,
        params=job.generation_params or {},
    )

    try:
        result = client.generate_video(request)
        job.result_metadata = result.metadata
        if result.status == "completed":
            job.status = GenerationStatus.POST_PROCESSING
        elif result.status == "failed":
            job.status = GenerationStatus.FAILED
            job.error_message = result.error
        session.flush()
    except Exception as e:
        job.status = GenerationStatus.FAILED
        job.error_message = str(e)
        session.flush()
        raise

    return job


def convert_to_halyoon_video(session: Session, job_id: int) -> Video:
    """Create a Video record from a completed generation job."""
    job = session.get(GenerationJob, job_id)
    if not job:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Generation job not found")
    if job.status not in (GenerationStatus.POST_PROCESSING, GenerationStatus.COMPLETED):
        raise HalyoonError(HalyoonErrorCode.INVALID_STATE, "Job not ready for conversion")

    category = ContentCategory.HUMOR
    if job.content_idea_id:
        idea = session.get(ContentIdea, job.content_idea_id)
        if idea and idea.category:
            category = idea.category
    if job.reference_video_id:
        ref = session.get(SocialVideo, job.reference_video_id)
        if ref and ref.category:
            category = ref.category

    video = Video(
        title=f"Generated: {job.prompt[:100]}",
        description=job.prompt,
        status=ContentStatus.AI_GENERATED,
        category=category,
        source_type=SourceType.AI_GENERATED,
    )
    session.add(video)
    session.flush()

    job.output_video_id = video.id
    job.status = GenerationStatus.COMPLETED
    job.completed_at = datetime.now(timezone.utc)
    session.flush()

    return video


def list_generation_jobs(
    session: Session,
    limit: int = 50,
    offset: int = 0,
    status: Optional[GenerationStatus] = None,
) -> list[GenerationJob]:
    q = session.query(GenerationJob)
    if status:
        q = q.filter(GenerationJob.status == status)
    return q.order_by(GenerationJob.created_at.desc()).offset(offset).limit(limit).all()


def get_generation_job(session: Session, job_id: int) -> Optional[GenerationJob]:
    return session.get(GenerationJob, job_id)


def retry_generation_job(session: Session, job_id: int) -> GenerationJob:
    job = session.get(GenerationJob, job_id)
    if not job:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Generation job not found")
    if job.status != GenerationStatus.FAILED:
        raise HalyoonError(HalyoonErrorCode.INVALID_STATE, "Only failed jobs can be retried")
    job.status = GenerationStatus.QUEUED
    job.error_message = None
    session.flush()
    return job


# ── Templates ──


def list_templates(session: Session, limit: int = 50, offset: int = 0) -> list[GenerationTemplate]:
    return (
        session.query(GenerationTemplate)
        .order_by(GenerationTemplate.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_template(session: Session, **kwargs) -> GenerationTemplate:
    template = GenerationTemplate(**kwargs)
    session.add(template)
    session.flush()
    return template


# ── Enhanced Studio ──


def create_idea_from_trend(session: Session, trend_id: int) -> ContentIdea:
    trend = session.get(TrendSignal, trend_id)
    if not trend:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Trend signal not found")

    idea = ContentIdea(
        title=f"Trend: {trend.topic}",
        description=f"Content idea based on trending topic '{trend.topic}' from {trend.source}. "
                    f"Format: {trend.format_type or 'general'}. Country: {trend.country or 'global'}.",
        trend_signal_id=trend.id,
        status=ContentStatus.DRAFT,
    )
    session.add(idea)
    session.flush()
    return idea


def generate_video_from_idea(
    session: Session,
    idea_id: int,
    model_name: str,
    params: Optional[dict] = None,
) -> GenerationJob:
    idea = session.get(ContentIdea, idea_id)
    if not idea:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "Content idea not found")

    prompt = build_prompt(
        session,
        trend_signal_id=idea.trend_signal_id,
        category=idea.category.value if idea.category else None,
        user_prompt=f"{idea.title}: {idea.description or ''}",
    )

    return create_generation_job(
        session,
        prompt=prompt,
        model_name=model_name,
        content_idea_id=idea.id,
        trend_signal_id=idea.trend_signal_id,
        generation_params=params,
    )
