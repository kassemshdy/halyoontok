from __future__ import annotations

import os
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    @abstractmethod
    def upload(self, file_bytes: bytes, key: str, content_type: str) -> str:
        """Upload file and return its public URL."""
        ...

    @abstractmethod
    def get_url(self, key: str) -> str:
        """Get public URL for a stored file."""
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete a stored file."""
        ...


def get_storage_backend() -> StorageBackend:
    backend_type = os.environ.get("STORAGE_BACKEND", "local")
    if backend_type == "r2":
        from halyoontok.storage.r2 import R2Storage
        return R2Storage()
    else:
        from halyoontok.storage.local import LocalStorage
        return LocalStorage()
