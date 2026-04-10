"""Integration tests for auth service."""
from __future__ import annotations

import pytest
from halyoontok.services.auth_service import register_user, login_user
from halyoontok.error_handling.exceptions import HalyoonError


def test_register_user(session):
    user = register_user(session, "newuser@test.com", "password123", "parent")
    session.commit()
    assert user.id is not None
    assert user.email == "newuser@test.com"
    role = user.role.value if hasattr(user.role, "value") else user.role
    assert role == "parent"


def test_register_duplicate_email(session):
    register_user(session, "dup@test.com", "pass123", "parent")
    session.commit()
    with pytest.raises(HalyoonError) as exc:
        register_user(session, "dup@test.com", "pass456", "parent")
    assert "already registered" in str(exc.value)


def test_login_user(session):
    register_user(session, "logintest@test.com", "mypassword", "admin")
    session.commit()
    token = login_user(session, "logintest@test.com", "mypassword")
    assert token is not None
    assert len(token) > 20  # JWT should be a long string


def test_login_wrong_password(session):
    register_user(session, "wrongpass@test.com", "correct", "parent")
    session.commit()
    with pytest.raises(HalyoonError):
        login_user(session, "wrongpass@test.com", "incorrect")


def test_login_nonexistent_user(session):
    with pytest.raises(HalyoonError):
        login_user(session, "nobody@test.com", "anything")
