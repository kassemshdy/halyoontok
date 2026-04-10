from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from halyoontok.auth.users import current_user
from halyoontok.db.engine.sql_engine import get_session_dep
from halyoontok.db.models import User
from halyoontok.services import profile_service

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
    child_id: int, user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> ParentalRuleRead:
    return ParentalRuleRead.model_validate(profile_service.get_parental_rules(session, child_id))


@router.put("/{child_id}")
def update_rules(
    child_id: int, body: ParentalRuleUpdate,
    user: User = Depends(current_user), session: Session = Depends(get_session_dep),
) -> ParentalRuleRead:
    return ParentalRuleRead.model_validate(
        profile_service.update_parental_rules(session, child_id, **body.model_dump(exclude_unset=True))
    )
