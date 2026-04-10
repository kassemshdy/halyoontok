import json
import logging
import os
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[1]:
            log["error"] = str(record.exc_info[1])
        return json.dumps(log)


def setup_logger(
    name: str = "halyoontok",
    level: int = logging.INFO,
) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        use_json = os.environ.get("LOG_FORMAT", "text") == "json"
        if use_json:
            handler.setFormatter(JSONFormatter())
        else:
            handler.setFormatter(
                logging.Formatter(
                    "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                    datefmt="%Y-%m-%d %H:%M:%S",
                )
            )
        logger.addHandler(handler)
    logger.setLevel(level)
    return logger
