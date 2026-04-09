"""Simple in-memory rate limiter for auth endpoints."""
from __future__ import annotations

import time
from collections import defaultdict
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limits specific path prefixes by client IP."""

    def __init__(self, app, paths: list[str], max_requests: int = 10, window_seconds: int = 60):
        super().__init__(app)
        self.paths = paths
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if not any(path.startswith(p) for p in self.paths):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        key = f"{client_ip}:{path}"

        # Clean old entries
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window_seconds]

        if len(self.requests[key]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"error_code": "rate_limited", "detail": "Too many requests. Try again later."},
            )

        self.requests[key].append(now)
        return await call_next(request)
