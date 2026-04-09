from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.permissions import require_admin
from halyoontok.configs.constants import UserRole
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import user_service

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
    user: User = Depends(require_admin), session: Session = Depends(get_session_dep),
) -> list[UserRead]:
    return [UserRead.model_validate(u) for u in user_service.list_users(session)]


@router.patch("/{user_id}/role")
def update_role(
    user_id: int, body: UserRoleUpdate,
    user: User = Depends(require_admin), session: Session = Depends(get_session_dep),
) -> UserRead:
    return UserRead.model_validate(user_service.update_user_role(session, user_id, body.role))
