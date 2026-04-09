from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_admin
from halyoontok.configs.constants import UserRole
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/users", tags=["users"])


class UserRead(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool
    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: UserRole


@router.get("")
def list_users(
    user: User = Depends(require_admin),
    session: Session = Depends(get_session_dep),
) -> list[UserRead]:
    users = session.query(User).order_by(User.created_at.desc()).all()
    return [UserRead.model_validate(u) for u in users]


@router.patch("/{user_id}/role")
def update_user_role(
    user_id: int,
    body: UserRoleUpdate,
    user: User = Depends(require_admin),
    session: Session = Depends(get_session_dep),
) -> UserRead:
    target = session.get(User, user_id)
    if not target:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "User not found")
    target.role = body.role
    session.flush()
    return UserRead.model_validate(target)
