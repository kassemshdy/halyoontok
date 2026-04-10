from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routers.social_videos import SocialVideoRead
from halyoontok.auth.permissions import require_editor
from halyoontok.configs.constants import ContentCategory, SocialPlatform
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/videos")
def search_videos(
    q: str,
    platform: Optional[SocialPlatform] = None,
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[SocialVideoRead]:
    from halyoontok.services.search_service import search_videos as _search
    videos = _search(session, q, platform=platform, category=category, country=country, limit=limit, offset=offset)
    return [SocialVideoRead.model_validate(v) for v in videos]


@router.get("/similar/{video_id}")
def find_similar(
    video_id: int,
    limit: int = 10,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[SocialVideoRead]:
    from halyoontok.services.search_service import find_similar_videos
    videos = find_similar_videos(session, video_id, limit=limit)
    return [SocialVideoRead.model_validate(v) for v in videos]


@router.get("/trending-patterns")
def trending_patterns(
    country: Optional[str] = None,
    category: Optional[ContentCategory] = None,
    days: int = 7,
    limit: int = 20,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[dict]:
    from halyoontok.services.search_service import get_trending_patterns
    return get_trending_patterns(session, country=country, category=category, days=days, limit=limit)


@router.get("/recommend-references")
def recommend_references(
    category: Optional[ContentCategory] = None,
    country: Optional[str] = None,
    limit: int = 10,
    user: User = Depends(require_editor),
    session: Session = Depends(get_session_dep),
) -> list[SocialVideoRead]:
    from halyoontok.services.search_service import recommend_reference_videos
    videos = recommend_reference_videos(session, category=category, country=country, limit=limit)
    return [SocialVideoRead.model_validate(v) for v in videos]
