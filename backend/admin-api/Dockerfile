FROM python:3.11-slim

WORKDIR /app

COPY backend/shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

COPY backend/admin-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt alembic

COPY backend/admin-api/app/ /app/app/
COPY backend/alembic/ /app/alembic/
COPY backend/alembic.ini /app/alembic.ini

EXPOSE 8080
ENV PORT=8080
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
