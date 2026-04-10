from celery import Celery
from celery.schedules import crontab

from halyoontok.configs.app_configs import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

celery_app = Celery("halyoontok")

celery_app.conf.update(
    broker_url=CELERY_BROKER_URL,
    result_backend=CELERY_RESULT_BACKEND,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.autodiscover_tasks(
    [
        "halyoontok.background.tasks",
    ],
)

celery_app.conf.beat_schedule = {
    "sync-all-channels-every-6h": {
        "task": "halyoontok.background.tasks.data_collection.sync_all_channels",
        "schedule": crontab(minute=0, hour="*/6"),
    },
    "compute-virality-scores-every-4h": {
        "task": "halyoontok.background.tasks.data_collection.compute_virality_scores",
        "schedule": crontab(minute=30, hour="*/4"),
    },
    "detect-trends-every-3h": {
        "task": "halyoontok.background.tasks.trend_detection.detect_trends",
        "schedule": crontab(minute=0, hour="*/3"),
    },
}
