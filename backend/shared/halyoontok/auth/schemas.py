from pydantic import BaseModel
from pydantic import EmailStr

from halyoontok.configs.constants import AgeBand
from halyoontok.configs.constants import Dialect
from halyoontok.configs.constants import Language
from halyoontok.configs.constants import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.PARENT


class UserRead(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChildProfileCreate(BaseModel):
    display_name: str
    age: int
    age_band: AgeBand
    language: Language = Language.ARABIC
    dialect: Dialect = Dialect.MSA
    country: str = "LB"


class ChildProfileRead(BaseModel):
    id: int
    parent_id: int
    display_name: str
    age: int
    age_band: AgeBand
    language: Language
    dialect: Dialect
    country: str

    model_config = {"from_attributes": True}
