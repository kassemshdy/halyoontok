from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User, VideoLike, VideoFavorite

router = APIRouter(prefix="/feed", tags=["interactions"])


class InteractionRequest(BaseModel):
    video_id: int


@router.post("/like")
def toggle_like(
    body: InteractionRequest,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> dict:
    existing = (
        session.query(VideoLike)
        .filter(VideoLike.user_id == user.id, VideoLike.video_id == body.video_id)
        .first()
    )
    if existing:
        session.delete(existing)
        session.flush()
        return {"liked": False, "video_id": body.video_id}
    else:
        session.add(VideoLike(user_id=user.id, video_id=body.video_id))
        session.flush()
        return {"liked": True, "video_id": body.video_id}


@router.post("/favorite")
def toggle_favorite(
    body: InteractionRequest,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> dict:
    existing = (
        session.query(VideoFavorite)
        .filter(VideoFavorite.user_id == user.id, VideoFavorite.video_id == body.video_id)
        .first()
    )
    if existing:
        session.delete(existing)
        session.flush()
        return {"favorited": False, "video_id": body.video_id}
    else:
        session.add(VideoFavorite(user_id=user.id, video_id=body.video_id))
        session.flush()
        return {"favorited": True, "video_id": body.video_id}


@router.get("/interactions")
def get_interactions(
    video_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> dict:
    liked = session.query(VideoLike).filter(
        VideoLike.user_id == user.id, VideoLike.video_id == video_id
    ).first() is not None

    favorited = session.query(VideoFavorite).filter(
        VideoFavorite.user_id == user.id, VideoFavorite.video_id == video_id
    ).first() is not None

    return {"liked": liked, "favorited": favorited, "video_id": video_id}
