from halyoontok.configs.app_configs import REDIS_DB
from halyoontok.configs.app_configs import REDIS_HOST
from halyoontok.configs.app_configs import REDIS_PASSWORD
from halyoontok.configs.app_configs import REDIS_PORT

_redis_auth = f":{REDIS_PASSWORD}@" if REDIS_PASSWORD else ""
REDIS_URL = f"redis://{_redis_auth}{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

broker_url = REDIS_URL
result_backend = REDIS_URL
task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]
timezone = "UTC"
enable_utc = True
worker_pool = "threads"
worker_hijack_root_logger = False
