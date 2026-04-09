from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from halyoontok.auth.schemas import LoginRequest, TokenResponse, UserCreate, UserRead
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(body: UserCreate, session: Session = Depends(get_session_dep)) -> UserRead:
    user = auth_service.register_user(session, body.email, body.password, body.role.value)
    return UserRead.model_validate(user)


@router.post("/login")
def login(body: LoginRequest, session: Session = Depends(get_session_dep)) -> TokenResponse:
    token = auth_service.login_user(session, body.email, body.password)
    return TokenResponse(access_token=token)
