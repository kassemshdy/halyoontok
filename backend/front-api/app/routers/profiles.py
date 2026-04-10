from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from halyoontok.auth.schemas import ChildProfileCreate, ChildProfileRead
from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import profile_service

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("")
def list_profiles(
    user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> list[ChildProfileRead]:
    return [ChildProfileRead.model_validate(p) for p in profile_service.list_profiles(session, user.id)]


@router.post("")
def create_profile(
    body: ChildProfileCreate, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> ChildProfileRead:
    return ChildProfileRead.model_validate(profile_service.create_profile(session, user.id, **body.model_dump()))


@router.get("/{profile_id}")
def get_profile(
    profile_id: int, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> ChildProfileRead:
    return ChildProfileRead.model_validate(profile_service.get_profile(session, profile_id, user.id))
