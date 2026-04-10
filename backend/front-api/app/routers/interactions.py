from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import interaction_service

router = APIRouter(prefix="/feed", tags=["interactions"])


class InteractionRequest(BaseModel):
    video_id: int


@router.post("/like")
def toggle_like(
    body: InteractionRequest, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> dict:
    liked = interaction_service.toggle_like(session, user.id, body.video_id)
    return {"liked": liked, "video_id": body.video_id}


@router.post("/favorite")
def toggle_favorite(
    body: InteractionRequest, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> dict:
    favorited = interaction_service.toggle_favorite(session, user.id, body.video_id)
    return {"favorited": favorited, "video_id": body.video_id}


@router.get("/interactions")
def get_interactions(
    video_id: int, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> dict:
    return interaction_service.get_interactions(session, user.id, video_id)
