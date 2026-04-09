from celery import Celery

celery_app = Celery("halyoontok_primary")
celery_app.config_from_object("halyoontok.background.celery.configs.primary")
celery_app.autodiscover_tasks(
    ["halyoontok.background.celery.tasks"],
    related_name="publishing",
)
