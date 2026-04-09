import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from halyoontok.error_handling.error_codes import HalyoonErrorCode

logger = logging.getLogger(__name__)


class HalyoonError(Exception):
    def __init__(
        self,
        error_code: HalyoonErrorCode,
        detail: str | None = None,
        status_code_override: int | None = None,
    ):
        self.error_code = error_code
        self.detail = detail or error_code.code_string
        self.status_code = status_code_override or error_code.default_status_code
        super().__init__(self.detail)


async def _halyoon_error_handler(request: Request, exc: HalyoonError) -> JSONResponse:
    logger.warning(
        f"HalyoonError: {exc.error_code.code_string} - {exc.detail} "
        f"(status={exc.status_code}, path={request.url.path})"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code.code_string,
            "detail": exc.detail,
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HalyoonError, _halyoon_error_handler)
