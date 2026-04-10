import os

# App
APP_HOST = os.environ.get("APP_HOST", "0.0.0.0")
APP_PORT = int(os.environ.get("APP_PORT", "8080"))
APP_API_PREFIX = os.environ.get("APP_API_PREFIX", "/api")
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

# Auth
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = int(os.environ.get("JWT_EXPIRATION_MINUTES", "60"))

# PostgreSQL — supports DATABASE_URL (Railway) or individual vars
DATABASE_URL = os.environ.get("DATABASE_URL", "")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", "5432"))
POSTGRES_USER = os.environ.get("POSTGRES_USER", "halyoontok")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "halyoontok")
POSTGRES_DB = os.environ.get("POSTGRES_DB", "halyoontok")
POSTGRES_POOL_SIZE = int(os.environ.get("POSTGRES_POOL_SIZE", "10"))
POSTGRES_POOL_OVERFLOW = int(os.environ.get("POSTGRES_POOL_OVERFLOW", "5"))

# Redis — supports REDIS_URL (Railway) or individual vars
REDIS_URL = os.environ.get("REDIS_URL", "")
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")
REDIS_DB = int(os.environ.get("REDIS_DB", "0"))

# Storage
STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "local")
MEDIA_BASE_URL = os.environ.get("MEDIA_BASE_URL", "http://localhost:8083")

# Cloudflare R2 (prod)
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "halyoontok-media")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "")

# Celery
def _build_redis_url() -> str:
    if REDIS_URL:
        return REDIS_URL
    pwd = f":{REDIS_PASSWORD}@" if REDIS_PASSWORD else ""
    return f"redis://{pwd}{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "") or _build_redis_url()
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "") or _build_redis_url()

# Social media API keys
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
TIKTOK_API_KEY = os.environ.get("TIKTOK_API_KEY", "")
INSTAGRAM_ACCESS_TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
DATA_COLLECTION_INTERVAL_HOURS = int(os.environ.get("DATA_COLLECTION_INTERVAL_HOURS", "6"))

# AI generation
AI_GENERATION_API_URL = os.environ.get("AI_GENERATION_API_URL", "")
AI_GENERATION_API_KEY = os.environ.get("AI_GENERATION_API_KEY", "")
DEFAULT_GENERATION_MODEL = os.environ.get("DEFAULT_GENERATION_MODEL", "nano_banana")
