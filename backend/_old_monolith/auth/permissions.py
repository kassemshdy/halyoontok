from fastapi import Depends

from halyoontok.auth.users import current_user
from halyoontok.configs.constants import UserRole
from halyoontok.db.models import User
from halyoontok.error_handling.error_codes import HalyoonErrorCode
from halyoontok.error_handling.exceptions import HalyoonError


def require_role(*roles: UserRole):
    def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HalyoonError(
                HalyoonErrorCode.UNAUTHORIZED,
                f"Requires one of: {[r.value for r in roles]}",
            )
        return user

    return dependency


require_admin = require_role(UserRole.ADMIN)
require_moderator = require_role(UserRole.ADMIN, UserRole.MODERATOR)
require_editor = require_role(UserRole.ADMIN, UserRole.MODERATOR, UserRole.EDITOR)
require_parent = require_role(UserRole.PARENT)
