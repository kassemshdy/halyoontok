from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ParentalRule, User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/parent-controls", tags=["parent-controls"])


class ParentalRuleUpdate(BaseModel):
    daily_limit_minutes: Optional[int] = None
    bedtime_start: Optional[str] = None
    bedtime_end: Optional[str] = None
    education_priority: Optional[int] = None
    allowed_categories: Optional[dict] = None
    language_preferences: Optional[dict] = None


class ParentalRuleRead(BaseModel):
    id: int
    child_profile_id: int
    daily_limit_minutes: int
    bedtime_start: Optional[str]
    bedtime_end: Optional[str]
    education_priority: int
    allowed_categories: Optional[dict]
    language_preferences: Optional[dict]
    model_config = {"from_attributes": True}


@router.get("/{child_id}")
def get_rules(
    child_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ParentalRuleRead:
    rule = session.query(ParentalRule).filter(ParentalRule.child_profile_id == child_id).first()
    if not rule:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "No rules for this child")
    return ParentalRuleRead.model_validate(rule)


@router.put("/{child_id}")
def update_rules(
    child_id: int,
    body: ParentalRuleUpdate,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ParentalRuleRead:
    rule = session.query(ParentalRule).filter(ParentalRule.child_profile_id == child_id).first()
    if not rule:
        rule = ParentalRule(child_profile_id=child_id)
        session.add(rule)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    session.flush()
    return ParentalRuleRead.model_validate(rule)
