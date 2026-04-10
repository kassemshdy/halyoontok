FROM python:3.11-slim

WORKDIR /app

COPY backend/shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

COPY backend/admin-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/admin-api/app/ /app/app/

EXPOSE 8080
ENV PORT=8080
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
