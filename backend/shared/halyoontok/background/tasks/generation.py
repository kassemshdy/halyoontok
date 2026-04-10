import logging

from celery import shared_task

from halyoontok.db.engine.sql_engine import get_session

logger = logging.getLogger(__name__)


@shared_task(expires=7200)
def run_generation_job(job_id: int) -> dict:
    """Execute AI video generation, poll for completion, download result."""
    logger.info("Running generation job %d", job_id)
    with get_session() as session:
        from halyoontok.services.generation_service import run_generation, convert_to_halyoon_video
        job = run_generation(session, job_id)

        if job.status.value == "post_processing":
            video = convert_to_halyoon_video(session, job_id)
            return {"job_id": job_id, "status": "completed", "video_id": video.id}

        return {"job_id": job_id, "status": job.status.value}


@shared_task(expires=7200)
def post_process_generation(job_id: int) -> dict:
    """Create thumbnails, extract metadata, run safety pre-scan."""
    logger.info("Post-processing generation job %d", job_id)
    with get_session() as session:
        from halyoontok.services.generation_service import convert_to_halyoon_video
        video = convert_to_halyoon_video(session, job_id)
    return {"job_id": job_id, "video_id": video.id}


@shared_task(expires=14400)
def batch_generate(trend_id: int, count: int = 3, model_name: str = "nano_banana") -> dict:
    """Generate multiple videos from a single trend."""
    logger.info("Batch generating %d videos from trend %d", count, trend_id)
    job_ids = []
    with get_session() as session:
        from halyoontok.services.generation_service import create_idea_from_trend, generate_video_from_idea

        for i in range(count):
            idea = create_idea_from_trend(session, trend_id)
            job = generate_video_from_idea(session, idea.id, model_name)
            job_ids.append(job.id)

    # Queue individual generation jobs
    for jid in job_ids:
        run_generation_job.delay(jid)

    return {"trend_id": trend_id, "jobs_queued": len(job_ids), "job_ids": job_ids}
