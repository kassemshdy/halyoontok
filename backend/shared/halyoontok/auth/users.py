from datetime import datetime
from datetime import timedelta
from datetime import timezone

from fastapi import Depends
from fastapi import Request
from jose import JWTError
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from halyoontok.configs.app_configs import JWT_ALGORITHM
from halyoontok.configs.app_configs import JWT_EXPIRATION_MINUTES
from halyoontok.configs.app_configs import JWT_SECRET
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def current_user(
    request: Request,
    session: Session = Depends(get_session_dep),
) -> User:
    token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    if not token:
        raise HalyoonError(HalyoonErrorCode.UNAUTHENTICATED, "Missing token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HalyoonError(HalyoonErrorCode.UNAUTHENTICATED, "Invalid token")

    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise HalyoonError(HalyoonErrorCode.UNAUTHENTICATED, "User not found")
    return user
