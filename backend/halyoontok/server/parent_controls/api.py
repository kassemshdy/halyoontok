from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import ParentalRule
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError

router = APIRouter(prefix="/parent-controls", tags=["parent-controls"])


class ParentalRuleUpdate(BaseModel):
    daily_limit_minutes: int | None = None
    bedtime_start: str | None = None
    bedtime_end: str | None = None
    education_priority: int | None = None
    allowed_categories: dict | None = None
    language_preferences: dict | None = None


class ParentalRuleRead(BaseModel):
    id: int
    child_profile_id: int
    daily_limit_minutes: int
    bedtime_start: str | None
    bedtime_end: str | None
    education_priority: int
    allowed_categories: dict | None
    language_preferences: dict | None

    model_config = {"from_attributes": True}


@router.get("/{child_id}", response_model=ParentalRuleRead)
def get_rules(
    child_id: int,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ParentalRule:
    rule = (
        session.query(ParentalRule)
        .filter(ParentalRule.child_profile_id == child_id)
        .first()
    )
    if not rule:
        raise HalyoonError(HalyoonErrorCode.NOT_FOUND, "No rules for this child")
    return rule


@router.put("/{child_id}", response_model=ParentalRuleRead)
def update_rules(
    child_id: int,
    body: ParentalRuleUpdate,
    user: User = Depends(current_user),
    session: Session = Depends(get_session_dep),
) -> ParentalRule:
    rule = (
        session.query(ParentalRule)
        .filter(ParentalRule.child_profile_id == child_id)
        .first()
    )
    if not rule:
        rule = ParentalRule(child_profile_id=child_id)
        session.add(rule)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    session.flush()
    return rule
