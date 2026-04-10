from __future__ import annotations
from typing import Optional
from sqlalchemy.orm import Session

from halyoontok.db.models import ChildProfile
from halyoontok.db.models import User


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return session.query(User).filter(User.email == email).first()


def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)


def create_user(session: Session, user: User) -> User:
    session.add(user)
    session.flush()
    return user


def get_child_profiles_by_parent(
    session: Session, parent_id: int
) -> list[ChildProfile]:
    return (
        session.query(ChildProfile)
        .filter(ChildProfile.parent_id == parent_id)
        .all()
    )


def get_child_profile_by_id(session: Session, profile_id: int) -> Optional[ChildProfile]:
    return session.get(ChildProfile, profile_id)
