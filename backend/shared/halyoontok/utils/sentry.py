"""Initialize Sentry for backend services. No-op if SENTRY_DSN is not set."""
from __future__ import annotations

import os


def init_sentry(service_name: str) -> None:
    dsn = os.environ.get("SENTRY_DSN", "")
    if not dsn:
        return

    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    sentry_sdk.init(
        dsn=dsn,
        environment=os.environ.get("SENTRY_ENVIRONMENT", "production"),
        traces_sample_rate=float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        server_name=service_name,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
    )
