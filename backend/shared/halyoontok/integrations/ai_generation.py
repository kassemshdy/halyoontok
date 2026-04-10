from __future__ import annotations

import logging
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

from halyoontok.configs.app_configs import (
    AI_GENERATION_API_KEY,
    AI_GENERATION_API_URL,
    DEFAULT_GENERATION_MODEL,
)

logger = logging.getLogger(__name__)


@dataclass
class GenerationRequest:
    prompt: str
    reference_url: Optional[str] = None
    style_config: dict = field(default_factory=dict)
    model_name: str = ""
    params: dict = field(default_factory=dict)


@dataclass
class GenerationResult:
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    output_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata: dict = field(default_factory=dict)
    error: Optional[str] = None


class AIGenerationClient(ABC):
    """Abstract base class for AI video generation services."""

    @abstractmethod
    def generate_video(self, request: GenerationRequest) -> GenerationResult:
        ...

    @abstractmethod
    def check_status(self, job_id: str) -> GenerationResult:
        ...

    @abstractmethod
    def download_result(self, job_id: str) -> bytes:
        ...


class MockGenerationClient(AIGenerationClient):
    """Mock implementation for development and testing.

    Simulates the generation workflow without calling any external API.
    """

    def __init__(self):
        self._jobs: dict[str, GenerationResult] = {}

    def generate_video(self, request: GenerationRequest) -> GenerationResult:
        job_id = str(uuid.uuid4())
        result = GenerationResult(
            job_id=job_id,
            status="completed",
            output_url=f"mock://generated/{job_id}.mp4",
            duration_seconds=30,
            metadata={
                "prompt": request.prompt,
                "model": request.model_name or DEFAULT_GENERATION_MODEL,
                "mock": True,
            },
        )
        self._jobs[job_id] = result
        logger.info("Mock generation job created: %s", job_id)
        return result

    def check_status(self, job_id: str) -> GenerationResult:
        if job_id in self._jobs:
            return self._jobs[job_id]
        return GenerationResult(job_id=job_id, status="not_found", error="Job not found")

    def download_result(self, job_id: str) -> bytes:
        # Return empty bytes for mock
        return b""


def get_generation_client() -> AIGenerationClient:
    """Factory function to get the configured generation client.

    Returns MockGenerationClient when no API URL is configured.
    """
    if AI_GENERATION_API_URL and AI_GENERATION_API_KEY:
        # When a real generation API is configured, import and return
        # the specific client implementation here.
        logger.info("No real generation client implemented yet, using mock.")

    return MockGenerationClient()
