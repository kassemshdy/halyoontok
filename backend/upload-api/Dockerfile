FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/shared/ /app/shared/
RUN pip install --no-cache-dir /app/shared

COPY backend/upload-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/upload-api/app/ /app/app/

EXPOSE 8082
ENV PORT=8082
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
