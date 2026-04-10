from __future__ import annotations

import os
from pathlib import Path

from halyoontok.storage.backend import StorageBackend

STORAGE_DIR = os.environ.get(
    "LOCAL_STORAGE_DIR",
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "media-api", "storage"),
)
MEDIA_API_URL = os.environ.get("MEDIA_BASE_URL", "http://localhost:8083")


class LocalStorage(StorageBackend):
    def __init__(self) -> None:
        self.storage_dir = os.path.abspath(STORAGE_DIR)

    def upload(self, file_bytes: bytes, key: str, content_type: str) -> str:
        file_path = os.path.join(self.storage_dir, key)
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return self.get_url(key)

    def get_url(self, key: str) -> str:
        return f"{MEDIA_API_URL}/{key}"

    def delete(self, key: str) -> None:
        file_path = os.path.join(self.storage_dir, key)
        if os.path.exists(file_path):
            os.remove(file_path)
