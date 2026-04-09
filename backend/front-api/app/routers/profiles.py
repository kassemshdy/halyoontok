from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from halyoontok.auth.schemas import ChildProfileCreate, ChildProfileRead
from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ChildProfile, User
from halyoontok.db.users import get_child_profiles_by_parent
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("")
def list_profiles(
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> list[ChildProfileRead]:
    profiles = get_child_profiles_by_parent(session, user.id)
    return [ChildProfileRead.model_validate(p) for p in profiles]


@router.post("")
def create_profile(
    body: ChildProfileCreate,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ChildProfileRead:
    profile = ChildProfile(parent_id=user.id, **body.model_dump())
    session.add(profile)
    session.flush()
    return ChildProfileRead.model_validate(profile)


@router.get("/{profile_id}")
def get_profile(
    profile_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ChildProfileRead:
    profile = session.get(ChildProfile, profile_id)
    if not profile or profile.parent_id != user.id:
        raise HalyoonError(HalyoonErrorCode.PROFILE_NOT_FOUND)
    return ChildProfileRead.model_validate(profile)
