import os

# App
APP_HOST = os.environ.get("APP_HOST", "0.0.0.0")
APP_PORT = int(os.environ.get("APP_PORT", "8080"))
APP_API_PREFIX = os.environ.get("APP_API_PREFIX", "/api")
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

# Auth
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = int(os.environ.get("JWT_EXPIRATION_MINUTES", "60"))

# PostgreSQL
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", "5432"))
POSTGRES_USER = os.environ.get("POSTGRES_USER", "halyoontok")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "halyoontok")
POSTGRES_DB = os.environ.get("POSTGRES_DB", "halyoontok")
POSTGRES_POOL_SIZE = int(os.environ.get("POSTGRES_POOL_SIZE", "10"))
POSTGRES_POOL_OVERFLOW = int(os.environ.get("POSTGRES_POOL_OVERFLOW", "5"))

# Redis
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")
REDIS_DB = int(os.environ.get("REDIS_DB", "0"))

# S3 / Object Storage
S3_BUCKET = os.environ.get("S3_BUCKET", "halyoontok-media")
S3_ENDPOINT = os.environ.get("S3_ENDPOINT", "")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY", "")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY", "")
