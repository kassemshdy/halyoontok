from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from halyoontok.auth.schemas import ChildProfileCreate
from halyoontok.auth.schemas import ChildProfileRead
from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ChildProfile
from halyoontok.db.models import User
from halyoontok.db.users import get_child_profiles_by_parent
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("", response_model=list[ChildProfileRead])
def list_profiles(
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> list[ChildProfile]:
    return get_child_profiles_by_parent(session, user.id)


@router.post("", response_model=ChildProfileRead)
def create_profile(
    body: ChildProfileCreate,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ChildProfile:
    profile = ChildProfile(parent_id=user.id, **body.model_dump())
    session.add(profile)
    session.flush()
    return profile


@router.get("/{profile_id}", response_model=ChildProfileRead)
def get_profile(
    profile_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ChildProfile:
    profile = session.get(ChildProfile, profile_id)
    if not profile or profile.parent_id != user.id:
        raise HalyoonError(HalyoonErrorCode.PROFILE_NOT_FOUND)
    return profile
