from enum import Enum


class HalyoonErrorCode(Enum):
    # (code_string, default_http_status)
    UNAUTHENTICATED = ("unauthenticated", 401)
    UNAUTHORIZED = ("unauthorized", 403)
    NOT_FOUND = ("not_found", 404)
    CONFLICT = ("conflict", 409)
    VALIDATION_ERROR = ("validation_error", 422)
    RATE_LIMITED = ("rate_limited", 429)
    INTERNAL_ERROR = ("internal_error", 500)
    BAD_GATEWAY = ("bad_gateway", 502)

    # Domain-specific
    CONTENT_NOT_FOUND = ("content_not_found", 404)
    PROFILE_NOT_FOUND = ("profile_not_found", 404)
    VIDEO_NOT_FOUND = ("video_not_found", 404)
    MODERATION_REQUIRED = ("moderation_required", 403)
    INVALID_WORKFLOW_TRANSITION = ("invalid_workflow_transition", 400)

    @property
    def code_string(self) -> str:
        return self.value[0]

    @property
    def default_status_code(self) -> int:
        return self.value[1]
