from celery import Celery

celery_app = Celery("halyoontok_media")
celery_app.config_from_object("halyoontok.background.celery.configs.media")
celery_app.autodiscover_tasks(
    ["halyoontok.background.celery.tasks"],
    related_name="media_processing",
)
