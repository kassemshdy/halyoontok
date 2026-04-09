from __future__ import annotations

from sqlalchemy.orm import Session

from halyoontok.db.models import VideoLike, VideoFavorite


def toggle_like(session: Session, user_id: int, video_id: int) -> bool:
    existing = (
        session.query(VideoLike)
        .filter(VideoLike.user_id == user_id, VideoLike.video_id == video_id)
        .first()
    )
    if existing:
        session.delete(existing)
        session.flush()
        return False
    else:
        session.add(VideoLike(user_id=user_id, video_id=video_id))
        session.flush()
        return True


def toggle_favorite(session: Session, user_id: int, video_id: int) -> bool:
    existing = (
        session.query(VideoFavorite)
        .filter(VideoFavorite.user_id == user_id, VideoFavorite.video_id == video_id)
        .first()
    )
    if existing:
        session.delete(existing)
        session.flush()
        return False
    else:
        session.add(VideoFavorite(user_id=user_id, video_id=video_id))
        session.flush()
        return True


def get_interactions(session: Session, user_id: int, video_id: int) -> dict:
    liked = session.query(VideoLike).filter(
        VideoLike.user_id == user_id, VideoLike.video_id == video_id
    ).first() is not None

    favorited = session.query(VideoFavorite).filter(
        VideoFavorite.user_id == user_id, VideoFavorite.video_id == video_id
    ).first() is not None

    return {"liked": liked, "favorited": favorited, "video_id": video_id}
