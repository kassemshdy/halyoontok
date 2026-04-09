from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from halyoontok.auth.schemas import LoginRequest, TokenResponse, UserCreate, UserRead
from halyoontok.auth.users import create_access_token, hash_password, verify_password
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.db.users import get_user_by_email
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(
    body: UserCreate,
    session: Session = Depends(get_session_dep),
) -> UserRead:
    if get_user_by_email(session, body.email):
        raise HalyoonError(HalyoonErrorCode.CONFLICT, "Email already registered")
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    session.add(user)
    session.flush()
    return UserRead.model_validate(user)


@router.post("/login")
def login(
    body: LoginRequest,
    session: Session = Depends(get_session_dep),
) -> TokenResponse:
    user = get_user_by_email(session, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HalyoonError(HalyoonErrorCode.UNAUTHENTICATED, "Invalid credentials")
    return TokenResponse(access_token=create_access_token(user.id))
