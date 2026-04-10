"""Integration tests for analytics service."""
from __future__ import annotations

from halyoontok.services.analytics_service import get_overview


def test_get_overview(session):
    result = get_overview(session)
    assert "total_videos" in result
    assert "published_videos" in result
    assert "total_watches" in result
    assert "total_watch_time_seconds" in result
    assert "avg_watch_duration_seconds" in result
    assert isinstance(result["total_videos"], int)
