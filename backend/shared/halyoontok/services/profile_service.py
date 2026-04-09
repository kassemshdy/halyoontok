from __future__ import annotations

from sqlalchemy.orm import Session

from halyoontok.db.models import ChildProfile, ParentalRule
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError


def list_profiles(session: Session, parent_id: int) -> list[ChildProfile]:
    return (
        session.query(ChildProfile)
        .filter(ChildProfile.parent_id == parent_id)
        .all()
    )


def create_profile(session: Session, parent_id: int, **kwargs) -> ChildProfile:
    profile = ChildProfile(parent_id=parent_id, **kwargs)
    session.add(profile)
    session.flush()
    return profile


def get_profile(session: Session, profile_id: int, parent_id: int) -> ChildProfile:
    profile = session.get(ChildProfile, profile_id)
    if not profile or profile.parent_id != parent_id:
        raise HalyoonError(HalyoonErrorCode.PROFILE_NOT_FOUND)
    return profile


def get_parental_rules(session: Session, child_id: int) -> ParentalRule:
    rule = session.query(ParentalRule).filter(ParentalRule.child_profile_id == child_id).first()
    if not rule:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "No rules for this child")
    return rule


def update_parental_rules(session: Session, child_id: int, **kwargs) -> ParentalRule:
    rule = session.query(ParentalRule).filter(ParentalRule.child_profile_id == child_id).first()
    if not rule:
        rule = ParentalRule(child_profile_id=child_id)
        session.add(rule)
    for key, value in kwargs.items():
        if value is not None:
            setattr(rule, key, value)
    session.flush()
    return rule
