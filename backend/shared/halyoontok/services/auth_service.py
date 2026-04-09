from __future__ import annotations
from typing import Optional

from sqlalchemy.orm import Session

from halyoontok.auth.users import hash_password, verify_password, create_access_token
from halyoontok.db.models import User
from halyoontok.db.users import get_user_by_email
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError


def register_user(session: Session, email: str, password: str, role: str = "parent") -> User:
    if get_user_by_email(session, email):
        raise HalyoonError(HalyoonErrorCode.CONFLICT, "Email already registered")
    user = User(email=email, hashed_password=hash_password(password), role=role)
    session.add(user)
    session.flush()
    return user


def login_user(session: Session, email: str, password: str) -> str:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HalyoonError(HalyoonErrorCode.UNAUTHENTICATED, "Invalid credentials")
    return create_access_token(user.id)
