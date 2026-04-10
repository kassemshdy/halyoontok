from __future__ import annotations

from sqlalchemy.orm import Session

from halyoontok.configs.constants import UserRole
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError


def list_users(session: Session) -> list[User]:
    return session.query(User).order_by(User.created_at.desc()).all()


def update_user_role(session: Session, user_id: int, role: UserRole) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "User not found")
    user.role = role
    session.flush()
    return user
