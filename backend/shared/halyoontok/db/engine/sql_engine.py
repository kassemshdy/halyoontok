from __future__ import annotations
from typing import Optional
from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

from halyoontok.configs.app_configs import (
    DATABASE_URL,
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_POOL_OVERFLOW,
    POSTGRES_POOL_SIZE,
    POSTGRES_PORT,
    POSTGRES_USER,
)


def build_connection_string() -> str:
    if DATABASE_URL:
        return DATABASE_URL
    return (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )


class SqlEngine:
    _engine: Engine | None = None
    _session_factory: sessionmaker | None = None

    @classmethod
    def init_engine(cls) -> Engine:
        if cls._engine is None:
            cls._engine = create_engine(
                build_connection_string(),
                pool_size=POSTGRES_POOL_SIZE,
                max_overflow=POSTGRES_POOL_OVERFLOW,
                pool_pre_ping=True,
            )
            cls._session_factory = sessionmaker(
                bind=cls._engine, expire_on_commit=False
            )
        return cls._engine

    @classmethod
    def get_engine(cls) -> Engine:
        if cls._engine is None:
            return cls.init_engine()
        return cls._engine

    @classmethod
    def get_session_factory(cls) -> sessionmaker:
        if cls._session_factory is None:
            cls.init_engine()
        assert cls._session_factory is not None
        return cls._session_factory

    @classmethod
    def reset_engine(cls) -> None:
        if cls._engine:
            cls._engine.dispose()
            cls._engine = None
            cls._session_factory = None


@contextmanager
def get_session() -> Generator[Session, None, None]:
    factory = SqlEngine.get_session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session_dep() -> Generator[Session, None, None]:
    """FastAPI dependency for request-scoped DB sessions."""
    factory = SqlEngine.get_session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
