"""Integration tests for profile service."""
from __future__ import annotations

import pytest
from halyoontok.configs.constants import AgeBand, Language, Dialect
from halyoontok.services.profile_service import (
    create_profile, list_profiles, get_profile, get_parental_rules, update_parental_rules,
)
from halyoontok.error_handling.exceptions import HalyoonError


def test_create_profile(session, parent_user):
    profile = create_profile(
        session, parent_user.id,
        display_name="Sara", age=10, age_band=AgeBand.AGE_8_12,
        language=Language.ARABIC, dialect=Dialect.LEBANESE, country="LB",
    )
    session.commit()
    assert profile.id is not None
    assert profile.display_name == "Sara"
    assert profile.parent_id == parent_user.id


def test_list_profiles(session, parent_user):
    create_profile(session, parent_user.id, display_name="Child1", age=8, age_band=AgeBand.AGE_8_12)
    create_profile(session, parent_user.id, display_name="Child2", age=12, age_band=AgeBand.AGE_8_12)
    session.commit()
    profiles = list_profiles(session, parent_user.id)
    assert len(profiles) >= 2


def test_get_profile(session, parent_user):
    profile = create_profile(session, parent_user.id, display_name="FindMe", age=9, age_band=AgeBand.AGE_8_12)
    session.commit()
    found = get_profile(session, profile.id, parent_user.id)
    assert found.display_name == "FindMe"


def test_get_profile_wrong_parent(session, parent_user):
    profile = create_profile(session, parent_user.id, display_name="WrongParent", age=10, age_band=AgeBand.AGE_8_12)
    session.commit()
    with pytest.raises(HalyoonError):
        get_profile(session, profile.id, parent_id=999999)


def test_update_parental_rules(session, parent_user):
    profile = create_profile(session, parent_user.id, display_name="RulesKid", age=10, age_band=AgeBand.AGE_8_12)
    session.commit()

    rules = update_parental_rules(session, profile.id, daily_limit_minutes=45, education_priority=8)
    session.commit()

    assert rules.daily_limit_minutes == 45
    assert rules.education_priority == 8


def test_get_parental_rules(session, parent_user):
    profile = create_profile(session, parent_user.id, display_name="GetRules", age=11, age_band=AgeBand.AGE_8_12)
    session.commit()
    update_parental_rules(session, profile.id, daily_limit_minutes=30)
    session.commit()

    rules = get_parental_rules(session, profile.id)
    assert rules.daily_limit_minutes == 30
