FROM python:3.11-slim

WORKDIR /app

COPY backend/media-api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/media-api/app/ /app/app/

RUN mkdir -p /storage/videos /storage/thumbnails /storage/images

EXPOSE 8083
ENV PORT=8083
ENV MEDIA_STORAGE_DIR=/storage
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
