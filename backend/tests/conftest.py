"""Shared fixtures for integration tests.

Uses a real Postgres test DB. Set DATABASE_URL env var or defaults to halyoontok_test.
"""
from __future__ import annotations

import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from halyoontok.db.models import Base
from halyoontok.db.engine.sql_engine import SqlEngine


TEST_DB_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://halyoontok:halyoontok@localhost:5432/halyoontok_test",
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test DB tables once per test session."""
    # Create test database if it doesn't exist
    base_url = TEST_DB_URL.rsplit("/", 1)[0]
    db_name = TEST_DB_URL.rsplit("/", 1)[1]

    engine = create_engine(f"{base_url}/postgres", isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        exists = conn.execute(
            text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        ).fetchone()
        if not exists:
            conn.execute(text(f"CREATE DATABASE {db_name}"))
    engine.dispose()

    # Create all tables
    test_engine = create_engine(TEST_DB_URL)
    Base.metadata.create_all(test_engine)
    test_engine.dispose()

    yield

    # Cleanup: drop all tables after session
    test_engine = create_engine(TEST_DB_URL)
    Base.metadata.drop_all(test_engine)
    test_engine.dispose()


@pytest.fixture
def session() -> Session:
    """Provide a transactional DB session that rolls back after each test."""
    engine = create_engine(TEST_DB_URL)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    session = factory()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        engine.dispose()


@pytest.fixture
def admin_user(session: Session):
    """Create an admin user for tests."""
    from halyoontok.services.auth_service import register_user
    try:
        user = register_user(session, "testadmin@test.com", "testpass123", "admin")
        session.commit()
        return user
    except Exception:
        session.rollback()
        from halyoontok.db.users import get_user_by_email
        return get_user_by_email(session, "testadmin@test.com")


@pytest.fixture
def parent_user(session: Session):
    """Create a parent user for tests."""
    from halyoontok.services.auth_service import register_user
    try:
        user = register_user(session, "testparent@test.com", "testpass123", "parent")
        session.commit()
        return user
    except Exception:
        session.rollback()
        from halyoontok.db.users import get_user_by_email
        return get_user_by_email(session, "testparent@test.com")


@pytest.fixture
def auth_token(admin_user):
    """Get a JWT token for the admin user."""
    from halyoontok.auth.users import create_access_token
    return create_access_token(admin_user.id)
